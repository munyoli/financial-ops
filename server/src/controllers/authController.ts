import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-this-in-prod';

export const register = async (req: Request, res: Response) => {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const password_hash = await bcrypt.hash(password, 10);
        // First user is Admin, others are based on registration or default to 'user' role
        const [totalUsers]: any = await pool.query('SELECT COUNT(*) as count FROM users');
        const role = totalUsers[0].count === 0 ? 'admin' : 'user';
        const dept = department || (role === 'admin' ? 'admin' : 'sales');

        const [result]: any = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
            [name, email, password_hash, role, dept]
        );

        const newUser = {
            id: result.insertId,
            name,
            email,
            role,
            department: dept
        };

        // Sign JWT
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role, department: dept },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ user: newUser });
    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        console.log(`Login attempt for: ${email}`);
        const [rows]: any = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // In a real app, we would sign a JWT here. 
        // For now, we'll return the user data as requested by the frontend AuthContext.
        const { password_hash, ...userData } = user;

        // Sign JWT
        const token = jwt.sign(
            { id: userData.id, email: userData.email, role: userData.role, department: userData.department },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set Cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                department: userData.department
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = (req: Request, res: Response) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
};
