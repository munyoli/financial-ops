'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Palette, Users, Scissors, Smartphone, Settings, Activity, TrendingUp, LogOut } from 'lucide-react';
import styles from './Navbar.module.css';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/context/StorageContext';
import NotificationCenter from './NotificationCenter';

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { mpesaTransactions } = useStorage();

    if (!user) return null;

    const unCategorizedCount = mpesaTransactions.filter(tx => !tx.is_categorized).length;

    return (
        <nav className={styles.navbar}>
            <div className={styles.navTop}>
                <Link href="/" className={clsx(styles.navItem, pathname === '/' && styles.active)}>
                    <Layers size={22} strokeWidth={1.5} />
                    <span>Collections</span>
                </Link>
                <Link href="/expenses" className={clsx(styles.navItem, pathname.startsWith('/expenses') && styles.active)}>
                    <Palette size={22} strokeWidth={1.5} />
                    <span>Textiles</span>
                </Link>
                <Link href="/invoices" className={clsx(styles.navItem, pathname.startsWith('/invoices') && styles.active)}>
                    <Users size={22} strokeWidth={1.5} />
                    <span>Clients</span>
                </Link>
                <Link href="/quotes" className={clsx(styles.navItem, pathname.startsWith('/quotes') && styles.active)}>
                    <Scissors size={22} strokeWidth={1.5} />
                    <span>Patterns</span>
                </Link>
                <Link href="/production" className={clsx(styles.navItem, pathname.startsWith('/production') && styles.active)}>
                    <Activity size={22} strokeWidth={1.5} />
                    <span>Production</span>
                </Link>
                <Link href="/mpesa" className={clsx(styles.navItem, pathname.startsWith('/mpesa') && styles.active)}>
                    <div style={{ position: 'relative' }}>
                        <Smartphone size={22} strokeWidth={1.5} />
                        {unCategorizedCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                background: 'var(--color-accent)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '14px',
                                height: '14px',
                                fontSize: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800
                            }}>
                                {unCategorizedCount}
                            </span>
                        )}
                    </div>
                    <span>M-Pesa</span>
                </Link>
                <Link href="/reports" className={clsx(styles.navItem, pathname.startsWith('/reports') && styles.active)}>
                    <TrendingUp size={22} strokeWidth={1.5} />
                    <span>Reports</span>
                </Link>
            </div>

            <div className={styles.navBottom} style={{ marginTop: 'auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', paddingBottom: '1rem' }}>
                <NotificationCenter />
                <Link href="/settings" className={clsx(styles.navItem, pathname === '/settings' && styles.active)}>
                    <Settings size={22} strokeWidth={1.5} />
                    <span>System</span>
                </Link>

                <button
                    onClick={() => logout()}
                    className={styles.navItem}
                    style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        color: 'var(--color-text-dim)',
                        marginTop: '0.5rem'
                    }}
                >
                    <LogOut size={22} strokeWidth={1.5} />
                    <span>Logout</span>
                </button>

                {user && (
                    <div style={{ fontSize: '10px', color: 'var(--color-accent)', fontWeight: 600, textTransform: 'uppercase', marginTop: '0.5rem' }}>
                        {user.department || user.role}
                    </div>
                )}
            </div>
        </nav>
    );
}
