import { UAParser } from "ua-parser-js";
import prisma from "@/lib/prisma";

export type DeviceType = "Desktop" | "Mobile" | "Tablet";
export type SourceType = "Direct" | "Social" | "Email" | "Website";

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
 * Detect browser type from user agent
 */
export function detectBrowser(userAgent: string | null): string | null {
  if (!userAgent) return null;

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();

  return browser.name || null;
}

/**
 * Categorize referrer source
 */
export function categorizeSource(referrer: string | null): SourceType {
  if (!referrer || referrer.trim() === "") {
    return "Direct";
  }

  const referrerLower = referrer.toLowerCase();

  // Social media platforms
  const socialDomains = [
    "twitter.com",
    "x.com",
    "linkedin.com",
    "facebook.com",
    "instagram.com",
    "whatsapp.com",
    "wa.me",
    "t.me",
    "reddit.com",
    "pinterest.com",
    "tiktok.com",
    "youtube.com",
    "snapchat.com",
  ];

  for (const domain of socialDomains) {
    if (referrerLower.includes(domain)) {
      return "Social";
    }
  }

  // Email clients
  const emailDomains = [
    "mail.google.com",
    "outlook.com",
    "mail.yahoo.com",
    "mail.aol.com",
    "mail.com",
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "icloud.com",
    "protonmail.com",
  ];

  for (const domain of emailDomains) {
    if (referrerLower.includes(domain)) {
      return "Email";
    }
  }

  // If it's a valid URL, it's a website
  try {
    new URL(referrer);
    return "Website";
  } catch {
    return "Direct";
  }
}

/**
 * Get location data from IP address using ip-api.com (free tier)
 */
export async function getLocationFromIp(ipAddress: string | null): Promise<{
  country: string | null;
  city: string | null;
  timezone: string | null;
}> {
  if (!ipAddress) {
    return { country: null, city: null, timezone: null };
  }

  // Skip localhost and private IPs
  if (
    ipAddress === "127.0.0.1" ||
    ipAddress === "::1" ||
    ipAddress.startsWith("192.168.") ||
    ipAddress.startsWith("10.") ||
    ipAddress.startsWith("172.16.") ||
    ipAddress.startsWith("172.17.") ||
    ipAddress.startsWith("172.18.") ||
    ipAddress.startsWith("172.19.") ||
    ipAddress.startsWith("172.20.") ||
    ipAddress.startsWith("172.21.") ||
    ipAddress.startsWith("172.22.") ||
    ipAddress.startsWith("172.23.") ||
    ipAddress.startsWith("172.24.") ||
    ipAddress.startsWith("172.25.") ||
    ipAddress.startsWith("172.26.") ||
    ipAddress.startsWith("172.27.") ||
    ipAddress.startsWith("172.28.") ||
    ipAddress.startsWith("172.29.") ||
    ipAddress.startsWith("172.30.") ||
    ipAddress.startsWith("172.31.")
  ) {
    return { country: null, city: null, timezone: null };
  }

  try {
    // Use ip-api.com free tier (45 requests/minute)
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,city,timezone`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { country: null, city: null, timezone: null };
    }

    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country || null,
        city: data.city || null,
        timezone: data.timezone || null,
      };
    }
  } catch (error) {
    // Silently fail - don't block the request if geo lookup fails
    console.error("Error looking up IP location:", error);
  }

  return { country: null, city: null, timezone: null };
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
  const browser = detectBrowser(request.userAgent);
  const sourceType = categorizeSource(request.referrer);
  
  // Get location data (async, but we'll wait for it)
  const location = await getLocationFromIp(request.ipAddress);

  await prisma.linkAnalytics.create({
    data: {
      linkId,
      userAgent: request.userAgent,
      ipAddress: request.ipAddress,
      deviceType,
      browser,
      referrer: request.referrer,
      sourceType,
      country: location.country,
      city: location.city,
      timezone: location.timezone,
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

  // Browser distribution
  const browserDistribution = analytics.reduce((acc, a) => {
    const browser = a.browser || "Unknown";
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Source type distribution
  const sourceDistribution = analytics.reduce((acc, a) => {
    const source = a.sourceType || "Unknown";
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalClicks,
    uniqueVisitors,
    deviceDistribution,
    countryDistribution,
    browserDistribution,
    sourceDistribution,
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

  // Browser distribution
  const browserDistribution = analytics.reduce((acc, a) => {
    const browser = a.browser || "Unknown";
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Source type distribution
  const sourceDistribution = analytics.reduce((acc, a) => {
    const source = a.sourceType || "Unknown";
    acc[source] = (acc[source] || 0) + 1;
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
    browserDistribution,
    sourceDistribution,
    clicksByMonth,
    dailyClicks,
    uniqueVisitorsDaily,
  };
}
