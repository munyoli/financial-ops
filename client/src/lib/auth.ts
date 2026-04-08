import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// Secret key for signing JWTs. 
// In production, this MUST be a strong secret in process.env.JWT_SECRET
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'dev-secret-key-change-this-in-prod'
);

const ALG = 'HS256';

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainText, salt);
}

/**
 * Verify a plain text password against a hash
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
}

/**
 * Sign a JWT token (Edge compatible using 'jose')
 */
export async function signToken(payload: { id: number; email: string; role: string }) {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: ALG })
        .setIssuedAt()
        .setExpirationTime('7d') // Token valid for 7 days
        .sign(JWT_SECRET);
}

/**
 * Verify a JWT token and return payload
 */
export async function verifyToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET, {
            algorithms: [ALG],
        });
        return payload;
    } catch (error) {
        return null;
    }
}
