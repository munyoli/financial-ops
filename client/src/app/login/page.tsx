'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from '../auth.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error || 'Invalid email or password');
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <div className={styles.brandHeader}>
                    <span className={styles.brandLabel}>Couture Studio</span>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Enter your details to access your studio</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            placeholder="designer@couture.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={styles.submitBtn}
                    >
                        {isSubmitting ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <p className={styles.footer}>
                    New to the studio? <Link href="/register" className={styles.link}>Create Account</Link>
                </p>
            </div>
        </div>
    );
}
