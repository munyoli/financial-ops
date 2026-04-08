import { Request, Response } from 'express';
import pool from '../config/db';
import { getNextSequence } from '../lib/sequence_utils';

export const getProductionOrders = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query(`
            SELECT po.*, 
            (SELECT JSON_ARRAYAGG(JSON_OBJECT('status', ps.status, 'timestamp', ps.timestamp, 'notes', ps.notes))
             FROM production_stages ps WHERE ps.production_order_id = po.id) as stages
            FROM production_orders po
            ORDER BY po.created_at DESC
        `);

        const formatted = rows.map((row: any) => ({
            ...row,
            stages: typeof row.stages === 'string' ? JSON.parse(row.stages) : (row.stages || [])
        }));

        res.json(formatted);
    } catch (error: any) {
        console.error('Error fetching production orders:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createProductionOrder = async (req: Request, res: Response) => {
    try {
        let { order_id, brand_id, client_name, assigned_tailor, due_date, start_date } = req.body;

        if (!order_id) {
            order_id = await getNextSequence('production');
        }

        const [result]: any = await pool.query(
            `INSERT INTO production_orders (order_id, brand_id, client_name, assigned_tailor, due_date, start_date) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [order_id, brand_id || 'ATELIER-01', client_name, assigned_tailor, due_date || null, start_date || new Date()]
        );

        const production_order_id = result.insertId;

        await pool.query(
            `INSERT INTO production_stages (production_order_id, status, notes) 
             VALUES (?, 'cutting', 'Order initialized')`,
            [production_order_id]
        );

        res.status(201).json({ id: production_order_id, message: 'Production order created' });
    } catch (error: any) {
        console.error('Error creating production order:', error);
        res.status(500).json({ error: error.message });
    }
};

export const updateProductionOrder = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { current_status, progress_percentage, assigned_tailor, due_date, completed_date, notes } = req.body;

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [currentRows]: any = await connection.query(
                'SELECT current_status, order_id FROM production_orders WHERE id = ?',
                [id]
            );
            const oldStatus = currentRows[0]?.current_status;
            const orderIdForAlert = currentRows[0]?.order_id;

            const updates: string[] = [];
            const values: any[] = [];

            if (current_status !== undefined) {
                updates.push('current_status = ?');
                values.push(current_status);
            }
            if (progress_percentage !== undefined) {
                updates.push('progress_percentage = ?');
                values.push(progress_percentage);
            }
            if (assigned_tailor !== undefined) {
                updates.push('assigned_tailor = ?');
                values.push(assigned_tailor);
            }
            if (due_date !== undefined) {
                updates.push('due_date = ?');
                values.push(due_date);
            }
            
            if (current_status === 'done') {
                updates.push('completed_date = ?');
                values.push(completed_date || new Date());
            } else if (current_status !== undefined) {
                updates.push('completed_date = ?');
                values.push(completed_date || null);
            } else if (completed_date !== undefined) {
                updates.push('completed_date = ?');
                values.push(completed_date);
            }

            if (updates.length > 0) {
                const sql = `UPDATE production_orders SET ${updates.join(', ')} WHERE id = ?`;
                values.push(id);
                await connection.query(sql, values);
            }

            if ((current_status !== undefined && oldStatus !== current_status) || notes) {
                await connection.query(
                    `INSERT INTO production_stages (production_order_id, status, notes) 
                     VALUES (?, ?, ?)`,
                    [id, current_status || oldStatus, notes || `Status updated via board`]
                );

                // Inventory Automation Trigger
                if (current_status === 'cutting' && oldStatus !== 'cutting') {
                    // For demonstration, let's assume we deduct universally from 'Raw Silk - Ivory'
                    // In a precise implementation, we'd query the specific items in the quote linked to this order_id
                    const materialName = 'Raw Silk - Ivory';
                    const estimatedUsage = 3.5;

                    await connection.query(
                        `UPDATE inventory SET quantity_available = quantity_available - ? WHERE name = ? AND sourcing_model = 'bulk'`,
                        [estimatedUsage, materialName]
                    );

                    // Check if stock is low (below 5m threshold defined in requirements)
                    const [invRows]: any = await connection.query(
                        `SELECT quantity_available FROM inventory WHERE name = ?`,
                        [materialName]
                    );
                    
                    if (invRows.length > 0 && invRows[0].quantity_available < 5.0) {
                        await connection.query(
                            `INSERT INTO system_notifications (title, message, type, department, target_role)
                             VALUES (?, ?, 'warning', 'inventory', 'admin')`,
                            [
                                'Critical Stock Level Triggered',
                                `Production Order ${orderIdForAlert} has depleted ${materialName} below the 5-meter safety threshold. (${invRows[0].quantity_available}m remaining). Reorder required immediately.`
                            ]
                        );
                    }
                }

                // QC and Done Automation Triggers (Notify Sales)
                if ((current_status === 'qc' || current_status === 'done') && oldStatus !== current_status) {
                    await connection.query(
                        `INSERT INTO system_notifications (title, message, type, department, target_role)
                         VALUES (?, ?, 'success', 'sales', 'all')`,
                        [
                            `Order ${current_status === 'qc' ? 'Ready for QC' : 'Completed'}`,
                            `Production Order ${orderIdForAlert} for ${currentRows[0].client_name || 'Artisan Client'} is now in ${current_status}. Please notify the client for fitting/pickup.`
                        ]
                    );
                }
            }

            await connection.commit();
            res.json({ message: 'Production order updated successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error('Error updating production order:', error);
        res.status(500).json({ error: error.message });
    }
};
