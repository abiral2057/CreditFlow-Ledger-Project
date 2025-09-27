

'use server';

import 'server-only';
import type { Customer, Transaction, TransactionWithCustomer } from './types';
import { unstable_cache as cache, revalidateTag } from 'next/cache';

const WP_API_URL = 'https://demo.leafletdigital.com.np/wp-json/wp/v2';


async function getHeaders() {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    return headers;
}

// Helper function to extract customer ID from transaction title
const getCustomerIdFromTitle = (transaction: Transaction): string | null => {
    const match = transaction.title.rendered.match(/for customer (\d+)/);
    return match ? match[1] : null;
}

export const getAllCustomers = cache(async (): Promise<Customer[]> => {
  const headers = await getHeaders();
  const response = await fetch(`${WP_API_URL}/customers?per_page=100`, { 
    headers,
    next: { tags: ['customers'] }
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
}, ['customers'], { tags: ['customers'] });

export const getCustomerById = cache(async (id: string): Promise<Customer> => {
  const headers = await getHeaders();
  const response = await fetch(`${WP_API_URL}/customers/${id}`, { 
    headers,
    next: { tags: [`customer:${id}`] }
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
}, ['customer-by-id'], { 
    tags: (id) => id ? [`customer:${id}`] : [] 
});


export const getTransactionsForCustomer = cache(async (customerId: string): Promise<Transaction[]> => {
    const headers = await getHeaders();
    const response = await fetch(`${WP_API_URL}/transactions?per_page=100`, {
        headers,
        next: { tags: [`transactions`, `transactions:${customerId}`] }
    });

    if (!response.ok) {
        console.error(`Failed to fetch transactions for customer ${customerId}:`, await response.text());
        throw new Error('Failed to fetch transactions');
    }
    
    const allTransactions: Transaction[] = await response.json();
    
    const customerTransactions = allTransactions.filter(tx => {
        const idFromTitle = getCustomerIdFromTitle(tx);
        return idFromTitle === customerId;
    });

    // Sort transactions by date, most recent first
    return customerTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

}, ['transactions-for-customer'], { tags: (customerId: string) => [`transactions:${customerId}`] });


export const getAllTransactions = async (): Promise<TransactionWithCustomer[]> => {
  const headers = await getHeaders();
  const [customers, transactionsResponse] = await Promise.all([
    getAllCustomers(),
    fetch(`${WP_API_URL}/transactions?per_page=100`, { 
      headers,
      next: { tags: ['transactions'] }
    }),
  ]);

  if (!transactionsResponse.ok) {
    console.error('Failed to fetch all transactions:', await transactionsResponse.text());
    throw new Error('Failed to fetch all transactions');
  }

  const allTransactions: Transaction[] = await transactionsResponse.json();
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
  revalidateTag('customers');
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
  revalidateTag(`customer:${id}`);
  revalidateTag('customers');
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
    revalidateTag('customers');
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
  revalidateTag(`transactions:${data.customerId}`);
  revalidateTag('transactions');
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
    revalidateTag('transactions');
    return { success: true };
}
