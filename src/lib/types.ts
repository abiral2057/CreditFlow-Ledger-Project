

export interface Customer {
  id: string;
  title: {
    rendered: string;
  };
  meta: {
    customer_code: string;
    name: string;
    phone: string;
    credit_limit: string;
    notes: string;
  };
}

export interface Transaction {
  id: string;
  date: string;
  title: {
      rendered: string;
  };
  meta: {
    transaction_type: 'Credit' | 'Debit';
    amount: string;
    payment_method: 'Cash' | 'Card' | 'Bank Transfer';
    notes: string;
    [key: string]: any; 
  };
}

export interface TransactionWithCustomer extends Transaction {
  customer: Customer | null;
}
