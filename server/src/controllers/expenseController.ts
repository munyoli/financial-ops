import { Request, Response } from 'express';
import pool from '../config/db';

export const getExpenses = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
        res.json(rows);
    } catch (error: any) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createExpense = async (req: Request, res: Response) => {
    try {
        const expense = req.body;
        const [result]: any = await pool.query(
            `INSERT INTO expenses (category, amount, date, description, notes) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                expense.category,
                expense.amount,
                expense.date,
                expense.description || null,
                expense.notes || null
            ]
        );

        res.status(201).json({ id: result.insertId, ...expense });
    } catch (error: any) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateExpense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const expense = req.body;

        await pool.query(
            `UPDATE expenses 
             SET category = ?, amount = ?, date = ?, description = ?, notes = ? 
             WHERE id = ?`,
            [
                expense.category,
                expense.amount,
                expense.date,
                expense.description || null,
                expense.notes || null,
                id
            ]
        );

        res.json({ message: 'Expense updated' });
    } catch (error: any) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteExpense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
        res.json({ message: 'Expense deleted' });
    } catch (error: any) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: error.message });
    }
};
