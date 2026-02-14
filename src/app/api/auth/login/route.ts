import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // 1. Find User
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const user = rows[0];

        // 2. Verify User & Password
        if (!user || !(await comparePassword(password, user.password_hash))) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // 3. Generate Token
        const token = await signToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        // 4. Create Response with HTTP-Only Cookie
        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
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

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
