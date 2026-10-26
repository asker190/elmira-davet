import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import {
  getPageById,
  getAllPages,
  getRevisionsByPageId,
  acquirePageLock,
} from "@/lib/cms/page-service";
import { EditorClient } from "@/components/admin/editor/editor-client";

export const metadata = {
  title: "Sayfa Editörü | Elmira Davet Yönetim Paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminPageEditor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  let user = session?.user;
  if (!user) {
    if (process.env.NODE_ENV === "development") {
      user = {
        id: "default-admin",
        name: "Yönetici Admin",
        email: "admin@elmiradavet.com",
        role: "ADMIN" as any,
      };
    } else {
      redirect("/admin/giris");
    }
  }

  const page = await getPageById(id);
  if (!page) {
    notFound();
  }

  // Acquire or check lock (PG-K-01)
  await acquirePageLock(
    page.id,
    user.id || "admin-user",
    user.name || "Yönetici"
  );

  const [allPages, revisions] = await Promise.all([
    getAllPages({ status: "ALL" }),
    getRevisionsByPageId(page.id),
  ]);

  return (
    <EditorClient
      initialPage={page}
      allPages={allPages}
      initialRevisions={revisions}
      currentUser={{
        id: user.id || "admin-user",
        name: user.name || "Yönetici",
        role: ((user as any)?.role as "ADMIN" | "EDITOR") || "ADMIN",
      }}
    />
  );
}
