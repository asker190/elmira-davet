import { NextRequest, NextResponse } from "next/server";
import { getAllPages, updatePage, createPageRevision } from "@/lib/cms/page-service";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const scheduledPages = await getAllPages({ status: "SCHEDULED" });
    const now = new Date();
    const publishedList: string[] = [];

    for (const page of scheduledPages) {
      if (page.scheduledAt && new Date(page.scheduledAt) <= now) {
        // Idempotent publish check (PG-P-06, PG-X-06)
        await createPageRevision(
          page.id,
          page.title,
          page.content,
          page.authorId || null,
          "PUBLISH"
        );

        await updatePage(
          page.id,
          {
            status: "PUBLISHED",
            publishedAt: now.toISOString(),
            scheduledAt: null,
            expectedVersion: page.version,
          }
        );

        publishedList.push(page.slug);

        try {
          revalidatePath(`/${page.slug}`);
          revalidatePath("/");
        } catch {}
      }
    }

    return NextResponse.json({
      success: true,
      publishedCount: publishedList.length,
      publishedPages: publishedList,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error("Scheduled publish cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
