
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { 
  createCustomer as apiCreateCustomer, 
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  createTransaction as apiCreateTransaction, 
  deleteTransaction as apiDeleteTransaction 
} from './api';

export async function createCustomer(data: { name: string; phone_number?: string; credit_limit: string; }) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const customer_code = `CUST-${year}${month}${day}-${hours}${minutes}${seconds}`;

    const newCustomer = await apiCreateCustomer({ ...data, customer_code, phone_number: data.phone_number || '' });
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


export async function createTransaction(data: { customerId: number, date: string, amount: string; transaction_type: 'Credit' | 'Debit'; payment_method: 'Cash' | 'Card' | 'Bank Transfer', notes?: string }) {
    try {
      const newTransaction = await apiCreateTransaction(data);
      // Revalidate both the specific customer's transaction list and the global list
      revalidateTag(`transactions:${data.customerId}`);
      revalidateTag('transactions');
      revalidatePath(`/customers/${data.customerId}`);
      revalidatePath('/transactions');
      return newTransaction;
    } catch (error) {
      console.error('Action Error: createTransaction', error);
      throw new Error((error as Error).message || 'Failed to create transaction.');
    }
}

export async function deleteTransaction(transactionId: number, customerId: string) {
    try {
        await apiDeleteTransaction(transactionId);
        revalidateTag(`transactions:${customerId}`);
        revalidateTag('transactions');
        revalidatePath(`/customers/${customerId}`);
        revalidatePath('/transactions');
    } catch (error) {
        console.error('Action Error: deleteTransaction', error);
        throw new Error((error as Error).message || 'Failed to delete transaction.');
    }
}

export async function deleteMultipleTransactions(transactionIds: number[], customerId: string) {
    try {
        await Promise.all(transactionIds.map(id => apiDeleteTransaction(id)));
        revalidateTag(`transactions:${customerId}`);
        revalidateTag('transactions');
        revalidatePath(`/customers/${customerId}`);
        revalidatePath('/transactions');
    } catch (error) {
        console.error('Action Error: deleteMultipleTransactions', error);
        throw new Error((error as Error).message || 'Failed to delete transactions.');
    }
}
