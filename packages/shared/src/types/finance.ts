export type EntryType = 'credit' | 'debit';

export interface FinanceEntry {
  id: string;
  userId: string;
  type: EntryType;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  tags: string[];
  entryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFinanceEntryInput {
  type: EntryType;
  title: string;
  description?: string;
  amount: number;
  currency?: string;
  entryDate?: string;
}

export interface FinanceSummary {
  totalCredits: number;
  totalDebits: number;
  balance: number;
  currency: string;
}
