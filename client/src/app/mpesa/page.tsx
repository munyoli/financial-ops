'use client';

import React, { useState, useEffect } from 'react';
import { useStorage } from '@/context/StorageContext';
import { MpesaTransaction, MpesaTransactionType } from '@/lib/types';
import { 
    Search, Filter, ArrowDownLeft, ArrowUpRight, 
    Tag, MoreVertical, Plus, Check, X, 
    AlertCircle, ExternalLink, Calendar, Upload, FileUp
} from 'lucide-react';
import styles from './page.module.css';
import clsx from 'clsx';
import { format } from 'date-fns';

const CATEGORIES = [
    { id: 'client_payment', label: 'Client Payment', icon: '💰' },
    { id: 'fabric_purchase', label: 'Fabric Purchase', icon: '🧵' },
    { id: 'supplier_payment', label: 'Supplier Payment', icon: '🏭' },
    { id: 'trimmings', label: 'Trimmings & Accessories', icon: '✂️' },
    { id: 'salary', label: 'Salary / Wages', icon: '👷' },
    { id: 'rent', label: 'Rent', icon: '🏠' },
    { id: 'utilities', label: 'Utilities', icon: '💡' },
    { id: 'transport', label: 'Transport / Delivery', icon: '🚚' },
    { id: 'marketing', label: 'Marketing / Ads', icon: '📢' },
    { id: 'equipment', label: 'Equipment / Tools', icon: '🔧' },
    { id: 'personal', label: 'Personal Use', icon: '👤' },
    { id: 'other', label: 'Other', icon: '📋' },
];

