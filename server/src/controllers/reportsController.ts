import { Request, Response } from 'express';
import pool from '../config/db';

export const getReports = async (req: Request, res: Response) => {
    try {
        const [incomeRows]: any = await pool.query(`
            SELECT SUM(amount) as total_income 
            FROM mpesa_transactions 
            WHERE type IN ('received', 'deposit') AND MONTH(transaction_date) = MONTH(CURRENT_DATE())
        `);

        const [expenseRows]: any = await pool.query(`
            SELECT SUM(amount) as total_expenses 
            FROM expenses 
            WHERE MONTH(date) = MONTH(CURRENT_DATE())
        `);

        const grossRevenue = Number(incomeRows[0]?.total_income || 0);
        const operatingBurn = Number(expenseRows[0]?.total_expenses || 0);
        const netProfit = grossRevenue - operatingBurn;

        res.json({
            grossRevenue,
            operatingBurn,
            netProfit,
            margin: grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0
        });
    } catch (error: any) {
        console.error('Error generating reports:', error);
        res.status(500).json({ error: error.message });
    }
};
