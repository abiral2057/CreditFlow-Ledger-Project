
'use server';

import 'server-only';
import type { Customer, Transaction, TransactionWithCustomer } from './types';

const WP_API_URL = 'https://demo.leafletdigital.com.np/wp-json/wp/v2/';
const WP_APP_USER = process.env.WP_APP_USER || 'admin';
const WP_APP_PASSWORD = process.env.WP_APP_PASSWORD || 'ayim QJdt HCoF sTuK 7pBJ E58g';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + Buffer.from(`${WP_APP_USER}:${WP_APP_PASSWORD}`).toString('base64'),
});


export const getAllCustomers = async (): Promise<Customer[]> => {
  const response = await fetch(`${WP_API_URL}customers?per_page=100&context=edit`, { 
    headers: getAuthHeaders(),
    next: { tags: ['customers'] }
  });
  if (!response.ok) {
    console.error('Failed to fetch customers:', await response.text());
    throw new Error('Failed to fetch customers');
  }
  const customers = await response.json() as Customer[];
  return customers.sort((a, b) => (a.meta.name > b.meta.name) ? 1 : -1);
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  const response = await fetch(`${WP_API_URL}customers/${id}?context=edit`, { 
    headers: getAuthHeaders(),
    next: { tags: [`customers/${id}`] }
  });
  if (!response.ok) {
    if (response.status === 404) {
        throw new Error('Customer not found');
    }
    console.error('Failed to fetch customer:', await response.text());
    throw new Error('Failed to fetch customer');
  }
  const customer = await response.json() as Customer;
  return customer;
};


export const getTransactionsForCustomer = async (customerId: string): Promise<Transaction[]> => {
    const response = await fetch(`${WP_API_URL}transactions?per_page=100&context=edit&meta_key=related_customer&meta_value=${customerId}`, {
        headers: getAuthHeaders(),
        next: { tags: ['transactions', `transactions-for-${customerId}`] }
    });

    if (!response.ok) {
        console.error(`Failed to fetch transactions for customer ${customerId}:`, await response.text());
        throw new Error('Failed to fetch transactions');
    }
    
    const customerTransactions: Transaction[] = await response.json() as Transaction[];

    return customerTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const getAllTransactions = async (): Promise<TransactionWithCustomer[]> => {
  const headers = getAuthHeaders();
  let customers: Customer[] = [];
  let allTransactions: Transaction[] = [];

  try {
    const [customersRes, transactionsRes] = await Promise.all([
      fetch(`${WP_API_URL}customers?per_page=100&context=edit`, { headers, next: { tags: ['customers'] } }),
      fetch(`${WP_API_URL}transactions?per_page=100&context=edit`, { headers, next: { tags: ['transactions'] } }),
    ]);

    if (!customersRes.ok) throw new Error('Failed to fetch customers');
    if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');

    customers = await customersRes.json() as Customer[];
    allTransactions = await transactionsRes.json() as Transaction[];

  } catch (error) {
      console.error("Error fetching initial data for getAllTransactions", error);
      throw error;
  }

  const customerMap = new Map(customers.map(c => [c.id.toString(), c]));

  const transactionsWithCustomer: TransactionWithCustomer[] = allTransactions
    .map(tx => {
      const parentId = tx.meta?.related_customer?.toString();
      if (!parentId) return null;

      const customer = customerMap.get(parentId);
      
      if (!customer) return null;
      
      return {
        ...tx,
        customer: customer,
      };
    })
    .filter((tx): tx is TransactionWithCustomer => tx !== null);

  return transactionsWithCustomer.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const createCustomer = async (data: { name: string; customer_code: string; phone: string; credit_limit: string; }) => {
  const headers = getAuthHeaders();
  const response = await fetch(`${WP_API_URL}customers`, {
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
    throw new Error((error as any).message || 'Failed to create customer');
  }
  return response.json();
};

export const updateCustomer = async (id: string, data: Partial<Customer['meta']>) => {
  const headers = getAuthHeaders();
  
  const body: { title?: string; meta: Partial<Customer['meta']> } = {
    meta: data,
  }
  if (data.name) {
    body.title = data.name;
  }

  const response = await fetch(`${WP_API_URL}customers/${id}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update customer:', error);
    throw new Error((error as any).message || 'Failed to update customer');
  }
  return response.json();
}

export const deleteCustomer = async (id: string) => {
    const headers = getAuthHeaders();
    const response = await fetch(`${WP_API_URL}customers/${id}?force=true`, {
        method: 'DELETE',
        headers,
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to delete customer:', errorText);
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error((errorJson as any).message || 'Failed to delete customer.');
        } catch {
             throw new Error(errorText || 'Failed to delete customer.');
        }
    }
    return { success: true };
}

export const createTransaction = async (data: { customerId: string; date: string; amount: string; transaction_type: 'Credit' | 'Debit'; method: 'Cash' | 'Card' | 'Bank Transfer' | 'Online Payment', notes?: string, title: string; customer_code: string; }) => {
  const headers = getAuthHeaders();
  
  const transactionResponse = await fetch(`${WP_API_URL}transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: data.title,
      status: 'publish',
      date: data.date,
      meta: {
        transaction_type: data.transaction_type,
        amount: data.amount,
        transaction_date: data.date,
        method: data.method,
        notes: data.notes || '',
        related_customer: parseInt(data.customerId),
        customer_code: data.customer_code,
      },
    }),
  });

  if (!transactionResponse.ok) {
    const error = await transactionResponse.json();
    console.error('Failed to create transaction post:', error);
    throw new Error((error as any).message || 'Failed to create transaction post');
  }

  const newTransaction = await transactionResponse.json() as Transaction;
  
  return newTransaction;
};

export async function updateTransaction(transactionId: string, data: Partial<{ date: string; amount: string; transaction_type: string; method: string; notes: string; title: string; customer_code: string; }>) {
  const headers = getAuthHeaders();
  
  const body: {meta: any, date?:string, title?: string} = {
    meta: {
      transaction_type: data.transaction_type,
      amount: data.amount,
      transaction_date: data.date,
      method: data.method,
      notes: data.notes,
      customer_code: data.customer_code,
    }
  };

  if (data.date) {
    body.date = data.date;
  }
  if (data.title) {
    body.title = data.title;
  }
  
  const response = await fetch(`${WP_API_URL}transactions/${transactionId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to update transaction:', error);
    throw new Error((error as any).message || 'Failed to update transaction');
  }
  return response.json();
}

export const deleteTransaction = async (transactionId: string) => {
    const headers = getAuthHeaders();
    const response = await fetch(`${WP_API_URL}transactions/${transactionId}?force=true`, {
        method: 'DELETE',
        headers,
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Failed to delete transaction:', error);
        throw new Error((error as any).message || 'Failed to delete transaction.');
    }
    return { success: true };
}