export default function MpesaPage() {
    const { mpesaTransactions, updateMpesaTransaction, settings } = useStorage();
    const [filter, setFilter] = useState<'all' | 'unlabeled' | 'income' | 'expense'>('all');
    const [search, setSearch] = useState('');
    const [selectedTx, setSelectedTx] = useState<MpesaTransaction | null>(null);
    const [categorizing, setCategorizing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{message: string, isError: boolean} | null>(null);

    // Modal state
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');

    const filtered = mpesaTransactions.filter(tx => {
        const matchesSearch = 
            (tx.sender_name?.toLowerCase().includes(search.toLowerCase())) ||
            (tx.recipient_name?.toLowerCase().includes(search.toLowerCase())) ||
            (tx.transaction_code.toLowerCase().includes(search.toLowerCase()));
        
        if (!matchesSearch) return false;

        const isIncome = ['received', 'deposit'].includes(tx.type);
        
        switch (filter) {
            case 'unlabeled': return !tx.is_categorized;
            case 'income': return isIncome;
            case 'expense': return !isIncome;
            default: return true;
        }
    });

    const unCategorizedCount = mpesaTransactions.filter(tx => !tx.is_categorized).length;

    const handleOpenCategorize = (tx: MpesaTransaction) => {
        setSelectedTx(tx);
        setCategory(tx.category || '');
        setDescription(tx.description || '');
        setCategorizing(true);
    };

    const handleSaveCategorization = async () => {
        if (!selectedTx || !category) return;

        await updateMpesaTransaction({
            id: selectedTx.id,
            category,
            description,
            is_categorized: true
        });

        setCategorizing(false);
        setSelectedTx(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setUploadStatus(null);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('brandId', settings.businessName || 'ATELIER-01');

        try {
            const res = await fetch('/api/mpesa/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            
            if (res.ok) {
                setUploadStatus({ 
                    message: `Successfully imported ${data.summary.imported} transactions! (${data.summary.linked} auto-linked to invoices)`,
                    isError: false 
                });
                // Trigger refresh via storage context
                window.location.reload(); // Simple refresh for now
            } else {
                setUploadStatus({ message: data.error || 'Upload failed', isError: true });
            }
        } catch (error) {
            setUploadStatus({ message: 'Network error during upload', isError: true });
        } finally {
            setIsUploading(false);
        }
    };

    const isTxIncome = (type: string) => ['received', 'deposit'].includes(type);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.brandLabel}>Automated Accountant</span>
                    <h1 className={styles.title}>
                        M-Pesa Tracker
                        {unCategorizedCount > 0 && (
                            <span className={styles.unlabeledBadge}>{unCategorizedCount}</span>
                        )}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label className={styles.createButton} style={{ cursor: 'pointer', background: 'var(--color-bg)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>
                        <FileUp size={18} />
                        {isUploading ? 'Parsing...' : 'Upload Statement'}
                        <input type="file" hidden accept=".csv,.xlsx,.xls" onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                </div>
            </header>

            {uploadStatus && (
                <div 
                    className={clsx(styles.card, uploadStatus.isError ? styles.sent : styles.received)} 
                    style={{ marginBottom: '1.5rem', padding: '1rem' }}
                >
                    <AlertCircle size={20} />
                    <span style={{ fontSize: '0.875rem' }}>{uploadStatus.message}</span>
                    <button onClick={() => setUploadStatus(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className={styles.tabs}>
                <div className={clsx(styles.tab, filter === 'all' && styles.activeTab)} onClick={() => setFilter('all')}>All Transactions</div>
                <div className={clsx(styles.tab, filter === 'unlabeled' && styles.activeTab)} onClick={() => setFilter('unlabeled')}>
                    Unlabeled {unCategorizedCount > 0 && `(${unCategorizedCount})`}
                </div>
                <div className={clsx(styles.tab, filter === 'income' && styles.activeTab)} onClick={() => setFilter('income')}>Income</div>
                <div className={clsx(styles.tab, filter === 'expense' && styles.activeTab)} onClick={() => setFilter('expense')}>Expenses</div>
            </div>

            <div className={styles.searchBar} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by name or code..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.input}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                </div>
            </div>

            <div className={styles.list}>
                {filtered.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>No transactions found for this view.</p>
                    </div>
                ) : (
                    filtered.map(tx => {
                        const isIncome = isTxIncome(tx.type);
                        return (
                            <div 
                                key={tx.id} 
                                className={clsx(
                                    styles.card, 
                                    isIncome ? styles.received : styles.sent,
                                    !tx.is_categorized && styles.uncategorized
                                )}
                                onClick={() => handleOpenCategorize(tx)}
                            >
                                <div className={clsx(
                                    styles.iconWrapper,
                                    !tx.is_categorized ? styles.iconUncategorized : (isIncome ? styles.iconReceived : styles.iconSent)
                                )}>
                                    {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                
                                <div className={styles.txMain}>
                                    <div className={styles.txDetails}>
                                        <h3>{tx.is_categorized ? tx.description : (tx.sender_name || tx.recipient_name || tx.type.replace('_', ' '))}</h3>
                                        <div className={styles.txSub}>
                                            <span className={styles.code}>{tx.transaction_code}</span>
                                            <span>{format(new Date(tx.transaction_date), 'MMM d, h:mm a')}</span>
                                            {tx.is_categorized && (
                                                <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                                                    • {CATEGORIES.find(c => c.id === tx.category)?.label || tx.category}
                                                </span>
                                            )}
                                            {tx.linked_invoice_id && (
                                                <span style={{ color: 'var(--color-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Check size={12} /> Auto-Linked to Invoice
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.txAmount}>
                                        <span className={clsx(
                                            styles.amount,
                                            isIncome ? styles.amountReceived : styles.amountSent
                                        )}>
                                            {isIncome ? '+' : '-'} {settings.currency} {Number(tx.amount).toLocaleString()}
                                        </span>
                                        {!tx.is_categorized && (
                                            <span style={{ fontSize: '0.65rem', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase' }}>
                                                Label Required
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {categorizing && selectedTx && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Label Transaction</h2>
                            <button onClick={() => setCategorizing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{format(new Date(selectedTx.transaction_date), 'EEEE, MMMM d, yyyy')}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0.25rem 0' }}>
                                {isTxIncome(selectedTx.type) ? '+' : '-'} {settings.currency} {Number(selectedTx.amount).toLocaleString()}
                            </div>
                            <div style={{ fontSize: '0.875rem' }}>{selectedTx.sender_name || selectedTx.recipient_name || 'M-Pesa Transaction'}</div>
                        </div>

                        <label className={styles.brandLabel} style={{ marginBottom: '0.75rem' }}>What was this for?</label>
                        <div className={styles.categoryGrid}>
                            {CATEGORIES.map(cat => (
                                <div 
                                    key={cat.id} 
                                    className={clsx(styles.categoryChip, category === cat.id && styles.chipSelected)}
                                    onClick={() => setCategory(cat.id)}
                                >
                                    <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{cat.icon}</div>
                                    <div>{cat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                            <label className={styles.brandLabel}>Note (Optional)</label>
                            <input 
                                type="text" 
                                placeholder="e.g. 3m Silk Fabric" 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <button 
                            className={styles.createButton} 
                            style={{ width: '100%', marginTop: '2rem', justifyContent: 'center' }}
                            onClick={handleSaveCategorization}
                            disabled={!category}
                        >
                            <Check size={18} /> Update Ledger
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
