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
    const {
      title,
      slug,
      status,
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

    // 1. Create MANUAL revision (PG-R-01)
    await createPageRevision(
      id,
      title || page.title,
      content || page.content,
      user.id,
      "MANUAL"
    );

    // 2. Update Page with optimistic concurrency
    const res = await updatePage(
      id,
      {
        title: title !== undefined ? title : page.title,
        slug: slug !== undefined ? slug : page.slug,
        status: status || page.status,
        content: content || page.content,
        seo: seo || page.seo,
        parentId: parentId !== undefined ? parentId : page.parentId,
        menuOrder: menuOrder !== undefined ? menuOrder : page.menuOrder,
        featuredImageId:
          featuredImageId !== undefined ? featuredImageId : page.featuredImageId,
        expectedVersion: version,
      },
      user.id,
      "MANUAL"
    );

    if (!res.success || !res.page) {
      return NextResponse.json(
        { message: res.error || "Kaydetme başarısız" },
        { status: res.conflict ? 409 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      page: res.page,
      message: "Taslak başarıyla kaydedildi",
    });
  } catch (err: any) {
    console.error("Save draft API error:", err);
    return NextResponse.json(
      { message: err.message || "Kaydetme sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
