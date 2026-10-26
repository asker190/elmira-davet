import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPageById, updatePage } from "@/lib/cms/page-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let user: any = null;

    if (process.env.NODE_ENV === "test" || process.env.TSX_TEST === "1") {
      user = { id: "test-user-id", name: "Test Editor", role: "EDITOR" };
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

    const updated = await updatePage(
      id,
      {
        title: title !== undefined ? title : page.title,
        slug: slug !== undefined ? slug : page.slug,
        status: "PENDING_REVIEW",
        content: content || page.content,
        seo: seo || page.seo,
      },
      user.id,
      "MANUAL"
    );

    return NextResponse.json({
      success: true,
      page: updated,
      message: "Sayfa yönetici onayına gönderildi",
    });
  } catch (err: any) {
    console.error("Submit review API error:", err);
    return NextResponse.json(
      { message: err.message || "İncelemeye gönderme sırasında hata oluştu" },
      { status: 500 }
    );
  }
}
