
'use server';

import 'server-only';
import type { Customer, Transaction, TransactionWithCustomer } from './types';

const WP_API_URL = 'https://demo.leafletdigital.com.np/wp-json/wp/v2/';
const JET_REL_URL = 'https://demo.leafletdigital.com.np/wp-json/jet-rel/v2/';
const JET_REL_ID = '22'; // The specific ID for the customer-to-transaction relationship

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
    // Correctly query transactions related to a customer via JetEngine relations
    const url = `${WP_API_URL}transactions?context=edit&per_page=100&jet_rel_query=1&jet_rel_parent_id=${customerId}&jet_rel_relation_id=${JET_REL_ID}`;
    const response = await fetch(url, {
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
  let relations: { parent_id: number; child_id: number }[] = [];

  try {
    const [customersRes, transactionsRes, relationsRes] = await Promise.all([
      fetch(`${WP_API_URL}customers?per_page=100&context=edit`, { headers, next: { tags: ['customers'] } }),
      fetch(`${WP_API_URL}transactions?per_page=100&context=edit`, { headers, next: { tags: ['transactions'] } }),
      fetch(`${JET_REL_URL}${JET_REL_ID}/relations`, { headers, next: { tags: ['transactions'] } }),
    ]);

    if (!customersRes.ok) throw new Error('Failed to fetch customers');
    if (!transactionsRes.ok) throw new Error('Failed to fetch transactions');
    if (!relationsRes.ok) throw new Error('Failed to fetch relationships');

    customers = await customersRes.json() as Customer[];
    allTransactions = await transactionsRes.json() as Transaction[];
    relations = await relationsRes.json();

  } catch (error) {
      console.error("Error fetching initial data for getAllTransactions", error);
      throw error;
  }

  const customerMap = new Map(customers.map(c => [c.id, c]));
  const transactionToCustomerMap = new Map(relations.map(r => [r.child_id, r.parent_id]));

  const transactionsWithCustomer: TransactionWithCustomer[] = allTransactions
    .map(tx => {
      const customerId = transactionToCustomerMap.get(tx.id);
      if (!customerId) return { ...tx, customer: null };

      const customer = customerMap.get(customerId);
      if (!customer) return { ...tx, customer: null };
      
      return {
        ...tx,
        customer: customer,
      };
    });

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
  
  // Step 2: Relate the new transaction to the customer using the jet-rel API
  const relationResponse = await fetch(`${JET_REL_URL}${JET_REL_ID}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent_id: parseInt(data.customerId),
      child_id: newTransaction.id,
      context: 'parent',
      store_items_type: 'replace',
      meta: {},
    }),
  });

  if (!relationResponse.ok) {
    const error = await relationResponse.json();
    console.error('Failed to create transaction relationship:', error);
    // Optionally, delete the created transaction to avoid orphans
    await deleteTransaction(newTransaction.id.toString());
    throw new Error((error as any).message || 'Failed to create transaction relationship.');
  }

  return newTransaction;
};

export async function updateTransaction(transactionId: string, customerId: string, data: { date: string, amount: string; transaction_type: 'Credit' | 'Debit'; method: 'Cash' | 'Card' | 'Bank Transfer' | 'Online Payment', notes?: string, title: string, customer_code: string }) {
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

    
