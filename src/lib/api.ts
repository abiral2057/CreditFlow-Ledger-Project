
import 'server-only';
import type { Customer, Transaction, JetRelTransactionResponse } from './types';
import { unstable_cache as cache } from 'next/cache';

const WP_API_URL = 'https://demo.leafletdigital.com.np/wp-json/wp/v2';
const JET_REL_API_URL = 'https://demo.leafletdigital.com.np/wp-json/jet-rel/22';
const USERNAME = 'admin';
const PASSWORD = 'L30X mtkZ lpig SwO8 L8gP xcLc';

const headers = {
  'Authorization': 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64'),
  'Content-Type': 'application/json',
};

export const getAllCustomers = cache(async (): Promise<Customer[]> => {
  const response = await fetch(`${WP_API_URL}/customers?per_page=100`, { 
    headers,
    next: { tags: ['customers'] }
  });
  if (!response.ok) {
    console.error('Failed to fetch customers:', await response.text());
    throw new Error('Failed to fetch customers');
  }
  const customers = await response.json();
  return customers;
}, ['customers'], { tags: ['customers'] });

export const getCustomerById = cache(async (id: string): Promise<Customer> => {
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
}, ['customer-by-id'], { tags: (id) => [`customer:${id}`] });

export const getTransactionsForCustomer = cache(async (customerId: string): Promise<Transaction[]> => {
    const url = `${JET_REL_API_URL}/children/${customerId}?per_page=100`;
    const response = await fetch(url, { 
      headers,
      next: { tags: [`transactions:${customerId}`] }
    });
    if (!response.ok) {
      console.error('Failed to fetch transactions:', await response.text());
      throw new Error('Failed to fetch transactions');
    }
    const jetRelResponse: JetRelTransactionResponse[] = await response.json();
    
    // Transform the response to match the Transaction type
    const transactions: Transaction[] = jetRelResponse
      .filter(item => item.child_object) // Filter out items with no child_object
      .map(item => ({
        id: item.child_object.id,
        date: item.child_object.date,
        meta: {
            transaction_type: item.child_object.meta.transaction_type,
            amount: item.child_object.meta.amount,
            payment_method: item.child_object.meta.payment_method,
            related_customer: String(item.parent_id),
            notes: item.child_object.meta.notes
        }
    }));
    return transactions;
}, ['transactions-for-customer'], { tags: (customerId) => [`transactions:${customerId}`] });


export const createCustomer = async (data: { name: string; customer_code: string; phone_number: string; credit_limit: string; }) => {
  const response = await fetch(`${WP_API_URL}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: data.name,
      status: 'publish',
      meta: {
        name: data.name,
        customer_code: data.customer_code,
        phone_number: data.phone_number,
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

export const updateCustomer = async (id: number, data: Partial<{ name: string; customer_code: string; phone_number: string; credit_limit: string; }>) => {
  const response = await fetch(`${WP_API_URL}/customers/${id}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: data.name,
      meta: {
        name: data.name,
        customer_code: data.customer_code,
        phone_number: data.phone_number,
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

export const createTransaction = async (data: { customerId: number, amount: string; transaction_type: 'Credit' | 'Debit'; payment_method: 'Cash' | 'Card' | 'Bank Transfer', notes?: string }) => {
  // Step 1: Create the transaction post
  const transactionResponse = await fetch(`${WP_API_URL}/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: `Transaction for customer ${data.customerId} - ${data.amount}`,
      status: 'publish',
      meta: {
        amount: data.amount,
        transaction_type: data.transaction_type,
        payment_method: data.payment_method,
        notes: data.notes || '',
        // We no longer need related_customer here as it's handled by jet-rel
      },
    }),
  });

  if (!transactionResponse.ok) {
    const error = await transactionResponse.json();
    console.error('Failed to create transaction post:', error);
    throw new Error(error.message || 'Failed to create transaction post');
  }

  const newTransaction = await transactionResponse.json();

  // Step 2: Create the relationship
  const relationResponse = await fetch(JET_REL_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      parent_id: data.customerId,
      child_id: newTransaction.id,
      context: 'parent',
      store_items_type: 'update',
      meta: {}
    }),
  });

  if (!relationResponse.ok) {
    // We should probably try to delete the transaction post if this fails
    const error = await relationResponse.json();
    console.error('Failed to create transaction relationship:', error);
    throw new Error(error.message || 'Failed to create transaction relationship');
  }

  return newTransaction;
};

export const deleteTransaction = async (transactionId: number) => {
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
