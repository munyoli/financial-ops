import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const [rows] = await pool.query('SELECT * FROM unmatched_payments ORDER BY created_at DESC');
        return NextResponse.json(rows);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        await pool.query('DELETE FROM unmatched_payments WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
