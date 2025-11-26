export type SortDirection = "asc" | "desc";

export type QuerySort<TFields extends string> = `${TFields}:${SortDirection}`[];
