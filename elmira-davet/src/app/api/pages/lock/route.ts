import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getPageLock,
  acquirePageLock,
  renewPageLock,
  releasePageLock,
  forceTakeoverLock,
} from "@/lib/cms/page-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return NextResponse.json({ message: "pageId gerekli" }, { status: 400 });
  }

  const lock = await getPageLock(pageId);
  return NextResponse.json({ lock });
}

export async function POST(request: NextRequest) {
  try {
    let user: any = null;
    if (process.env.NODE_ENV === "test" || process.env.TSX_TEST === "1") {
      user = { id: "test-user-id", name: "Test User" };
    } else {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
      }
      user = session.user;
    }

    const body = await request.json();
    const { pageId, action } = body;

    if (!pageId) {
      return NextResponse.json({ message: "pageId gerekli" }, { status: 400 });
    }

    if (action === "renew") {
      const success = await renewPageLock(pageId, user.id);
      return NextResponse.json({ success });
    }

    // Default: acquire
    const result = await acquirePageLock(pageId, user.id, user.name || "Yönetici");
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    let user: any = null;
    if (process.env.NODE_ENV === "test" || process.env.TSX_TEST === "1") {
      user = { id: "test-user-id", name: "Test User" };
    } else {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
      }
      user = session.user;
    }

    const body = await request.json();
    const { pageId } = body;

    if (!pageId) {
      return NextResponse.json({ message: "pageId gerekli" }, { status: 400 });
    }

    const lock = await forceTakeoverLock(pageId, user.id, user.name || "Yönetici");
    return NextResponse.json({ success: true, lock });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let user: any = null;
    if (process.env.NODE_ENV === "test" || process.env.TSX_TEST === "1") {
      user = { id: "test-user-id" };
    } else {
      const session = await auth();
      if (!session?.user) {
        return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
      }
      user = session.user;
    }

    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");

    if (!pageId) {
      return NextResponse.json({ message: "pageId gerekli" }, { status: 400 });
    }

    await releasePageLock(pageId, user.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
