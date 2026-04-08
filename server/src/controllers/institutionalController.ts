import { Request, Response } from 'express';
import pool from '../config/db';

export const getInventory = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM inventory ORDER BY name ASC');
        res.json(rows);
    } catch (error: any) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM system_notifications ORDER BY created_at DESC LIMIT 50');
        res.json(rows);
    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: error.message });
    }
};

export const markNotificationRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE system_notifications SET is_read = TRUE WHERE id = ?', [id]);
        res.json({ message: 'Notification marked as read' });
    } catch (error: any) {
        console.error('Error updating notification:', error);
        res.status(500).json({ error: error.message });
    }
};
