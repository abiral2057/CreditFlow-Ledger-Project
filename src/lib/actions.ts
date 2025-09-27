'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { 
  createCustomer as apiCreateCustomer, 
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  createTransaction as apiCreateTransaction, 
  deleteTransaction as apiDeleteTransaction 
} from './api';

export async function createCustomer(data: { name: string; customer_code: string; phone_number?: string; credit_limit: string; }) {
  try {
    const newCustomer = await apiCreateCustomer({ ...data, phone_number: data.phone_number || '' });
    revalidateTag('customers');
    return newCustomer;
  } catch (error) {
    console.error('Action Error: createCustomer', error);
    throw new Error((error as Error).message || 'Failed to create customer.');
  }
}

export async function updateCustomer(id: number, data: Partial<{ name: string; customer_code: string; phone_number: string; credit_limit: string; }>) {
  try {
    const updatedCustomer = await apiUpdateCustomer(id, data);
    revalidateTag('customers');
    revalidateTag(`customer:${id}`);
    return updatedCustomer;
  } catch (error) {
    console.error('Action Error: updateCustomer', error);
    throw new Error((error as Error).message || 'Failed to update customer.');
  }
}

export async function deleteCustomer(id: number) {
    try {
        await apiDeleteCustomer(id);
        revalidateTag('customers');
    } catch (error) {
        console.error('Action Error: deleteCustomer', error);
        throw new Error((error as Error).message || 'Failed to delete customer.');
    }
}


export async function createTransaction(data: { customerId: number, amount: string; transaction_type: 'Credit' | 'Debit'; payment_method: 'Cash' | 'Card' | 'Bank Transfer', notes?: string }) {
    try {
      const newTransaction = await apiCreateTransaction(data);
      revalidatePath(`/customers/${data.customerId}`);
      return newTransaction;
    } catch (error) {
      console.error('Action Error: createTransaction', error);
      throw new Error((error as Error).message || 'Failed to create transaction.');
    }
}

export async function deleteTransaction(transactionId: number, customerId: string) {
    try {
        await apiDeleteTransaction(transactionId);
        revalidatePath(`/customers/${customerId}`);
    } catch (error) {
        console.error('Action Error: deleteTransaction', error);
        throw new Error((error as Error).message || 'Failed to delete transaction.');
    }
}

export async function deleteMultipleTransactions(transactionIds: number[], customerId: string) {
    try {
        await Promise.all(transactionIds.map(id => apiDeleteTransaction(id)));
        revalidatePath(`/customers/${customerId}`);
    } catch (error) {
        console.error('Action Error: deleteMultipleTransactions', error);
        throw new Error((error as Error).message || 'Failed to delete transactions.');
    }
}
