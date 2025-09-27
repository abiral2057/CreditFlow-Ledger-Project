
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
    related_customer: string; // This is the parent customer ID
    notes: string;
  };
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
      // The related_customer is the parent_id from the top-level object
    };
    // ... other properties of the transaction object
  }
}
