
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from './auth';
import { 
  createCustomer as apiCreateCustomer, 
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  createTransaction as apiCreateTransaction, 
  deleteTransaction as apiDeleteTransaction,
  getAllCustomers,
  getTransactionsForCustomer,
  validateUser
} from './api';

export async function login(credentials: {username: string, password: string}): Promise<{success: boolean, error?: string, username?: string}> {
  try {
    const user = await validateUser(credentials.username, credentials.password);
    
    if (!user.token) {
        throw new Error(user.message || 'Invalid credentials');
    }

    const session = await getIronSession(cookies(), sessionOptions);
    session.isLoggedIn = true;
    session.username = user.user_display_name;
    session.token = user.token;
    await session.save();

    return { success: true, username: user.user_display_name };
  } catch (error) {
    console.error('Login Action Error:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function loginWithGoogle(userData: {username: string, email: string}): Promise<{success: boolean, error?: string}> {
    const ADMIN_EMAIL = 'nepalhighlandtreks2080@gmail.com';

    if (userData.email !== ADMIN_EMAIL) {
        return { success: false, error: 'Unauthorized access. This account is not permitted.' };
    }

    try {
        const session = await getIronSession(cookies(), sessionOptions);
        session.isLoggedIn = true;
        session.username = userData.username;
        // No token for Google sign-in as it's handled differently
        session.token = `google-user-${userData.email}`; 
        await session.save();
        return { success: true };
    } catch (error) {
        console.error('Google Login Action Error:', error);
        return { success: false, error: (error as Error).message };
    }
}

export async function logout() {
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
  redirect('/login');
}


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
