import { Category, type PrismaClient } from "@prisma/client";

const defaultPropertyTypes = [
  { name: "Apartment", slug: "apartment", category: Category.RESIDENTIAL, sortOrder: 1 },
  { name: "Builder Floor", slug: "builder-floor", category: Category.RESIDENTIAL, sortOrder: 2 },
  { name: "Independent Floor", slug: "independent-floor", category: Category.RESIDENTIAL, sortOrder: 3 },
  { name: "Villa", slug: "villa", category: Category.RESIDENTIAL, sortOrder: 4 },
  { name: "Plot", slug: "plot", category: Category.RESIDENTIAL, sortOrder: 5 },
  { name: "SCO", slug: "sco", category: Category.COMMERCIAL, sortOrder: 6 },
  { name: "SCF", slug: "scf", category: Category.COMMERCIAL, sortOrder: 7 },
  { name: "Shop", slug: "shop", category: Category.COMMERCIAL, sortOrder: 8 },
  { name: "Showroom", slug: "showroom", category: Category.COMMERCIAL, sortOrder: 9 },
  { name: "Office", slug: "office", category: Category.COMMERCIAL, sortOrder: 10 },
  { name: "Commercial Plot", slug: "commercial-plot", category: Category.COMMERCIAL, sortOrder: 11 },
  { name: "Industrial Plot", slug: "industrial-plot", category: Category.COMMERCIAL, sortOrder: 12 },
];

export async function ensureDefaultPropertyTypes(prisma: PrismaClient) {
  await prisma.$transaction(
    defaultPropertyTypes.map((type) =>
      prisma.propertyType.upsert({
        where: { slug: type.slug },
        update: { name: type.name, category: type.category, active: true, sortOrder: type.sortOrder },
        create: type,
      })
    )
  );
}
