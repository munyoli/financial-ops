import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const expense = await request.json();

        const [result]: any = await pool.query(
            `INSERT INTO expenses (category, amount, date, description, notes) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                expense.category,
                expense.amount,
                expense.date,
                expense.description || '',
                expense.notes || ''
            ]
        );

        return NextResponse.json({ id: result.insertId, ...expense });
    } catch (error: any) {
        console.error('Error creating expense:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

