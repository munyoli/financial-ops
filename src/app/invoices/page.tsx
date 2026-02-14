'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStorage } from '@/context/StorageContext';
import { Plus, Search, Filter } from 'lucide-react';
import styles from './page.module.css';

export default function InvoicesPage() {
    const { invoices, settings } = useStorage();
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredInvoices = invoices.filter((inv) => {
        if (filter === 'all') return true;
        if (filter === 'pending') return inv.status === 'pending' || inv.status === 'partial';
        return inv.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'var(--color-success)';
            case 'partial': return 'var(--color-accent)';
            case 'pending': return 'var(--color-text-muted)';
            case 'overdue': return 'var(--color-danger)';
            default: return 'var(--color-text-muted)';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!mounted) return '';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatNumber = (num: number) => {
        if (!mounted) return num.toString();
        return num.toLocaleString();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.brandLabel}>Statements & Records</span>
                    <h1 className={styles.title}>Client Invoices</h1>
                </div>
                {/* Manual invoice entry is a future feature, for now keep the button to accepted quotes */}
                <Link href="/quotes" className={styles.createButton}>
                    <Plus size={18} /> New Statement
                </Link>
            </header>

            <div className={styles.filters}>
                {(['all', 'pending', 'paid', 'overdue'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`${styles.filterChip} ${filter === f ? styles.activeFilter : ''}`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            <div className={styles.list}>
                {filteredInvoices.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Search size={48} style={{ color: 'var(--color-border)', marginBottom: '1rem' }} />
                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>No records found.</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Automate your billing by converting accepted quotations.</p>
                    </div>
                ) : (
                    filteredInvoices.map((inv) => (
                        <Link key={inv.id} href={`/invoices/${inv.id}`} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.invoiceNumber}>ID: {inv.invoiceNumber}</span>
                                <span
                                    className={styles.statusBadge}
                                    style={{ backgroundColor: getStatusColor(inv.status) }}
                                >
                                    {inv.status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                                <img src="/images/luxury/avatar.png" className={styles.avatar} alt="Client" />
                                <h2 className={styles.clientName} style={{ marginBottom: 0 }}>{inv.clientName}</h2>
                            </div>
                            <div className={styles.cardFooter}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span className={styles.date}>{formatDate(inv.issueDate)}</span>
                                </div>
                                <span className={styles.amount}>
                                    {settings.currency} {formatNumber(inv.totalAmount)}
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

