import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { transaction_id, phone, amount, comment, date } = body;

        // Validation
        if (!transaction_id || !phone || !amount || !date) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Insert into database
        const query = `
            INSERT INTO payments (transaction_id, phone, amount, comment, date)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await pool.execute<ResultSetHeader>(query, [
            transaction_id,
            phone,
            amount,
            comment || null, // Handle optional comment
            new Date(date), // Ensure correct date format
        ]);

        if (result.affectedRows > 0) {
            return NextResponse.json(
                { success: true, message: 'Payment recorded', paymentId: result.insertId },
                { status: 200 }
            );
        } else {
            throw new Error('Failed to insert payment');
        }

    } catch (error: any) {
        console.error('Error processing payment:', error);

        // Check for duplicate entry (common with payment callbacks)
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json(
                { success: false, message: 'Payment already recorded' },
                { status: 409 } // Conflict
            );
        }

        return NextResponse.json(
            { success: false, message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
