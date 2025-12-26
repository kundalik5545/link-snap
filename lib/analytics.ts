import { UAParser } from "ua-parser-js";
import prisma from "@/lib/prisma";

export type DeviceType = "Desktop" | "Mobile" | "Tablet";

/**
 * Detect device type from user agent
 */
export function detectDeviceType(userAgent: string | null): DeviceType | null {
  if (!userAgent) return null;

  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();

  if (device.type === "mobile" || device.type === "tablet") {
    return device.type === "tablet" ? "Tablet" : "Mobile";
  }

  // Check OS for mobile/tablet
  if (
    os.name?.toLowerCase().includes("android") ||
    os.name?.toLowerCase().includes("ios")
  ) {
    return "Mobile";
  }

  return "Desktop";
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(headers: Headers): string | null {
  // Check various headers for IP address
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return null;
}

/**
 * Track a click event
 */
export async function trackClick(
  linkId: string,
  request: {
    userAgent: string | null;
    ipAddress: string | null;
    referrer: string | null;
  }
) {
  const deviceType = detectDeviceType(request.userAgent);

  await prisma.linkAnalytics.create({
    data: {
      linkId,
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
      deviceType,
      referrer: request.referrer,
    },
  });
}

/**
 * Get analytics summary for a link
 */
export async function getLinkAnalytics(linkId: string) {
  const analytics = await prisma.linkAnalytics.findMany({
    where: { linkId },
    orderBy: { clickedAt: "desc" },
  });

  const totalClicks = analytics.length;
  const uniqueVisitors = new Set(
    analytics.map((a) => a.ipAddress).filter(Boolean)
  ).size;

  const deviceDistribution = analytics.reduce((acc, a) => {
    const device = a.deviceType || "Unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryDistribution = analytics.reduce((acc, a) => {
    const country = a.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalClicks,
    uniqueVisitors,
    deviceDistribution,
    countryDistribution,
    clicks: analytics,
  };
}

/**
 * Get aggregated analytics for all links
 */
export async function getAggregatedAnalytics() {
  const [links, analytics] = await Promise.all([
    prisma.link.findMany({
      include: {
        analytics: true,
      },
    }),
    prisma.linkAnalytics.findMany({
      orderBy: { clickedAt: "desc" },
    }),
  ]);

  const totalClicks = analytics.length;
  const activeLinks = links.filter((link) => link.analytics.length > 0).length;

  // Calculate mobile traffic percentage
  const mobileClicks = analytics.filter(
    (a) => a.deviceType === "Mobile"
  ).length;
  const mobileTraffic =
    totalClicks > 0 ? (mobileClicks / totalClicks) * 100 : 0;

  // Device distribution
  const deviceDistribution = analytics.reduce((acc, a) => {
    const device = a.deviceType || "Unknown";
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Country distribution
  const countryDistribution = analytics.reduce((acc, a) => {
    const country = a.country || "Unknown";
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get clicks over time (last 7 months)
  const now = new Date();
  const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

  const clicksByMonth = analytics
    .filter((a) => a.clickedAt >= sevenMonthsAgo)
    .reduce((acc, a) => {
      const month = new Date(a.clickedAt).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Get daily clicks for last 7 days
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dailyClicks = analytics
    .filter((a) => a.clickedAt >= sevenDaysAgo)
    .reduce((acc, a) => {
      const date = new Date(a.clickedAt).toISOString().split("T")[0]; // YYYY-MM-DD
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Get unique visitors per day
  const uniqueVisitorsByDay = analytics
    .filter((a) => a.clickedAt >= sevenDaysAgo && a.ipAddress)
    .reduce((acc, a) => {
      const date = new Date(a.clickedAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = new Set<string>();
      }
      acc[date].add(a.ipAddress!);
      return acc;
    }, {} as Record<string, Set<string>>);

  const uniqueVisitorsDaily = Object.entries(uniqueVisitorsByDay).reduce(
    (acc, [date, visitors]) => {
      acc[date] = visitors.size;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalClicks,
    activeLinks,
    mobileTraffic: Number(mobileTraffic.toFixed(1)),
    deviceDistribution,
    countryDistribution,
    clicksByMonth,
    dailyClicks,
    uniqueVisitorsDaily,
  };
}
