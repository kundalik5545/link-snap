import { NextResponse } from "next/server";
import { getAggregatedAnalytics } from "@/lib/analytics";

// GET /api/analytics - Get aggregated analytics data
export async function GET() {
  try {
    const analytics = await getAggregatedAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
