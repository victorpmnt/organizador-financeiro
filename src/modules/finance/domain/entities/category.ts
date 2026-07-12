export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  kind: "income" | "expense" | "investment";
  createdAt: string;
}
