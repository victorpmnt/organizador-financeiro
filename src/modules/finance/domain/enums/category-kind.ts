export const CATEGORY_KINDS = ["income", "expense", "investment"] as const;

export type CategoryKind = (typeof CATEGORY_KINDS)[number];

