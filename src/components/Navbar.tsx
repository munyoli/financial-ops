'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scissors, Settings, Home, Receipt, DollarSign, Gem } from 'lucide-react';
import styles from './Navbar.module.css';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const pathname = usePathname();
    const { user } = useAuth();

    if (!user) return null;

    return (
        <nav className={styles.navbar}>
            <Link href="/" className={clsx(styles.navItem, pathname === '/' && styles.active)}>
                <Home size={20} />
                <span>Atelier</span>
            </Link>
            <Link href="/quotes" className={clsx(styles.navItem, pathname.startsWith('/quotes') && styles.active)}>
                <Scissors size={20} />
                <span>Quotations</span>
            </Link>
            <Link href="/invoices" className={clsx(styles.navItem, pathname.startsWith('/invoices') && styles.active)}>
                <Receipt size={20} />
                <span>Statements</span>
            </Link>
            <Link href="/expenses" className={clsx(styles.navItem, pathname.startsWith('/expenses') && styles.active)}>
                <DollarSign size={20} />
                <span>Expenses</span>
            </Link>
            <Link href="/settings" className={clsx(styles.navItem, pathname === '/settings' && styles.active)}>
                <Settings size={20} />
                <span>Configure</span>
            </Link>
        </nav>
    );
}
