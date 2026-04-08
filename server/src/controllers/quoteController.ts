import { Request, Response } from 'express';
import pool from '../config/db';
import { getNextSequence } from '../lib/sequence_utils';

export const getQuotes = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM quotes ORDER BY created_at DESC');
        
        const formatted = rows.map((row: any) => ({
            ...row,
            items: typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || [])
        }));

        res.json(formatted);
    } catch (error: any) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createQuote = async (req: Request, res: Response) => {
    try {
        const quote = req.body;
        const quote_number = await getNextSequence('quote');
        
        const [result]: any = await pool.query(
            `INSERT INTO quotes (quote_number, client_name, client_email, client_phone, items, subtotal, tax, total_price, status, valid_until, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                quote_number,
                quote.clientName,
                quote.clientEmail,
                quote.clientPhone,
                JSON.stringify(quote.items),
                quote.totalCost || 0,
                quote.tax || 0,
                quote.totalClientPrice || 0,
                quote.status || 'draft',
                quote.validUntil || null,
                quote.notes || null
            ]
        );

        res.status(201).json({ id: result.insertId, quote_number, ...quote });
    } catch (error: any) {
        console.error('Error creating quote:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateQuote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quote = req.body;

        await pool.query(
            `UPDATE quotes 
             SET client_name = ?, client_email = ?, client_phone = ?, items = ?, subtotal = ?, tax = ?, total_price = ?, status = ?, valid_until = ?, notes = ? 
             WHERE id = ?`,
            [
                quote.clientName,
                quote.clientEmail,
                quote.clientPhone,
                JSON.stringify(quote.items),
                quote.totalCost,
                quote.tax || 0,
                quote.totalClientPrice,
                quote.status,
                quote.validUntil || null,
                quote.notes || null,
                id
            ]
        );

        res.json({ message: 'Quote updated' });
    } catch (error: any) {
        console.error('Error updating quote:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteQuote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM quotes WHERE id = ?', [id]);
        res.json({ message: 'Quote deleted' });
    } catch (error: any) {
        console.error('Error deleting quote:', error);
        res.status(500).json({ error: error.message });
    }
};
