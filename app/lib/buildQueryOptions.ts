// Helper to build nested object from path "a.b.c"
const setNestedValue = (obj: any, path: string, value: any) => {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = current[keys[i]] || {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
};

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
      setNestedValue(where, field.name, Number(value));
    } else if (field.type === "string") {
      setNestedValue(where, field.name, value);
    } else if (field.type === "search") {
      // For search, we typically check multiple fields with OR
      // Example: OR: [ { fixture: { homeTeam: { name: ... } } }, ... ]
      const searchConditions = field.fields.map((f: string) => {
        const condition = {};
        setNestedValue(condition, f, { contains: value, mode: "insensitive" });
        return condition;
      });
      where.OR = searchConditions;
    } else if (field.type === "range") {
      const rangeCondition: any = {};
      const min = searchParams.get(field.min);
      const max = searchParams.get(field.max);
      if (min) rangeCondition.gte = Number(min);
      if (max) rangeCondition.lte = Number(max);

      if (Object.keys(rangeCondition).length > 0) {
        setNestedValue(where, field.name, rangeCondition);
      }
    }
  }

  // Ordering
  const orderByField = searchParams.get("orderBy") || "id";
  const order = searchParams.get("order") || "desc";
  const orderBy = {};
  setNestedValue(orderBy, orderByField, order);

  // Pagination
  const takeParam = searchParams.get("take");
  const skipParam = searchParams.get("skip");

  return {
    where,
    orderBy,
    take: takeParam ? Number(takeParam) : undefined,
    skip: skipParam ? Number(skipParam) : undefined,
  };
}
