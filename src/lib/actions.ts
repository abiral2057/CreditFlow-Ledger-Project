'use server';

import { revalidatePath } from 'next/cache';
import { createCustomer as apiCreateCustomer, createTransaction as apiCreateTransaction } from './api';

export async function createCustomer(data: { name: string; customer_code: string; phone_number?: string; credit_limit: string; }) {
  try {
    const newCustomer = await apiCreateCustomer({ ...data, phone_number: data.phone_number || '' });
    revalidatePath('/');
    return newCustomer;
  } catch (error) {
    console.error('Action Error: createCustomer', error);
    throw new Error((error as Error).message || 'Failed to create customer.');
  }
}

export async function createTransaction(data: { customerId: number, amount: string; transaction_type: 'Credit' | 'Debit'; payment_method: 'Cash' | 'Card' | 'Bank Transfer', notes?: string }) {
    try {
      const newTransaction = await apiCreateTransaction(data);
      revalidatePath(`/customers/${data.customerId}`);
      revalidatePath('/'); // Also revalidate home page if it shows balances
      return newTransaction;
    } catch (error) {
      console.error('Action Error: createTransaction', error);
      throw new Error((error as Error).message || 'Failed to create transaction.');
    }
  }
