import type { PrismaClient } from "@prisma/client";

export const defaultAmenityNames = [
  "Parking",
  "Gym",
  "Swimming Pool",
  "Clubhouse",
  "Security",
  "Power Backup",
  "Lift",
  "Park",
  "Visitor Parking",
  "Children's Play Area",
  "Security / Fire Alarm",
  "Security Guard",
  "Intercom Facility",
  "Maintenance Staff",
  "Water Storage",
  "CCTV Surveillance",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function ensureDefaultAmenities(prisma: PrismaClient) {
  await prisma.$transaction(
    defaultAmenityNames.map((name) =>
      prisma.amenity.upsert({
        where: { slug: slugify(name) },
        update: { name, active: true },
        create: { name, slug: slugify(name) },
      })
    )
  );
}
