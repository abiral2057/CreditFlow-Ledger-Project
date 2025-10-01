
import { NextRequest, NextResponse } from 'next/server';
import { createCustomer, createTransaction } from '@/lib/actions';

// A few dummy data records to seed the database
const customers = [
    { name: 'John Doe', phone: '111-222-3333', credit_limit: '10000' },
    { name: 'Jane Smith', phone: '444-555-6666', credit_limit: '5000' },
];

const transactions = [
    // John Doe's transactions
    { customerIndex: 0, amount: '150.00', type: 'Credit', method: 'Cash', notes: 'Initial deposit' },
    { customerIndex: 0, amount: '45.50', type: 'Debit', method: 'Card', notes: 'Groceries' },
    { customerIndex: 0, amount: '200.00', type: 'Credit', method: 'Bank Transfer', notes: 'Payment from invoice #101' },
    { customerIndex: 0, amount: '75.00', type: 'Debit', method: 'Online Payment', notes: 'Online subscription' },

    // Jane Smith's transactions
    { customerIndex: 1, amount: '500.00', type: 'Credit', method: 'Bank Transfer', notes: 'Initial project payment' },
    { customerIndex: 1, amount: '120.00', type: 'Debit', method: 'Cash', notes: 'Office supplies' },
    { customerIndex: 1, amount: '80.25', type: 'Debit', method: 'Card', notes: 'Lunch meeting' },
];


export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ success: false, message: 'Seeding is only available in development environment.' }, { status: 403 });
    }

    try {
        console.log('Starting to seed data...');
        const createdCustomerIds: string[] = [];

        for (const customerData of customers) {
            const newCustomer = await createCustomer(customerData);
            createdCustomerIds.push(newCustomer.id.toString());
            console.log(`Created customer: ${newCustomer.meta.name} (ID: ${newCustomer.id})`);
        }

        for (const txData of transactions) {
            const customerId = createdCustomerIds[txData.customerIndex];
            await createTransaction({
                customerId: customerId,
                date: new Date().toISOString(),
                amount: txData.amount,
                transaction_type: txData.type as 'Credit' | 'Debit',
                payment_method: txData.method as 'Cash' | 'Card' | 'Bank Transfer' | 'Online Payment',
                notes: txData.notes,
            });
            console.log(`Created transaction for customer ID ${customerId}: ${txData.amount} (${txData.type})`);
        }

        console.log('Seeding completed successfully.');
        return NextResponse.json({ success: true, message: 'Dummy data seeded successfully!' });
    } catch (error) {
        console.error('Failed to seed data:', error);
        return NextResponse.json({ success: false, message: 'Failed to seed data.', error: (error as Error).message }, { status: 500 });
    }
}
