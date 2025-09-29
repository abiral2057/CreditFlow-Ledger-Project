

'use server';

import 'server-only';
import type { Customer, Transaction, TransactionWithCustomer } from './types';

const WP_API_URL = 'https://demo.leafletdigital.com.np/wp-json/wp/v2';
const WP_APP_USER = process.env.WP_APP_USER || 'admin';
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || 'ayim QJdt HCoF sTuK 7pBJ E58g';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(`${WP_APP_USER}:${WP_APP_PASSWORD}`),
});

// Helper function to safely extract customer ID from transaction title
const getCustomerIdFromTitle = (transaction: Transaction): string | null => {
    if (!transaction?.title?.rendered) return null;
    const match = transaction.title.rendered.match(/for customer (\d+)/);
    return match ? match[1] : null;
}

export const getAllCustomers = async (): Promise<Customer[]> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${WP_API_URL}/customers?per_page=100&context=edit`, { 
    headers,
    next: { tags: ['customers'] }
  });
  if (!response.ok) {
    console.error('Failed to fetch customers:', await response.text());
    throw new Error('Failed to fetch customers');
  }
  const customers = await response.json();
  return customers.sort((a: Customer, b: Customer) => {
    const codeA = parseInt((a.meta.customer_code || 'CUST-0').split('-')[1] || '0');
    const codeB = parseInt((b.meta.customer_code || 'CUST-0').split('-')[1] || '0');
    return codeA - codeB;
  });
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  const headers = getAuthHeaders();
  const response = await fetch(`${WP_API_URL}/customers/${id}?context=edit`, { 
    headers,
    next: { tags: [`customers/${id}`] }
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
    const headers = getAuthHeaders();
    const response = await fetch(`${WP_API_URL}/transactions?per_page=100&context=edit`, {
        headers,
        next: { tags: ['transactions', `transactions-for-${customerId}`] }
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

    return customerTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const getAllTransactions = async (): Promise<TransactionWithCustomer[]> => {
  const headers = getAuthHeaders();
  let customers: Customer[] = [];
  let allTransactions: Transaction[] = [];

  try {
    const [customersRes, transactionsRes] = await Promise.all([
      fetch(`${WP_API_URL}/customers?per_page=100&context=edit`, { headers, next: { tags: ['customers'] } }),
      fetch(`${WP_API_URL}/transactions?per_page=100&context=edit`, { headers, next: { tags: ['transactions'] } }),
    ]);

    if (!customersRes.ok) throw new Error('Failed to fetch customers');
    if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');

    customers = await customersRes.json();
    allTransactions = await transactionsRes.json();

  } catch (error) {
      console.error("Error fetching initial data for getAllTransactions", error);
      throw error;
  }

  const customerMap = new Map(customers.map(c => [c.id.toString(), c]));

  const transactionsWithCustomer: TransactionWithCustomer[] = allTransactions
    .map(tx => {
      if (!tx || !tx.title || !tx.title.rendered) {
        return null; 
      }
      const parentId = getCustomerIdFromTitle(tx);
      const customer = parentId ? customerMap.get(parentId) : null;
      
      return {
        ...tx,
        customer: customer || null,
      };
    })
    .filter((tx): tx is TransactionWithCustomer => tx !== null && tx.customer !== null);

  return transactionsWithCustomer.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const createCustomer = async (data: { name: string; customer_code: string; phone: string; credit_limit: string; }) => {
  const headers = getAuthHeaders();
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
  const headers = getAuthHeaders();
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
    const headers = getAuthHeaders();
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
  const headers = getAuthHeaders();
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

export async function updateTransaction(transactionId: number, data: Partial<{ date: string; amount: string; transaction_type: string; payment_method: string; notes: string; }>) {
  const headers = getAuthHeaders();
  
  const body: {meta: any, date?:string} = {
    meta: {
      amount: data.amount,
      transaction_type: data.transaction_type,
      payment_method: data.payment_method,
      notes: data.notes
    }
  };

  if (data.date) {
    body.date = data.date;
  }
  
  const response = await fetch(`${WP_API_URL}/transactions/${transactionId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update transaction:', error);
    throw new Error(error.message || 'Failed to update transaction');
  }
  return response.json();
}

export const deleteTransaction = async (transactionId: number) => {
    const headers = getAuthHeaders();
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
