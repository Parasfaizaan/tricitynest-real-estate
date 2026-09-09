import { queryProperties, serializeProperty, type PropertyFilters } from "@/lib/property-query";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filters: PropertyFilters = {
    q: url.searchParams.get("q") ?? undefined,
    category: url.searchParams.get("category") ?? undefined,
    type: url.searchParams.get("type") ?? undefined,
    location: url.searchParams.get("location") ?? undefined,
    transaction: url.searchParams.get("transaction") ?? undefined,
    bhk: url.searchParams.get("bhk") ?? undefined,
    minPrice: url.searchParams.get("minPrice") ?? undefined,
    maxPrice: url.searchParams.get("maxPrice") ?? undefined,
    minArea: url.searchParams.get("minArea") ?? undefined,
    maxArea: url.searchParams.get("maxArea") ?? undefined,
    possession: url.searchParams.get("possession") ?? undefined,
    furnishing: url.searchParams.get("furnishing") ?? undefined,
    featured: url.searchParams.get("featured") ?? undefined,
    sort: url.searchParams.get("sort") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
  };
  const result = await queryProperties(filters);
  return Response.json({
    ...result,
    items: result.items.map(serializeProperty),
  });
}
