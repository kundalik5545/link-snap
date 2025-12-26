import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  isValidUrl,
  normalizeUrl,
  generateUniqueShortCode,
  isAliasAvailable,
} from "@/lib/shortener";
import { getLinkAnalytics } from "@/lib/analytics";

const createLinkSchema = z.object({
  originalUrl: z.string().url("Invalid URL format"),
  customAlias: z.string().optional(),
  title: z.string().optional(),
});

// GET /api/links - Get all links
export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { analytics: true },
        },
      },
    });

    // Get analytics summary for each link
    const linksWithAnalytics = await Promise.all(
      links.map(async (link) => {
        const analytics = await getLinkAnalytics(link.id);
        return {
          ...link,
          clickCount: analytics.totalClicks,
        };
      })
    );

    return NextResponse.json(linksWithAnalytics);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST /api/links - Create a new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createLinkSchema.parse(body);

    // Validate URL
    if (!isValidUrl(validated.originalUrl)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(validated.originalUrl);

    // Check if custom alias is provided and available
    let shortCode: string;
    if (validated.customAlias) {
      const alias = validated.customAlias.trim();
      if (alias.length < 3) {
        return NextResponse.json(
          { error: "Custom alias must be at least 3 characters" },
          { status: 400 }
        );
      }

      const available = await isAliasAvailable(alias);
      if (!available) {
        return NextResponse.json(
          { error: "Custom alias already exists" },
          { status: 400 }
        );
      }

      shortCode = alias;
    } else {
      shortCode = await generateUniqueShortCode();
    }

    // Create the link
    const link = await prisma.link.create({
      data: {
        originalUrl: normalizedUrl,
        shortCode,
        customAlias: validated.customAlias || null,
        title: validated.title || null,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.format()[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}
