import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { addMediaToGallery, getAllMediaItems } from "@/lib/media-service";

export async function GET() {
  try {
    const items = await getAllMediaItems();
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Medya listesi alınamadı" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "Genel";
    const title = (formData.get("title") as string) || "";
    const alt = (formData.get("alt") as string) || "";
    const aspectRatio = (formData.get("aspectRatio") as string) || "16/9";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Yüklenecek dosya bulunamadı" },
        { status: 400 }
      );
    }

    // 10MB boyut kontrolü
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Dosya boyutu çok büyük (Maksimum 10MB)" },
        { status: 400 }
      );
    }

    // İzin verilen uzantılar
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".mp4"];
    const ext = path.extname(file.name).toLowerCase() || ".webp";

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Geçersiz dosya formatı (${ext}). İzin verilenler: ${allowedExtensions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Kayıt dizini (public/uploads)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
    const uniqueName = `elmira_${Date.now()}_${cleanBase}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    // Otomatik olarak Galeri Medya Veritabanına kaydet
    const mediaRecord = await addMediaToGallery({
      imageUrl: publicUrl,
      title: title || file.name.replace(/\.[^/.]+$/, ""),
      alt: alt || title || file.name,
      categoryId: category,
      aspectRatio,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueName,
      originalName: file.name,
      size: file.size,
      media: mediaRecord,
    });
  } catch (error: any) {
    console.error("Dosya yükleme hatası:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Dosya yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
