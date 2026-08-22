import { apiClient } from "../../../shared/api";
import type {
  CashExpense,
  CreateCashExpenseDto,
  ListCashExpensesQuery,
} from "../model/cash-expense.types";

export interface CashExpenseGateway {
  createExpense(data: CreateCashExpenseDto): Promise<CashExpense>;
  listExpenses(params?: ListCashExpensesQuery): Promise<CashExpense[]>;
  listExpensesByShift(shiftId: string): Promise<CashExpense[]>;
  getExpenseById(id: string): Promise<CashExpense>;
}

export const cashExpenseGateway: CashExpenseGateway = {
  createExpense: async (data: CreateCashExpenseDto): Promise<CashExpense> => {
    return apiClient("/cash-expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  listExpenses: async (params?: ListCashExpensesQuery): Promise<CashExpense[]> => {
    const query = new URLSearchParams();
    if (params?.shiftId) query.set("shiftId", params.shiftId);
    if (params?.cashierId) query.set("cashierId", params.cashierId);
    if (params?.category) query.set("category", params.category);
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);

    const queryString = query.toString();
    const endpoint = queryString ? `/cash-expenses?${queryString}` : "/cash-expenses";
    return apiClient(endpoint);
  },

  listExpensesByShift: async (shiftId: string): Promise<CashExpense[]> => {
    return apiClient(`/cash-expenses/shift/${shiftId}`);
  },

  getExpenseById: async (id: string): Promise<CashExpense> => {
    return apiClient(`/cash-expenses/${id}`);
  },
};
