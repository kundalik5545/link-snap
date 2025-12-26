import * as XLSX from 'xlsx';

interface LinkData {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
}

interface AnalyticsData {
  totalClicks: number;
  activeLinks: number;
  mobileTraffic: number;
  clicksByMonth: Record<string, number>;
  deviceDistribution: Record<string, number>;
  countryDistribution: Record<string, number>;
}

export function downloadExcelReport(links: LinkData[], analytics: AnalyticsData) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Links Overview
  const linksData = links.map((link) => ({
    'Short Code': link.shortCode,
    'Original URL': link.originalUrl,
    'Total Clicks': link.clickCount || 0,
    'Created Date': new Date(link.createdAt).toLocaleDateString(),
  }));

  const linksSheet = XLSX.utils.json_to_sheet(linksData);
  XLSX.utils.book_append_sheet(workbook, linksSheet, 'Links');

  // Sheet 2: Analytics Summary
  const analyticsData = [
    { Metric: 'Total Clicks', Value: analytics.totalClicks },
    { Metric: 'Active Links', Value: analytics.activeLinks },
    { Metric: 'Mobile Traffic (%)', Value: `${analytics.mobileTraffic}%` },
  ];

  const analyticsSheet = XLSX.utils.json_to_sheet(analyticsData);
  XLSX.utils.book_append_sheet(workbook, analyticsSheet, 'Analytics Summary');

  // Sheet 3: Device Distribution
  const deviceData = Object.entries(analytics.deviceDistribution).map(([device, count]) => ({
    Device: device,
    Clicks: count,
    Percentage: analytics.totalClicks > 0 ? `${((count / analytics.totalClicks) * 100).toFixed(1)}%` : '0%',
  }));

  const deviceSheet = XLSX.utils.json_to_sheet(deviceData);
  XLSX.utils.book_append_sheet(workbook, deviceSheet, 'Device Distribution');

  // Sheet 4: Country Distribution
  const countryData = Object.entries(analytics.countryDistribution)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .map(([country, count]) => ({
      Country: country,
      Clicks: count,
      Percentage: analytics.totalClicks > 0 ? `${((count / analytics.totalClicks) * 100).toFixed(1)}%` : '0%',
    }));

  const countrySheet = XLSX.utils.json_to_sheet(countryData);
  XLSX.utils.book_append_sheet(workbook, countrySheet, 'Country Distribution');

  // Sheet 5: Monthly Clicks
  const monthlyData = Object.entries(analytics.clicksByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, clicks]) => ({
      Month: month,
      Clicks: clicks,
    }));

  const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Clicks');

  // Generate filename with current date
  const filename = `linksnap-report-${new Date().toISOString().split('T')[0]}.xlsx`;

  // Write and download
  XLSX.writeFile(workbook, filename);
}

