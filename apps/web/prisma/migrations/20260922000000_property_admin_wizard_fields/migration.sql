-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "shortDescription" SET DEFAULT '';

ALTER TABLE "Property" ADD COLUMN "listingType" TEXT;
ALTER TABLE "Property" ADD COLUMN "sellerName" TEXT;
ALTER TABLE "Property" ADD COLUMN "sellerPhone" TEXT;
ALTER TABLE "Property" ADD COLUMN "bhk" INTEGER;
ALTER TABLE "Property" ADD COLUMN "superArea" INTEGER;
ALTER TABLE "Property" ADD COLUMN "builtUpArea" INTEGER;
ALTER TABLE "Property" ADD COLUMN "otherRooms" TEXT;
ALTER TABLE "Property" ADD COLUMN "furnishingItems" TEXT;
ALTER TABLE "Property" ADD COLUMN "sector" TEXT;
ALTER TABLE "Property" ADD COLUMN "projectName" TEXT;
ALTER TABLE "Property" ADD COLUMN "propertyAge" TEXT;
ALTER TABLE "Property" ADD COLUMN "floorLabel" TEXT;
ALTER TABLE "Property" ADD COLUMN "coveredParking" INTEGER;
ALTER TABLE "Property" ADD COLUMN "openParking" INTEGER;
ALTER TABLE "Property" ADD COLUMN "plotLength" INTEGER;
ALTER TABLE "Property" ADD COLUMN "plotBreadth" INTEGER;
ALTER TABLE "Property" ADD COLUMN "floorsAllowed" INTEGER;
ALTER TABLE "Property" ADD COLUMN "boundaryWall" BOOLEAN;
ALTER TABLE "Property" ADD COLUMN "openSides" INTEGER;
ALTER TABLE "Property" ADD COLUMN "constructionDone" BOOLEAN;
ALTER TABLE "Property" ADD COLUMN "commercialSubtype" TEXT;
ALTER TABLE "Property" ADD COLUMN "locatedInside" TEXT;
ALTER TABLE "Property" ADD COLUMN "washroomType" TEXT;
ALTER TABLE "Property" ADD COLUMN "parkingType" TEXT;
ALTER TABLE "Property" ADD COLUMN "entranceWidth" INTEGER;
ALTER TABLE "Property" ADD COLUMN "ceilingHeight" INTEGER;

INSERT INTO "Location" ("id", "name", "slug", "city", "state", "sortOrder", "active", "createdAt")
VALUES ('seed-panchkula-location', 'Panchkula', 'panchkula', 'Panchkula', 'Haryana', 8, true, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
