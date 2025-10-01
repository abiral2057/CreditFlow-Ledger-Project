
export interface Customer {
  id: number;
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
  id: number;
  date: string;
  title: {
      rendered: string;
  };
  meta: {
    transaction_type: 'Credit' | 'Debit';
    amount: string;
    transaction_date: string;
    method: 'Cash' | 'Card' | 'Bank Transfer' | 'Online Payment';
    notes: string;
    customer_code: string;
    related_customer: number;
  };
}

export interface TransactionWithCustomer extends Transaction {
  customer: Customer | null;
}

    
