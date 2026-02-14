'use client';

import React, { useState } from 'react';
import { useStorage } from '@/context/StorageContext';
import { ArrowLeft, CreditCard, Search, Link as LinkIcon, Trash2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function UnmatchedPaymentsPage() {
    const router = useRouter();
    const { unmatchedPayments, settings, refreshData } = useStorage();
    const [searchTerm, setSearchTerm] = useState('');

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to dismiss this payment record?')) return;
        const res = await fetch('/api/payments/unmatched', {
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
        if (res.ok) refreshData();
    };

    const filtered = unmatchedPayments.filter(p =>
        p.phone?.includes(searchTerm) ||
        p.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={() => router.back()} className={styles.backButton}>
                    <ArrowLeft size={14} /> Atelier
                </button>
                <span className={styles.brandLabel}>Manual Reconciliation</span>
                <h1 className={styles.title}>Payment Review Queue</h1>
            </header>

            <div className={styles.searchBar}>
                <Search size={18} />
                <input
                    placeholder="Search by phone, name or transaction ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className={styles.list}>
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <CheckCircle size={48} color="var(--color-success)" style={{ marginBottom: '1rem' }} />
                        <h3>Clear Skies</h3>
                        <p>All incoming payments have been successfully matched.</p>
                    </div>
                ) : (
                    filtered.map((p: any) => (
                        <div key={p.id} className={styles.paymentCard}>
                            <div className={styles.paymentMain}>
                                <div className={styles.amountWrap}>
                                    <span className={styles.currency}>{settings.currency}</span>
                                    <span className={styles.amount}>{Number(p.amount).toLocaleString()}</span>
                                </div>
                                <div className={styles.details}>
                                    <div className={styles.phone}>From: {p.phone || 'Unknown Sender'}</div>
                                    <div className={styles.comment}>"{p.comment || 'No comment provided'}"</div>
                                    <div className={styles.meta}>
                                        <span>ID: {p.transaction_id}</span>
                                        <span>•</span>
                                        <span>{formatDate(p.date)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button className={styles.matchBtn} onClick={() => alert('Manual matching UI coming soon - Link to Invoice feature')}>
                                    <LinkIcon size={14} /> Match to Invoice
                                </button>
                                <button className={styles.deleteBtn} onClick={() => handleDelete(p.id)}>
                                    <Trash2 size={14} /> Dismiss
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
