import { NextRequest, NextResponse } from "next/server";
import { trackClick, getClientIp } from "@/lib/analytics";
import prisma from "@/lib/prisma";

// GET /api/[shortCode] - Redirect to original URL and track click
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    // Find the link
    const link = await prisma.link.findUnique({
      where: { shortCode },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Track the click
    const userAgent = request.headers.get("user-agent");
    const ipAddress = getClientIp(request.headers);
    const referrer =
      request.headers.get("referer") || request.headers.get("referrer");

    await trackClick(link.id, {
      userAgent,
      ipAddress,
      referrer: referrer || null,
    });

    // Redirect to original URL
    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    return NextResponse.json({ error: "Failed to redirect" }, { status: 500 });
  }
}
