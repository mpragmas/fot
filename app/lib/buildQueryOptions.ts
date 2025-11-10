export function buildQueryOptions(
  searchParams: URLSearchParams,
  config: any = {},
) {
  const allowedFilters = config.allowedFilters || [];
  const where: any = {};

  // Dynamic filters
  for (const field of allowedFilters) {
    const value = searchParams.get(field.name);
    if (!value) continue;

    if (field.type === "number") {
      where[field.name] = Number(value);
    } else if (field.type === "string") {
      where[field.name] = value;
    } else if (field.type === "search") {
      where.OR = field.fields.map((f: string) => ({
        [f]: { contains: value, mode: "insensitive" },
      }));
    } else if (field.type === "range") {
      where[field.name] = {};
      const min = searchParams.get(field.min);
      const max = searchParams.get(field.max);
      if (min) where[field.name].gte = Number(min);
      if (max) where[field.name].lte = Number(max);
    }
  }

  // ordering
  const orderByField = searchParams.get("orderBy") || "id";
  const order = searchParams.get("order") || "desc";

  // pagination
  const takeParam = searchParams.get("take");
  const skipParam = searchParams.get("skip");

  return {
    where,
    orderBy: { [orderByField]: order },
    take: takeParam ? Number(takeParam) : undefined,
    skip: skipParam ? Number(skipParam) : undefined,
  };
}
