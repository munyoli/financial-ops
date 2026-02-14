import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const invoice = await request.json();

        await pool.query(
            `UPDATE invoices 
             SET client_name = ?, invoice_number = ?, total_amount = ?, status = ?, issue_date = ?, due_date = ? 
             WHERE id = ?`,
            [
                invoice.clientName,
                invoice.invoiceNumber,
                invoice.totalAmount,
                invoice.status,
                invoice.issueDate,
                invoice.dueDate,
                id
            ]
        );

        return NextResponse.json({ message: 'Invoice updated' });
    } catch (error: any) {
        console.error('Error updating invoice:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Invoice deleted' });
    } catch (error: any) {
        console.error('Error deleting invoice:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
