'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import styles from '../auth.module.css';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [department, setDepartment] = useState('admin');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const data: any = await apiClient.post('/auth/register', { name, email, password, department });

            if (data.user) {
                if (data.user) {
                    localStorage.setItem('couture_user', JSON.stringify(data.user));
                }
                router.push('/');
                // Optional: window.location.href = '/' for full reload
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err: any) {
            setError(err.message || 'Connection error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.authCard}>
                <div className={styles.brandHeader}>
                    <span className={styles.brandLabel}>Admin Setup</span>
                    <h1 className={styles.title}>Couture Studio</h1>
                    <p className={styles.subtitle}>Initialize your administrative account</p>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Full Name</label>
                        <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email Address</label>
                        <input
                            type="email"
                            placeholder="admin@couture.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Department</label>
                        <select
                            className={styles.input}
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            style={{ background: 'white' }}
                        >
                            <option value="admin">Administration</option>
                            <option value="sales">Sales & Marketing</option>
                            <option value="production">Garment Production</option>
                            <option value="inventory">Fabric & Trim Inventory</option>
                            <option value="finance">Finance & Accounts</option>
                        </select>
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
                        {isSubmitting ? 'Creating Account...' : 'Initialize Studio'}
                    </button>
                </form>

                <p className={styles.footer}>
                    Already configured? <Link href="/login" className={styles.link}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}
