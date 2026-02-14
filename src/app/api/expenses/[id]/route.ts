import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const expense = await request.json();

        await pool.query(
            `UPDATE expenses 
             SET category = ?, amount = ?, date = ?, description = ?, notes = ? 
             WHERE id = ?`,
            [
                expense.category,
                expense.amount,
                expense.date,
                expense.description || '',
                expense.notes || '',
                id
            ]
        );

        return NextResponse.json({ message: 'Expense updated' });
    } catch (error: any) {
        console.error('Error updating expense:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
        return NextResponse.json({ message: 'Expense deleted' });
    } catch (error: any) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
