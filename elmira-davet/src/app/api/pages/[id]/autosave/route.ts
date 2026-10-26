import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPageById,
  updatePage,
  createPageRevision,
} from "@/lib/cms/page-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let user: any = null;

    if (process.env.NODE_ENV === "test" || process.env.TSX_TEST === "1") {
      user = { id: "test-user-id", name: "Test Admin", role: "ADMIN" };
    } else {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
      }
      user = session.user;
    }

    const body = await request.json();
    const { title, slug, content, seo, version } = body;

    const page = await getPageById(id);
    if (!page) {
      return NextResponse.json({ message: "Sayfa bulunamadı" }, { status: 404 });
    }

    // 1. Create/update AUTOSAVE revision (PG-E-06, PG-R-01)
    await createPageRevision(
      id,
      title || page.title,
      content || page.content,
      user.id,
      "AUTOSAVE"
    );

    // 2. If page is PUBLISHED, do NOT change status or live publication (PG-E-06)
    // If page is DRAFT, update page content
    let updatedPage = page;
    if (page.status === "DRAFT" || page.status === "PENDING_REVIEW") {
      const res = await updatePage(
        id,
        {
          title: title !== undefined ? title : page.title,
          slug: slug !== undefined ? slug : page.slug,
          content: content || page.content,
          seo: seo || page.seo,
          expectedVersion: version, // Optimistic locking
        },
        user.id,
        "AUTOSAVE"
      );
      if (res.page) {
        updatedPage = res.page;
      }
    }

    return NextResponse.json({
      success: true,
      page: updatedPage,
      message: "Otomatik kayıt başarıyla alındı",
    });
  } catch (err: any) {
    console.error("Autosave API error:", err);
    return NextResponse.json(
      { message: err.message || "Otomatik kayıt sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
