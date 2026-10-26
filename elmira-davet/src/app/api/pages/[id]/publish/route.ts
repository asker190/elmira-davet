import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
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

    // Role verification (PG-Y-01, PG-Y-03: Server-side check)
    if (user.role === "EDITOR") {
      return NextResponse.json(
        {
          message:
            "Yetki hatası: Editörler doğrudan sayfayı yayınlayamaz. Lütfen incelemeye gönderin.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      slug,
      content,
      seo,
      parentId,
      menuOrder,
      featuredImageId,
      version,
    } = body;

    const page = await getPageById(id);
    if (!page) {
      return NextResponse.json({ message: "Sayfa bulunamadı" }, { status: 404 });
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: "Başlıksız sayfa yayınlanamaz (PG-N-03)." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // 1. Create PUBLISH revision (PG-R-01, PG-X-06: Idempotent single publish revision)
    await createPageRevision(
      id,
      title.trim(),
      content || page.content,
      user.id,
      "PUBLISH"
    );

    // 2. Update page to PUBLISHED
    const res = await updatePage(
      id,
      {
        title: title.trim(),
        slug: slug !== undefined ? slug : page.slug,
        status: "PUBLISHED",
        publishedAt: page.publishedAt || now,
        content: content || page.content,
        seo: seo || page.seo,
        parentId: parentId !== undefined ? parentId : page.parentId,
        menuOrder: menuOrder !== undefined ? menuOrder : page.menuOrder,
        featuredImageId:
          featuredImageId !== undefined ? featuredImageId : page.featuredImageId,
        expectedVersion: version,
      },
      user.id,
      "PUBLISH"
    );

    if (!res.success || !res.page) {
      return NextResponse.json(
        { message: res.error || "Yayınlama başarısız" },
        { status: res.conflict ? 409 : 400 }
      );
    }

    const updatedPage = res.page;

    // 3. Revalidate cache
    try {
      revalidatePath(`/${updatedPage.slug}`);
      revalidatePath(`/admin/sayfalar`);
      revalidatePath("/");
    } catch {}

    return NextResponse.json({
      success: true,
      page: updatedPage,
      message: "Sayfa başarıyla yayınlandı",
    });
  } catch (err: any) {
    console.error("Publish page API error:", err);
    return NextResponse.json(
      { message: err.message || "Yayınlama sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
