

'use server';

import 'server-only';
import type { Customer, Transaction, TransactionWithCustomer } from './types';

const WP_API_URL = 'https://demo.leafletdigital.com.np/wp-json/wp/v2/';
const JET_REL_URL = 'https://demo.leafletdigital.com.np/wp-json/jet-rel/';
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
    const headers = getAuthHeaders();
    const relationUrl = `${JET_REL_URL}${JET_REL_ID}/children/${customerId}?per_page=100`;

    // 1. Fetch the basic related transaction objects from JetEngine
    const relationResponse = await fetch(relationUrl, {
        headers,
        next: { tags: ['transactions', `transactions-for-${customerId}`] }
    });

    if (!relationResponse.ok) {
        console.error(`Failed to fetch transaction relations for customer ${customerId}:`, await relationResponse.text());
        throw new Error('Failed to fetch transaction relations');
    }
    
    const relatedPosts: Partial<Transaction>[] = await relationResponse.json();

    if (!relatedPosts || relatedPosts.length === 0) {
        return [];
    }

    // 2. Extract the IDs of the related transactions
    const transactionIds = relatedPosts.map(p => p.id).filter(id => id !== undefined);

    if (transactionIds.length === 0) {
        return [];
    }

    // 3. Fetch the full transaction objects, including all meta fields, in a single batch request
    const fullTransactionsUrl = `${WP_API_URL}transactions?include=${transactionIds.join(',')}&per_page=100&context=edit`;
    const fullTransactionsResponse = await fetch(fullTransactionsUrl, {
        headers,
        next: { tags: ['transactions', `transactions-for-${customerId}`] }
    });

    if (!fullTransactionsResponse.ok) {
        console.error(`Failed to fetch full transaction details:`, await fullTransactionsResponse.text());
        throw new Error('Failed to fetch full transaction details');
    }

    const fullTransactions: Transaction[] = await fullTransactionsResponse.json();

    return fullTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  const customerMap = new Map(customers.map(c => [c.id, c]));

  // To correctly map transactions to customers, we need the relationship data.
  // JetEngine doesn't seem to provide a simple way to embed this, so we'll have to rely on a meta field if one exists.
  // The 'related_customer' meta field seems to be the intended link.
  
  const transactionsWithCustomer: TransactionWithCustomer[] = allTransactions
    .map(tx => {
      // The meta field `related_customer` should hold the ID of the parent customer.
      const customerId = tx.meta.related_customer; 
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
        related_customer: parseInt(data.customerId),
      },
    }),
  });

  if (!transactionResponse.ok) {
    const error = await transactionResponse.json();
    console.error('Failed to create transaction post:', error);
    throw new Error((error as any).message || 'Failed to create transaction post');
  }

  const newTransaction = await transactionResponse.json() as Transaction;
  
  // Link transaction to customer using JetEngine relation
  try {
    const relationResponse = await fetch(`${JET_REL_URL}${JET_REL_ID}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
          parent_id: parseInt(data.customerId),
          child_id: newTransaction.id,
          context: 'parent',
          store_items_type: 'update',
      })
    });

    if(!relationResponse.ok) {
      const error = await relationResponse.json();
      console.error('Failed to create transaction relationship:', error);
      throw new Error((error as any).message || 'Failed to create transaction relationship');
    }
  } catch(error) {
     console.error('Catastrophic failure in transaction relationship creation:', error);
     // Since the transaction was created but the relation failed, this is a critical state.
     // For now, re-throw the error to make it visible.
     throw error;
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
      related_customer: parseInt(customerId),
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
