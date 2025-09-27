import 'server-only';
import { cache } from 'react';
import type { Customer, Transaction } from './types';

const WP_API_URL = 'https://demo.leafletdigital.com.np/wp-json/wp/v2';
const USERNAME = 'admin';
const PASSWORD = 'L30X mtkZ lpig SwO8 L8gP xcLc';

const headers = {
  'Authorization': 'Basic ' + Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64'),
};

export const getAllCustomers = cache(async (): Promise<Customer[]> => {
  const response = await fetch(`${WP_API_URL}/customers?per_page=100`, { 
    headers,
    next: { revalidate: 60 } // Revalidate every 60 seconds
  });
  if (!response.ok) {
    console.error('Failed to fetch customers:', await response.text());
    throw new Error('Failed to fetch customers');
  }
  const customers = await response.json();
  return customers;
});

export const getCustomerById = cache(async (id: string): Promise<Customer> => {
  const response = await fetch(`${WP_API_URL}/customers/${id}`, { 
    headers,
    next: { revalidate: 60 }
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
});

export const getTransactionsForCustomer = cache(async (customerId: string): Promise<Transaction[]> => {
    const url = `${WP_API_URL}/transactions?meta_key=related_customer&meta_value=${customerId}&per_page=100`;
    const response = await fetch(url, { 
      headers,
      next: { revalidate: 60 }
    });
    if (!response.ok) {
      console.error('Failed to fetch transactions:', await response.text());
      throw new Error('Failed to fetch transactions');
    }
    const transactions = await response.json();
    return transactions;
});
