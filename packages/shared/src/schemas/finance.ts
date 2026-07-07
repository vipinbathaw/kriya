import { z } from 'zod';

export const createFinanceEntrySchema = z.object({
  type: z.enum(['credit', 'debit']),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(10000).optional(),
  amount: z.number().int().positive('Amount must be positive'),
  currency: z.string().length(3).default('INR'),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
});

export type CreateFinanceEntrySchema = z.infer<typeof createFinanceEntrySchema>;
