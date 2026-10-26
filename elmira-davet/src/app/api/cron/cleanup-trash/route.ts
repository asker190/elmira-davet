import { NextRequest, NextResponse } from "next/server";
import { getAllPages, permanentlyDeletePage } from "@/lib/cms/page-service";

export async function GET(request: NextRequest) {
  try {
    const trashedPages = await getAllPages({ status: "TRASH" });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const cleanedIds: string[] = [];

    for (const page of trashedPages) {
      if (page.trashedAt && new Date(page.trashedAt) <= thirtyDaysAgo) {
        // Only non-system pages (T-05)
        if (!page.isSystem) {
          await permanentlyDeletePage(page.id);
          cleanedIds.push(page.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      cleanedCount: cleanedIds.length,
      cleanedIds,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Trash cleanup cron error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
