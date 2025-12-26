-- AlterTable
ALTER TABLE "LinkAnalytics" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "sourceType" TEXT,
ADD COLUMN     "timezone" TEXT;

-- CreateIndex
CREATE INDEX "LinkAnalytics_country_idx" ON "LinkAnalytics"("country");

-- CreateIndex
CREATE INDEX "LinkAnalytics_sourceType_idx" ON "LinkAnalytics"("sourceType");

-- CreateIndex
CREATE INDEX "LinkAnalytics_browser_idx" ON "LinkAnalytics"("browser");
