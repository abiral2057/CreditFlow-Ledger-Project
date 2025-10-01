
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { 
  createCustomer as apiCreateCustomer, 
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  createTransaction as apiCreateTransaction,
  updateTransaction as apiUpdateTransaction,
  deleteTransaction as apiDeleteTransaction,
  getCustomerById,
} from './api';
import type { Customer, Transaction } from './types';
import { formatAmount } from './utils';

const revalidateAll = () => {
    revalidateTag('customers');
    revalidateTag('transactions');
    revalidatePath('/', 'layout');
}

export async function createCustomer(data: { name: string; phone?: string; credit_limit: string; }) {
  try {
    // CUS-YYYYMMDD-HHMMSS
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const customer_code = `CUS-${year}${month}${day}-${hours}${minutes}${seconds}`;

    const newCustomer = await apiCreateCustomer({ ...data, customer_code, phone: data.phone || '', name: data.name });
    revalidateAll();
    return newCustomer;
  } catch (error) {
    console.error('Action Error: createCustomer', error);
    throw new Error((error as Error).message || 'Failed to create customer.');
  }
}

export async function updateCustomer(id: string, data: Partial<Customer['meta']>) {
  try {
    const updatedCustomer = await apiUpdateCustomer(id, data);
    revalidateTag(`customers/${id}`);
    revalidateAll();
    return updatedCustomer;
  } catch (error) {
    console.error('Action Error: updateCustomer', error);
    throw new Error((error as Error).message || 'Failed to update customer.');
  }
}

export async function deleteCustomer(id: string) {
    try {
        await apiDeleteCustomer(id);
        revalidateTag(`customers/${id}`);
        revalidateAll();
    } catch (error) {
        console.error('Action Error: deleteCustomer', error);
        throw new Error((error as Error).message || 'Failed to delete customer.');
    }
}


export async function createTransaction(data: { customerId: string, date: string, amount: string; transaction_type: 'Credit' | 'Debit'; payment_method: 'Cash' | 'Card' | 'Bank Transfer' | 'Online Payment', notes?: string }) {
    try {
      const customer = await getCustomerById(data.customerId);
      const title = `Transaction for ${customer.meta.name} - ${formatAmount(data.amount)} on ${new Date(data.date).toLocaleDateString()}`;
      
      const newTransaction = await apiCreateTransaction({ ...data, title });
      revalidateTag(`transactions-for-${data.customerId}`);
      revalidateAll();
      return newTransaction;
    } catch (error) {
      console.error('Action Error: createTransaction', error);
      throw new Error((error as Error).message || 'Failed to create transaction.');
    }
}

export async function updateTransaction(transactionId: string, customerId: string, data: { date: string, amount: string; transaction_type: 'Credit' | 'Debit'; payment_method: 'Cash' | 'Card' | 'Bank Transfer' | 'Online Payment', notes?: string }) {
    try {
      const customer = await getCustomerById(customerId);
      const title = `Transaction for ${customer.meta.name} - ${formatAmount(data.amount)} on ${new Date(data.date).toLocaleDateString()}`;

      const updatedTransaction = await apiUpdateTransaction(transactionId, { ...data, title });
      revalidateTag(`transactions-for-${customerId}`);
      revalidateAll();
      return updatedTransaction;
    } catch (error) {
      console.error('Action Error: updateTransaction', error);
      throw new Error((error as Error).message || 'Failed to update transaction.');
    }
}

export async function deleteTransaction(transactionId: string, customerId: string) {
    try {
        await apiDeleteTransaction(transactionId);
        revalidateTag(`transactions-for-${customerId}`);
        revalidateAll();
    } catch (error) {
        console.error('Action Error: deleteTransaction', error);
        throw new Error((error as Error).message || 'Failed to delete transaction.');
    }
}

export async function deleteMultipleTransactions(transactionIds: string[], customerId: string) {
    try {
        await Promise.all(transactionIds.map(id => apiDeleteTransaction(id)));
        revalidateTag(`transactions-for-${customerId}`);
        revalidateAll();
    } catch (error) {
        console.error('Action Error: deleteMultipleTransactions', error);
        throw new Error((error as Error).message || 'Failed to delete transactions.');
    }
}
