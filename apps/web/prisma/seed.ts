import { PrismaClient, Category, TransactionType, PropertyStatus, Furnishing, Possession, Role, LeadStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMAGES = {
  apt1: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  apt2: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
  apt3: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80",
  apt4: "https://images.unsplash.com/photo-1600047509807-ba8d526a4c35?auto=format&fit=crop&w=1600&q=80",
  villa1: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
  villa2: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80",
  villa3: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
  interior1: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
  interior2: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80",
  interior3: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
  plot1: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80",
  plot2: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1600&q=80",
  commercial1: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
  commercial2: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
  commercial3: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80",
  shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
  mohali: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  chandigarh: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80",
  zirakpur: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
  kharar: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  newchd: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  derabassi: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
  banur: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  panchkula: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80",
};

async function main() {
  await prisma.propertyMatch.deleteMany();
  await prisma.leadNote.deleteMany();
  await prisma.propertyPreference.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.enquiry.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.sellLead.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.propertyDeletionRequest.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.favourite.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.propertyFeature.deleteMany();
  await prisma.floorPlan.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.propertyType.deleteMany();
  await prisma.builder.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
  await prisma.setting.deleteMany();

  const hash = (pwd: string) => bcrypt.hashSync(pwd, 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: "superadmin@tricityinvestment.com",
      passwordHash: hash("SuperAdmin@123"),
      name: "Aarav Mehta",
      role: Role.SUPER_ADMIN,
    },
  });

  const admin1 = await prisma.user.create({
    data: {
      email: "admin@tricityinvestment.com",
      passwordHash: hash("Admin@123"),
      name: "Priya Sharma",
      role: Role.ADMIN,
    },
  });

  await prisma.user.createMany({
    data: [
      { email: "admin2@tricityinvestment.com", passwordHash: hash("Admin@123"), name: "Rohit Gill", role: Role.ADMIN },
      { email: "admin3@tricityinvestment.com", passwordHash: hash("Admin@123"), name: "Simran Kaur", role: Role.ADMIN },
      { email: "user@tricityinvestment.com", passwordHash: hash("User@123"), name: "Guest Buyer", role: Role.USER },
    ],
  });

  const locations = await Promise.all(
    [
      { name: "Mohali", slug: "mohali", city: "Mohali", imageUrl: IMAGES.mohali, sortOrder: 1 },
      { name: "Chandigarh", slug: "chandigarh", city: "Chandigarh", state: "Chandigarh", imageUrl: IMAGES.chandigarh, sortOrder: 2 },
      { name: "Zirakpur", slug: "zirakpur", city: "Zirakpur", imageUrl: IMAGES.zirakpur, sortOrder: 3 },
      { name: "Kharar", slug: "kharar", city: "Kharar", imageUrl: IMAGES.kharar, sortOrder: 4 },
      { name: "New Chandigarh", slug: "new-chandigarh", city: "New Chandigarh", imageUrl: IMAGES.newchd, sortOrder: 5 },
      { name: "Derabassi", slug: "derabassi", city: "Derabassi", imageUrl: IMAGES.derabassi, sortOrder: 6 },
      { name: "Banur", slug: "banur", city: "Banur", imageUrl: IMAGES.banur, sortOrder: 7 },
      { name: "Panchkula", slug: "panchkula", city: "Panchkula", state: "Haryana", imageUrl: IMAGES.panchkula, sortOrder: 8 },
    ].map((l) => prisma.location.create({ data: l }))
  );

  const loc = Object.fromEntries(locations.map((l) => [l.slug, l]));

  const types = await Promise.all(
    [
      { name: "Apartment", slug: "apartment", category: Category.RESIDENTIAL, sortOrder: 1 },
      { name: "Builder Floor", slug: "builder-floor", category: Category.RESIDENTIAL, sortOrder: 2 },
      { name: "Independent Floor", slug: "independent-floor", category: Category.RESIDENTIAL, sortOrder: 3 },
      { name: "Villa", slug: "villa", category: Category.RESIDENTIAL, sortOrder: 4 },
      { name: "Plot", slug: "plot", category: Category.RESIDENTIAL, sortOrder: 5 },
      { name: "SCO", slug: "sco", category: Category.COMMERCIAL, sortOrder: 6 },
      { name: "Shop", slug: "shop", category: Category.COMMERCIAL, sortOrder: 7 },
      { name: "Showroom", slug: "showroom", category: Category.COMMERCIAL, sortOrder: 8 },
      { name: "Office", slug: "office", category: Category.COMMERCIAL, sortOrder: 9 },
      { name: "Commercial Plot", slug: "commercial-plot", category: Category.COMMERCIAL, sortOrder: 10 },
    ].map((t) => prisma.propertyType.create({ data: t }))
  );

  const type = Object.fromEntries(types.map((t) => [t.slug, t]));

  const amenityRows = await Promise.all(
    [
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
    ].map((name) =>
      prisma.amenity.create({
        data: {
          name,
          slug: name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        },
      })
    )
  );

  const builders = await Promise.all([
    prisma.builder.create({ data: { name: "Aurelia Homes", slug: "aurelia-homes", description: "Residential communities across the Mohali corridor." } }),
    prisma.builder.create({ data: { name: "Northgate Developers", slug: "northgate-developers", description: "Plotted and mixed-use projects in Zirakpur and Banur." } }),
    prisma.builder.create({ data: { name: "Cedar & Co.", slug: "cedar-co", description: "Boutique villas and independent floors." } }),
  ]);

  type SeedProperty = {
    slug: string;
    title: string;
    shortDescription: string;
    description: string;
    category: Category;
    typeSlug: string;
    transactionType: TransactionType;
    featured?: boolean;
    price: number;
    priceMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    balconies?: number;
    area: number;
    locality: string;
    locSlug: string;
    furnishing?: Furnishing;
    possession?: Possession;
    reraNumber?: string;
    builderIndex?: number;
    images: string[];
    amenitySlugs?: string[];
    tagline?: string;
    views?: number;
  };

  const properties: SeedProperty[] = [
    {
      slug: "2-bhk-apartment-sector-115-mohali",
      title: "2 BHK Apartment in Sector 115",
      shortDescription: "Sunlit 2 BHK with a park-facing living room in a gated Mohali community.",
      description: "A carefully planned 2 BHK with cross ventilation, modular kitchen and two covered parking slots. Minutes from the airport road and IT City.",
      category: Category.RESIDENTIAL,
      typeSlug: "apartment",
      transactionType: TransactionType.BUY,
      featured: true,
      price: 3800000,
      priceMax: 4300000,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 2,
      area: 1120,
      locality: "Sector 115",
      locSlug: "mohali",
      furnishing: Furnishing.SEMI_FURNISHED,
      possession: Possession.UNDER_CONSTRUCTION,
      reraNumber: "PBRERA-SAS79-PR1101",
      builderIndex: 0,
      images: [IMAGES.apt1, IMAGES.interior1, IMAGES.interior2],
      amenitySlugs: ["parking", "gym", "security", "lift", "park", "power-backup"],
      tagline: "Park facing · IT City",
      views: 412,
    },
    {
      slug: "3-bhk-builder-floor-sector-70-mohali",
      title: "3 BHK Builder Floor in Sector 70",
      shortDescription: "Independent floor with private terrace and 1750 sqft of usable space.",
      description: "A north-facing builder floor with three bedrooms, a study nook and a private terrace. Walking distance to Sector 70 market.",
      category: Category.RESIDENTIAL,
      typeSlug: "builder-floor",
      transactionType: TransactionType.BUY,
      featured: true,
      price: 7800000,
      priceMax: 8500000,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      area: 1750,
      locality: "Sector 70",
      locSlug: "mohali",
      furnishing: Furnishing.UNFURNISHED,
      possession: Possession.NEW_LAUNCH,
      reraNumber: "PBRERA-SAS79-PR1106",
      builderIndex: 2,
      images: [IMAGES.apt2, IMAGES.interior3, IMAGES.apt4],
      amenitySlugs: ["parking", "security", "power-backup", "modular-kitchen"],
      tagline: "Private terrace",
      views: 288,
    },
    {
      slug: "4-bhk-villa-sector-82-mohali",
      title: "4 BHK Villa in Sector 82",
      shortDescription: "Corner villa with lawn, double-height living and a pool club nearby.",
      description: "A 4 BHK independent house on a 12-marla plot. Double-height living, four-car parking and a landscaped lawn.",
      category: Category.RESIDENTIAL,
      typeSlug: "villa",
      transactionType: TransactionType.BUY,
      featured: true,
      price: 18500000,
      priceMax: 21000000,
      bedrooms: 4,
      bathrooms: 5,
      balconies: 3,
      area: 3200,
      locality: "Sector 82",
      locSlug: "mohali",
      furnishing: Furnishing.SEMI_FURNISHED,
      possession: Possession.READY,
      reraNumber: "PBRERA-SAS79-PR1104",
      builderIndex: 2,
      images: [IMAGES.villa1, IMAGES.villa2, IMAGES.interior1],
      amenitySlugs: ["parking", "swimming-pool", "clubhouse", "security", "park"],
      tagline: "Ready to move",
      views: 640,
    },
    {
      slug: "3-bhk-apartment-sunny-enclave-kharar",
      title: "3 BHK Apartment in Sunny Enclave",
      shortDescription: "Family 3 BHK on Kharar–Landran road with clubhouse access.",
      description: "High-floor 3 BHK with two balconies, covered parking and a dedicated kids' play area. Easy commute to Mohali IT parks.",
      category: Category.RESIDENTIAL,
      typeSlug: "apartment",
      transactionType: TransactionType.BUY,
      featured: true,
      price: 5450000,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      area: 1480,
      locality: "Sunny Enclave",
      locSlug: "kharar",
      furnishing: Furnishing.SEMI_FURNISHED,
      possession: Possession.READY,
      reraNumber: "PBRERA-SAS79-PR1110",
      builderIndex: 0,
      images: [IMAGES.apt3, IMAGES.interior2, IMAGES.apt1],
      amenitySlugs: ["parking", "gym", "clubhouse", "lift", "park", "security"],
      views: 190,
    },
    {
      slug: "2-bhk-resale-sector-63-chandigarh",
      title: "2 BHK Resale Flat in Sector 63",
      shortDescription: "Quiet Chandigarh society flat with park view and covered parking.",
      description: "A well-kept 2 BHK in a low-rise Chandigarh society. Ideal for professionals working in Sector 17 and IT Park.",
      category: Category.RESIDENTIAL,
      typeSlug: "apartment",
      transactionType: TransactionType.BUY,
      price: 7200000,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      area: 1050,
      locality: "Sector 63",
      locSlug: "chandigarh",
      furnishing: Furnishing.FURNISHED,
      possession: Possession.READY,
      images: [IMAGES.apt4, IMAGES.interior3, IMAGES.interior1],
      amenitySlugs: ["parking", "lift", "park", "security"],
      views: 221,
    },
    {
      slug: "residential-plot-sector-109-mohali",
      title: "Residential Plot in Sector 109",
      shortDescription: "200 sqyd plotted pocket with 40 ft road and clear title.",
      description: "A rectangular 200 sqyd plot in a developing Mohali sector. Ideal for a custom home with east-facing frontage.",
      category: Category.RESIDENTIAL,
      typeSlug: "plot",
      transactionType: TransactionType.BUY,
      featured: true,
      price: 6200000,
      area: 1800,
      locality: "Sector 109",
      locSlug: "mohali",
      possession: Possession.READY,
      reraNumber: "PBRERA-SAS79-PR1120",
      builderIndex: 1,
      images: [IMAGES.plot1, IMAGES.plot2],
      amenitySlugs: ["park", "security"],
      tagline: "40 ft road",
    },
    {
      slug: "2-bhk-independent-house-zirakpur",
      title: "2 BHK Independent House in Zirakpur",
      shortDescription: "Compact independent house near VIP Road with private courtyard.",
      description: "A freshly painted 2 BHK kothi with courtyard parking, suitable for a small family or as a rental investment.",
      category: Category.RESIDENTIAL,
      typeSlug: "villa",
      transactionType: TransactionType.BUY,
      price: 4950000,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      area: 980,
      locality: "VIP Road",
      locSlug: "zirakpur",
      furnishing: Furnishing.UNFURNISHED,
      possession: Possession.READY,
      images: [IMAGES.villa3, IMAGES.interior2],
      amenitySlugs: ["parking", "security"],
    },
    {
      slug: "3-bhk-resale-sector-125-mohali",
      title: "3 BHK Resale in Sector 125",
      shortDescription: "Corner 3 BHK with extra ventilation and two car parks.",
      description: "Resale apartment in a completed project. Vastu-compliant layout, modular kitchen and a balcony overlooking the internal greens.",
      category: Category.RESIDENTIAL,
      typeSlug: "apartment",
      transactionType: TransactionType.BUY,
      price: 8900000,
      bedrooms: 3,
      bathrooms: 3,
      balconies: 2,
      area: 1650,
      locality: "Sector 125",
      locSlug: "mohali",
      furnishing: Furnishing.SEMI_FURNISHED,
      possession: Possession.READY,
      builderIndex: 0,
      images: [IMAGES.apt2, IMAGES.interior1, IMAGES.apt3],
      amenitySlugs: ["parking", "gym", "swimming-pool", "clubhouse", "lift"],
    },
    {
      slug: "4-bhk-villa-new-chandigarh",
      title: "4 BHK Villa in New Chandigarh",
      shortDescription: "Hill-facing villa community with club and walking trails.",
      description: "A 4 BHK villa with private lawn, servant room and club membership. Quiet New Chandigarh address with easy airport access.",
      category: Category.RESIDENTIAL,
      typeSlug: "villa",
      transactionType: TransactionType.BUY,
      featured: true,
      price: 24500000,
      bedrooms: 4,
      bathrooms: 4,
      balconies: 3,
      area: 3600,
      locality: "Mullanpur",
      locSlug: "new-chandigarh",
      furnishing: Furnishing.UNFURNISHED,
      possession: Possession.UNDER_CONSTRUCTION,
      reraNumber: "PBRERA-SAS79-PR1133",
      builderIndex: 2,
      images: [IMAGES.villa2, IMAGES.villa1, IMAGES.interior3],
      amenitySlugs: ["parking", "clubhouse", "park", "security", "swimming-pool", "servant-room"],
    },
    {
      slug: "2-bhk-rent-sector-70-mohali",
      title: "2 BHK for Rent in Sector 70",
      shortDescription: "Furnished rental near Phase 7 with immediate possession.",
      description: "Fully furnished 2 BHK available for professionals. Includes appliances, covered parking and 24x7 security.",
      category: Category.RESIDENTIAL,
      typeSlug: "apartment",
      transactionType: TransactionType.RENT,
      price: 28000,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      area: 1100,
      locality: "Sector 70",
      locSlug: "mohali",
      furnishing: Furnishing.FURNISHED,
      possession: Possession.READY,
      images: [IMAGES.interior3, IMAGES.apt4],
      amenitySlugs: ["parking", "lift", "security", "air-conditioning"],
    },
    {
      slug: "sco-plot-airport-road-zirakpur",
      title: "SCO Plot on Airport Road",
      shortDescription: "Corner SCO with 80 ft frontage on the airport arterial.",
      description: "A high-visibility SCO plot suited for a showroom or restaurant. Clear title and approved building norms.",
      category: Category.COMMERCIAL,
      typeSlug: "sco",
      transactionType: TransactionType.BUY,
      featured: true,
      price: 18500000,
      area: 1500,
      locality: "Airport Road",
      locSlug: "zirakpur",
      possession: Possession.READY,
      reraNumber: "PBRERA-SAS79-PR1140",
      builderIndex: 1,
      images: [IMAGES.commercial1, IMAGES.commercial2],
      amenitySlugs: ["parking", "security"],
      tagline: "80 ft frontage",
    },
    {
      slug: "commercial-showroom-vip-road-zirakpur",
      title: "Commercial Showroom on VIP Road",
      shortDescription: "Ground-floor showroom with mezzanine and dedicated parking bay.",
      description: "A 2200 sqft showroom on VIP Road with high footfall. Suitable for automobile, apparel or electronics.",
      category: Category.COMMERCIAL,
      typeSlug: "showroom",
      transactionType: TransactionType.BUY,
      price: 12800000,
      area: 2200,
      locality: "VIP Road",
      locSlug: "zirakpur",
      possession: Possession.READY,
      images: [IMAGES.commercial2, IMAGES.shop],
      amenitySlugs: ["parking", "power-backup", "security"],
    },
    {
      slug: "office-space-it-city-mohali",
      title: "Office Space in IT City Mohali",
      shortDescription: "Fitted office floor with meeting rooms and 8 car parks.",
      description: "A plug-and-play office of 1800 sqft in IT City. Raised flooring, two meeting rooms and 24x7 access.",
      category: Category.COMMERCIAL,
      typeSlug: "office",
      transactionType: TransactionType.RENT,
      price: 85000,
      area: 1800,
      locality: "IT City",
      locSlug: "mohali",
      furnishing: Furnishing.FURNISHED,
      possession: Possession.READY,
      images: [IMAGES.commercial3, IMAGES.commercial2],
      amenitySlugs: ["parking", "power-backup", "lift", "security", "air-conditioning"],
    },
    {
      slug: "shop-derabassi-gt-road",
      title: "Retail Shop on GT Road Derabassi",
      shortDescription: "Street-facing shop on GT Road with steady highway traffic.",
      description: "A 450 sqft shop with shutter frontage, storage loft and shared parking. Suitable for grocery or services.",
      category: Category.COMMERCIAL,
      typeSlug: "shop",
      transactionType: TransactionType.BUY,
      price: 3200000,
      area: 450,
      locality: "GT Road",
      locSlug: "derabassi",
      possession: Possession.READY,
      images: [IMAGES.shop, IMAGES.commercial1],
      amenitySlugs: ["parking"],
    },
    {
      slug: "commercial-plot-banur-road",
      title: "Commercial Plot on Banur Road",
      shortDescription: "Half-acre commercial pocket between Banur and Rajpura.",
      description: "An investment plot on Banur Road with highway visibility. Suitable for warehouse, school or mixed-use later.",
      category: Category.COMMERCIAL,
      typeSlug: "commercial-plot",
      transactionType: TransactionType.INVEST,
      featured: true,
      price: 9800000,
      area: 21780,
      locality: "Banur Road",
      locSlug: "banur",
      possession: Possession.READY,
      builderIndex: 1,
      images: [IMAGES.plot2, IMAGES.plot1],
      amenitySlugs: ["parking"],
      tagline: "Highway facing",
    },
  ];

  for (const p of properties) {
    const created = await prisma.property.create({
      data: {
        slug: p.slug,
        title: p.title,
        shortDescription: p.shortDescription,
        description: p.description,
        category: p.category,
        propertyTypeId: type[p.typeSlug].id,
        transactionType: p.transactionType,
        status: PropertyStatus.PUBLISHED,
        featured: Boolean(p.featured),
        price: p.price,
        priceMax: p.priceMax,
        negotiable: true,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        balconies: p.balconies,
        area: p.area,
        address: `${p.locality}, ${loc[p.locSlug].city}`,
        locality: p.locality,
        locationId: loc[p.locSlug].id,
        city: loc[p.locSlug].city,
        state: loc[p.locSlug].state,
        furnishing: p.furnishing ?? Furnishing.UNFURNISHED,
        possession: p.possession ?? Possession.READY,
        reraNumber: p.reraNumber,
        builderId: p.builderIndex != null ? builders[p.builderIndex].id : null,
        tagline: p.tagline,
        views: p.views ?? 40,
        createdById: admin1.id,
        publishedAt: new Date(),
        images: {
          create: p.images.map((url, i) => ({
            url,
            alt: p.title,
            sortOrder: i,
            isCover: i === 0,
          })),
        },
        features: {
          create: [{ label: "Clear title" }, { label: "Site visit on request" }],
        },
      },
    });

    if (p.amenitySlugs?.length) {
      const selected = amenityRows.filter((a) => p.amenitySlugs!.includes(a.slug));
      await prisma.propertyAmenity.createMany({
        data: selected.map((a) => ({ propertyId: created.id, amenityId: a.id })),
      });
    }
  }

  const lead = await prisma.lead.create({
    data: {
      name: "Neha Kapoor",
      phone: "9876501234",
      email: "neha@example.com",
      status: LeadStatus.NEW,
      preference: {
        create: {
          categories: "RESIDENTIAL",
          propertyTypes: "apartment,builder-floor",
          transactionType: TransactionType.BUY,
          locationSlugs: "mohali,kharar",
          minBudget: 3500000,
          maxBudget: 8000000,
          bedrooms: "2,3",
          timeline: "1-3 months",
        },
      },
    },
  });

  await prisma.enquiry.create({
    data: {
      name: "Vikram Singh",
      phone: "9815012345",
      email: "vikram@example.com",
      message: "Please share floor plans for Sector 82 villa.",
    },
  });

  await prisma.setting.createMany({
    data: [
      { key: "phone", value: "+91 172 500 4400" },
      { key: "whatsapp", value: "91725004400" },
      { key: "email", value: "hello@tricityinvestment.com" },
    ],
  });

  await prisma.auditLog.create({
    data: {
      actorId: superAdmin.id,
      action: "SEED",
      entityType: "System",
      metadata: JSON.stringify({ properties: properties.length, lead: lead.id }),
    },
  });

  console.log("Seeded tricityinvestment demo data.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
