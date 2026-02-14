import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { hashPassword, comparePassword, signToken } from '@/lib/auth';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
    try {
        const { name, email, password } = await request.json();

        // 1. Basic Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Missing name, email, or password' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // 2. Check if user already exists
        const [existing] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            const user = existing[0];

            // If user exists, check password
            const isValid = await comparePassword(password, user.password_hash);

            if (!isValid) {
                return NextResponse.json(
                    { error: 'User with this email already exists. Incorrect password.' },
                    { status: 409 }
                );
            }

            // Password matches, log them in
            const token = await signToken({
                id: user.id,
                email: user.email,
                role: user.role,
            });

            const response = NextResponse.json({
                success: true,
                message: 'Welcome back! You have been logged in.',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });

            response.cookies.set('auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            return response;
        }

        // 3. Hash Password & Create User
        const hashedPassword = await hashPassword(password);

        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'admin'] // Defaulting to admin for now as you are the owner
        );

        // Also log them in after registration
        const token = await signToken({
            id: result.insertId,
            email,
            role: 'admin',
        });

        const response = NextResponse.json(
            {
                success: true,
                userId: result.insertId,
                message: 'User registered and logged in successfully'
            },
            { status: 201 }
        );

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
