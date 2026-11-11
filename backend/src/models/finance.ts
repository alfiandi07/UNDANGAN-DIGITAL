export type OperationalCost = {
  id: number;
  period_month: string;
  expense_name: string;
  amount: number;
  created_at?: string;
};

export type FinanceSummary = {
  total_omset: number;
  total_orders_paid: number;
  total_expenses: number;
  net_profit: number;
  share_per_member: number; // net_profit / 3 (tim inti bertiga)
  team_members: Array<{
    name: string;
    role: string;
    share_amount: number;
  }>;
  expenses: OperationalCost[];
};

