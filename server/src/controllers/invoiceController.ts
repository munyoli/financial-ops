import { Request, Response } from 'express';
import pool from '../config/db';

export const getInvoices = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM invoices ORDER BY issue_date DESC');
        
        // Fetch payments for each invoice
        for (let invoice of rows) {
            const [payments]: any = await pool.query(
                'SELECT * FROM payments WHERE invoice_id = ? ORDER BY date DESC',
                [invoice.id]
            );
            invoice.payments = payments;
        }

        res.json(rows);
    } catch (error: any) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createInvoice = async (req: Request, res: Response) => {
    try {
        const invoice = req.body;
        const [result]: any = await pool.query(
            `INSERT INTO invoices (quote_id, client_name, invoice_number, items, total_amount, issue_date, due_date) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                invoice.quoteId || null,
                invoice.clientName,
                invoice.invoiceNumber,
                JSON.stringify(invoice.items),
                invoice.totalAmount,
                invoice.issueDate,
                invoice.dueDate
            ]
        );

        res.status(201).json({ id: result.insertId, ...invoice });
    } catch (error: any) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateInvoiceAndCheckAutomation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = req.body;

        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            await connection.query(
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

            // Fetch total paid so far
            const [paymentRows]: any = await connection.query(
                'SELECT SUM(amount) as totalPaid FROM payments WHERE invoice_id = ?',
                [id]
            );
            const totalPaid = Number(paymentRows[0]?.totalPaid || 0);

            // Check if this should trigger production
            const [existingProd]: any = await connection.query(
                'SELECT id FROM production_orders WHERE order_id = ?',
                [invoice.invoiceNumber]
            );

            if (existingProd.length === 0) {
                // Determine logic: RTW = 100%, Bespoke = 50%
                let isRTW = false;
                if (Array.isArray(invoice.items)) {
                    isRTW = invoice.items.some((i: any) => 
                        i.garmentName?.toLowerCase().includes('rtw') || 
                        i.garmentName?.toLowerCase().includes('ready')
                    );
                }

                const amountRequired = isRTW ? invoice.totalAmount : (invoice.totalAmount * 0.5);

                if (totalPaid > 0 && totalPaid >= amountRequired) {
                    await connection.query(
                        `INSERT INTO production_orders (order_id, brand_id, client_name, assigned_tailor, due_date)
                         VALUES (?, 'ATELIER-01', ?, 'Unassigned', ?)`,
                        [invoice.invoiceNumber, invoice.clientName, invoice.dueDate]
                    );

                    await connection.query(
                        `INSERT INTO system_notifications (title, message, type, department, target_role)
                         VALUES (?, ?, 'success', 'production', 'all')`,
                        [
                            'New Work Order Generated',
                            `Invoice ${invoice.invoiceNumber} has reached its payment threshold (${isRTW ? '100% RTW' : '50% Bespoke'}). Production can commence for ${invoice.clientName}.`
                        ]
                    );
                }
            }

            await connection.commit();
            res.json({ message: 'Invoice updated and automation checked' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error updating invoice:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteInvoice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
        res.json({ message: 'Invoice deleted' });
    } catch (error: any) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({ error: error.message });
    }
};
