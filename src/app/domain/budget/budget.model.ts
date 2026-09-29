export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: string; // YYYY-MM
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
