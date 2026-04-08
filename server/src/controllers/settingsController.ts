import { Request, Response } from 'express';
import pool from '../config/db';

export const getSettings = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM settings WHERE id = 1');
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Settings not found' });
        }

        const s = rows[0];
        // Map DB snake_case to Frontend camelCase
        res.json({
            businessName: s.business_name,
            currency: s.currency,
            overheadRate: Number(s.overhead_rate),
            minProfitMargin: Number(s.min_profit_margin),
            wholesaleMarkup: Number(s.wholesale_markup),
            retailMarkup: Number(s.retail_markup),
            taxRate: Number(s.tax_rate),
            estimatedMonthlyVolume: s.estimated_monthly_volume,
            monthlyOverheads: typeof s.monthly_overheads === 'string' ? JSON.parse(s.monthly_overheads) : s.monthly_overheads
        });
    } catch (error: any) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const s = req.body;
        await pool.query(
            `UPDATE settings SET 
                business_name = ?, 
                currency = ?, 
                overhead_rate = ?, 
                min_profit_margin = ?, 
                wholesale_markup = ?, 
                retail_markup = ?, 
                tax_rate = ?, 
                estimated_monthly_volume = ?, 
                monthly_overheads = ?
             WHERE id = 1`,
            [
                s.businessName,
                s.currency,
                s.overheadRate,
                s.minProfitMargin,
                s.wholesaleMarkup,
                s.retailMarkup,
                s.taxRate,
                s.estimatedMonthlyVolume,
                JSON.stringify(s.monthlyOverheads)
            ]
        );

        res.json({ message: 'Settings updated successfully' });
    } catch (error: any) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: error.message });
    }
};
