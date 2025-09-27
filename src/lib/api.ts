import 'server-only';
import type { Customer, Transaction } from './types';
import { unstable_cache as cache } from 'next/cache';

const WP_API_URL = 'https://demo.leafletdigital.com.np/wp-json/wp/v2';
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
}, ['customer-by-id'], { tags: [`customer`] });

export const getTransactionsForCustomer = cache(async (customerId: string): Promise<Transaction[]> => {
    const url = `${WP_API_URL}/transactions?meta_key=related_customer&meta_value=${customerId}&per_page=100`;
    const response = await fetch(url, { 
      headers,
      next: { tags: [`transactions:${customerId}`] }
    });
    if (!response.ok) {
      console.error('Failed to fetch transactions:', await response.text());
      throw new Error('Failed to fetch transactions');
    }
    const transactions = await response.json();
    return transactions;
}, ['transactions-for-customer'], { tags: [`transactions`] });


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
  const response = await fetch(`${WP_API_URL}/transactions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: `Transaction for customer ${data.customerId}`,
      status: 'publish',
      meta: {
        related_customer: String(data.customerId),
        amount: data.amount,
        transaction_type: data.transaction_type,
        payment_method: data.payment_method,
        notes: data.notes || '',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Failed to create transaction:', error);
    throw new Error(error.message || 'Failed to create transaction');
  }

  return response.json();
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
