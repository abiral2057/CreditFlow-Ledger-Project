

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
    payment_method: 'Cash' | 'Card' | 'Bank Transfer';
    notes: string;
    [key: string]: any; 
  };
}

export interface TransactionWithCustomer extends Transaction {
  customer: Customer | null;
}

// Type for the response from /jet-rel/22/children/{_ID}
export interface JetRelTransactionResponse {
  ID: number;
  parent_id: number;
  child_id: number;
  child_object: {
    id: number;
    date: string;
    title: {
      rendered: string;
    };
    meta: {
      transaction_type: 'Credit' | 'Debit';
      amount: string;
      payment_method: 'Cash' | 'Card' | 'Bank Transfer';
      notes: string;
    };
  }
}
