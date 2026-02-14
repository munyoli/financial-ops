'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStorage } from '@/context/StorageContext';
import { Plus, Search, FileText, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

export default function QuotationsPage() {
    const { quotes, settings } = useStorage();
    const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'rejected'>('all');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredQuotes = quotes.filter((q) => {
        if (filter === 'all') return true;
        return q.status === filter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'var(--color-success)';
            case 'sent': return 'var(--color-accent)';
            case 'draft': return 'var(--color-text-muted)';
            case 'rejected': return 'var(--color-danger)';
            default: return 'var(--color-text-muted)';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!mounted) return '';
        try {
            return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        } catch (e) {
            return 'Date Unknown';
        }
    };

    const formatNumber = (num: number) => {
        if (!mounted) return num.toString();
        return num.toLocaleString();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.brandLabel}>Bespoke Valuations</span>
                    <h1 className={styles.title}>Quotations List</h1>
                </div>
                <Link href="/pricing" className={styles.createButton}>
                    <Plus size={18} /> New Quotation
                </Link>
            </header>

            <div className={styles.filters}>
                {(['all', 'draft', 'sent', 'accepted', 'rejected'] as const).map((f) => (
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
                {filteredQuotes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Search size={48} style={{ color: 'var(--color-border)', marginBottom: '1rem' }} />
                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>No records found.</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Create your first valuation to begin the bespoke process.</p>
                    </div>
                ) : (
                    filteredQuotes.map((q) => (
                        <Link key={q.id} href={`/quotes/${q.id}`} className={styles.card}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src="/images/luxury/avatar.png" className={styles.avatar} alt="Client" />
                                <div className={styles.cardInfo}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.clientName}>{q.clientName || 'Valued Client'}</span>
                                        <span
                                            className={styles.statusBadge}
                                            style={{ backgroundColor: getStatusColor(q.status) }}
                                        >
                                            {q.status}
                                        </span>
                                    </div>
                                    <div className={styles.cardSub}>
                                        <span className={styles.date}>{formatDate(q.date)}</span>
                                        {q.items && q.items.length > 0 && (
                                            <span className={styles.itemTag}>{q.items[0].garmentName} {q.items.length > 1 ? `(+${q.items.length - 1})` : ''}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.cardAction}>
                                <div className={styles.price}>
                                    <span className={styles.currency}>{settings.currency}</span>
                                    <span className={styles.amount}>{formatNumber(q.totalClientPrice)}</span>
                                </div>
                                <ChevronRight size={20} className={styles.arrow} />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
