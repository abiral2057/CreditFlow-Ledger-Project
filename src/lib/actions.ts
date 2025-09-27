
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { 
  createCustomer as apiCreateCustomer, 
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  createTransaction as apiCreateTransaction, 
  deleteTransaction as apiDeleteTransaction,
  getAllCustomers,
  getTransactionsForCustomer
} from './api';

export async function createCustomer(data: { name: string; phone?: string; credit_limit: string; }) {
  try {
    const allCustomers = await getAllCustomers();
    const nextId = (allCustomers.length > 0 ? Math.max(...allCustomers.map(c => parseInt(c.meta.customer_code.split('-')[1]) || 0)) : 0) + 1;
    const customer_code = `CUST-${String(nextId).padStart(3, '0')}`;

    const newCustomer = await apiCreateCustomer({ ...data, customer_code, phone: data.phone || '' });
    revalidateTag('customers');
    return newCustomer;
  } catch (error) {
    console.error('Action Error: createCustomer', error);
    throw new Error((error as Error).message || 'Failed to create customer.');
  }
}

export async function updateCustomer(id: number, data: Partial<{ name: string; customer_code: string; phone: string; credit_limit: string; }>) {
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
        // First, get all transactions for the customer
        const transactions = await getTransactionsForCustomer(id.toString());

        // Delete all associated transactions
        await Promise.all(transactions.map(tx => apiDeleteTransaction(tx.id)));
        
        // Then, delete the customer
        await apiDeleteCustomer(id);

        revalidateTag('customers');
        revalidateTag(`transactions:${id}`);
        revalidateTag('transactions');
    } catch (error) {
        console.error('Action Error: deleteCustomer', error);
        throw new Error((error as Error).message || 'Failed to delete customer and their transactions.');
    }
}


export async function createTransaction(data: { customerId: number, date: string, amount: string; transaction_type: 'Credit' | 'Debit'; payment_method: 'Cash' | 'Card' | 'Bank Transfer', notes?: string }) {
    try {
      const newTransaction = await apiCreateTransaction(data);
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

