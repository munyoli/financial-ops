import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * M-Pesa Sync API Endpoint
 * Targeted by n8n or M-Pesa Webhooks
 * 
 * Payload: { transaction_id, phone, amount, comment, date }
 */
export async function POST(request: Request) {
    let connection;
    try {
        const { transaction_id, phone, amount, comment, date } = await request.json();

        if (!transaction_id || !amount) {
            return NextResponse.json({ error: 'Missing critical payment data' }, { status: 400 });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Idempotency Check (Check if already processed)
        const [existing]: any = await connection.query(
            'SELECT id FROM payments WHERE reference_code = ? UNION SELECT id FROM unmatched_payments WHERE transaction_id = ?',
            [transaction_id, transaction_id]
        );

        if (existing.length > 0) {
            await connection.rollback();
            return NextResponse.json({ message: 'Transaction already processed' });
        }

        // 2. Matching Logic
        let matchedInvoiceId = null;

        // A. Match by Invoice Reference in Comment (e.g., "INV-001")
        const invoiceRefMatch = comment?.match(/INV-\d+/i);
        if (invoiceRefMatch) {
            const [invoice]: any = await connection.query(
                'SELECT id FROM invoices WHERE invoice_number = ?',
                [invoiceRefMatch[0].toUpperCase()]
            );
            if (invoice.length > 0) matchedInvoiceId = invoice[0].id;
        }

        // B. Match by Phone (Oldest Unpaid First)
        if (!matchedInvoiceId && phone) {
            // Clean phone to match DB (assuming 07... or +254...)
            const cleanPhone = phone.replace(/\D/g, '').slice(-9); // Match last 9 digits for safety
            const [invoice]: any = await connection.query(
                "SELECT id FROM invoices WHERE (client_phone LIKE ?) AND status IN ('pending', 'partial') ORDER BY created_at ASC LIMIT 1",
                [`%${cleanPhone}`]
            );
            if (invoice.length > 0) matchedInvoiceId = invoice[0].id;
        }

        // 3. Process Result
        if (matchedInvoiceId) {
            // Record Payment
            await connection.query(
                'INSERT INTO payments (invoice_id, amount, method, reference_code, note, date) VALUES (?, ?, ?, ?, ?, ?)',
                [matchedInvoiceId, amount, 'mpesa', transaction_id, comment || 'Auto-synced from M-Pesa', date || new Date()]
            );

            // Update Invoice Status
            // (We should ideally check if total payments >= total_amount)
            const [invoiceTotal]: any = await connection.query(
                'SELECT total_amount FROM invoices WHERE id = ?', [matchedInvoiceId]
            );
            const [totalPaid]: any = await connection.query(
                'SELECT SUM(amount) as paid FROM payments WHERE invoice_id = ?', [matchedInvoiceId]
            );

            const isPaid = Number(totalPaid[0].paid) >= Number(invoiceTotal[0].total_amount);
            await connection.query(
                'UPDATE invoices SET status = ? WHERE id = ?',
                [isPaid ? 'paid' : 'partial', matchedInvoiceId]
            );

            await connection.commit();
            return NextResponse.json({ success: true, matched: true, invoice_id: matchedInvoiceId });
        } else {
            // Log to Unmatched for Manual Review
            await connection.query(
                'INSERT INTO unmatched_payments (transaction_id, phone, amount, comment, date) VALUES (?, ?, ?, ?, ?)',
                [transaction_id, phone, amount, comment, date || new Date()]
            );

            await connection.commit();
            return NextResponse.json({ success: true, matched: false, message: 'Logged for manual review' });
        }

    } catch (error: any) {
        if (connection) await connection.rollback();
        console.error('M-Pesa Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
