export interface Customer {
  id: number;
  title: {
    rendered: string;
  };
  meta: {
    customer_code: string;
    name: string;
    phone_number: string;
    credit_limit: string;
    notes: string;
  };
}

export interface Transaction {
  id: number;
  date: string;
  meta: {
    transaction_type: 'Credit' | 'Debit';
    amount: string;
    payment_method: 'Cash' | 'Card' | 'Bank Transfer';
    related_customer: number[];
    notes: string;
  };
}
