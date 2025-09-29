

'use server';

import 'server-only';
import type { Customer, Transaction, TransactionWithCustomer } from './types';
import { revalidatePath, revalidateTag } from 'next/cache';

const WP_API_URL = 'https://demo.leafletdigital.com.np/wp-json/wp/v2';
const WP_APP_USER = process.env.WP_APP_USER || 'admin';
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || 'password';

async function getHeaders() {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${WP_APP_USER}:${WP_APP_PASSWORD}`)
    };
    return headers;
}

// Helper function to extract customer ID from transaction title
const getCustomerIdFromTitle = (transaction: Transaction): string | null => {
    const match = transaction.title.rendered.match(/for customer (\d+)/);
    return match ? match[1] : null;
}

export const getAllCustomers = async (): Promise<Customer[]> => {
  const headers = await getHeaders();
  const response = await fetch(`${WP_API_URL}/customers?per_page=100`, { 
    headers,
    cache: 'no-store'
  });
  if (!response.ok) {
    console.error('Failed to fetch customers:', await response.text());
    throw new Error('Failed to fetch customers');
  }
  const customers = await response.json();
  return customers.sort((a: Customer, b: Customer) => {
    const codeA = parseInt(a.meta.customer_code.split('-')[1] || '0');
    const codeB = parseInt(b.meta.customer_code.split('-')[1] || '0');
    return codeA - codeB;
  });
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  const headers = await getHeaders();
  const response = await fetch(`${WP_API_URL}/customers/${id}`, { 
    headers,
    cache: 'no-store'
  });
  if (!response.ok) {
    if (response.status === 404) {
        throw new Error('Customer not found');
    }
    console.error('Failed to fetch customer:', await response.text());
    throw new Error('Failed to fetch customer');
  }
  const customer = await response.json();
  return customer;
};


export const getTransactionsForCustomer = async (customerId: string): Promise<Transaction[]> => {
    const headers = await getHeaders();
    // The API does not support filtering by a meta key that relates to another post type's ID directly.
    // We must fetch all transactions and filter them manually.
    const response = await fetch(`${WP_API_URL}/transactions?per_page=100`, {
        headers,
        cache: 'no-store'
    });

    if (!response.ok) {
        console.error(`Failed to fetch transactions for customer ${customerId}:`, await response.text());
        throw new Error('Failed to fetch transactions');
    }
    
    const allTransactions: Transaction[] = await response.json();
    
    // The title of a transaction contains "for customer {ID}". We use this to filter.
    const customerTransactions = allTransactions.filter(tx => {
        const idFromTitle = getCustomerIdFromTitle(tx);
        return idFromTitle === customerId;
    });

    // Sort transactions by date, most recent first
    return customerTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

};


export const getAllTransactions = async (): Promise<TransactionWithCustomer[]> => {
  const [customers, allTransactions] = await Promise.all([
    getAllCustomers(),
    fetch(`${WP_API_URL}/transactions?per_page=100`, { 
      headers: await getHeaders(),
      cache: 'no-store'
    }).then(res => {
      if (!res.ok) throw new Error('Failed to fetch transactions');
      return res.json() as Promise<Transaction[]>;
    }),
  ]);

  const customerMap = new Map(customers.map(c => [c.id.toString(), c]));

  const transactionsWithCustomer: TransactionWithCustomer[] = allTransactions
    .map(tx => {
      const parentId = getCustomerIdFromTitle(tx);
      const customer = parentId ? customerMap.get(parentId) : null;
      
      return {
        ...tx,
        customer: customer || null,
      };
    })
    .filter(tx => tx.customer !== null);

  return transactionsWithCustomer.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const createCustomer = async (data: { name: string; customer_code: string; phone: string; credit_limit: string; }) => {
  const headers = await getHeaders();
  const response = await fetch(`${WP_API_URL}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: data.name,
      status: 'publish',
      meta: {
        name: data.name,
        customer_code: data.customer_code,
        phone: data.phone,
        credit_limit: data.credit_limit,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create customer:', error);
    throw new Error(error.message || 'Failed to create customer');
  }
  return response.json();
};

export const updateCustomer = async (id: number, data: Partial<{ name: string; customer_code: string; phone: string; credit_limit: string; }>) => {
  const headers = await getHeaders();
  const response = await fetch(`${WP_API_URL}/customers/${id}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: data.name,
      meta: {
        name: data.name,
        customer_code: data.customer_code,
        phone: data.phone,
        credit_limit: data.credit_limit,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update customer:', error);
    throw new Error(error.message || 'Failed to update customer');
  }
  return response.json();
}

export const deleteCustomer = async (id: number) => {
    const headers = await getHeaders();
    const response = await fetch(`${WP_API_URL}/customers/${id}?force=true`, {
        method: 'DELETE',
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Failed to delete customer:', error);
        throw new Error(error.message || 'Failed to delete customer.');
    }
    return { success: true };
}

export const createTransaction = async (data: { customerId: number; date: string; amount: string; transaction_type: 'Credit' | 'Debit'; payment_method: 'Cash' | 'Card' | 'Bank Transfer', notes?: string }) => {
  const headers = await getHeaders();
  const response = await fetch(`${WP_API_URL}/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: `Transaction for customer ${data.customerId} - ${data.amount}`,
      status: 'publish',
      date: data.date,
      meta: {
        amount: data.amount,
        transaction_type: data.transaction_type,
        payment_method: data.payment_method,
        notes: data.notes || '',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create transaction post:', error);
    throw new Error(error.message || 'Failed to create transaction post');
  }

  const newTransaction = await response.json();
  return newTransaction;
};

export const deleteTransaction = async (transactionId: number) => {
    const headers = await getHeaders();
    const response = await fetch(`${WP_API_URL}/transactions/${transactionId}?force=true`, {
        method: 'DELETE',
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Failed to delete transaction:', error);
        throw new Error(error.message || 'Failed to delete transaction.');
    }
    return { success: true };
}
