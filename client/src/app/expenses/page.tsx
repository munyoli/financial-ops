'use client';

import React, { useState, useEffect } from 'react';
import { useStorage } from '@/context/StorageContext';
import { Expense } from '@/lib/types';
import { Trash2, Plus, Edit2, X, DollarSign, Calendar, Tag } from 'lucide-react';
import styles from './page.module.css';

export default function ExpensesPage() {
    const { expenses, addExpense, updateExpense, deleteExpense, settings } = useStorage();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Form State
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [notes, setNotes] = useState('');

    const PREDEFINED_CATEGORIES = ['Materials', 'Studio Rent', 'Utilities', 'Marketing', 'Labor', 'Travel', 'Other'];

    const handleEdit = (expense: Expense) => {
        setEditingId(expense.id);
        if (PREDEFINED_CATEGORIES.includes(expense.category)) {
            setCategory(expense.category);
            setCustomCategory('');
        } else {
            setCategory('Other');
            setCustomCategory(expense.category);
        }
        setAmount(expense.amount.toString());
        setDate(expense.date);
        setDescription(expense.description || '');
        setNotes(expense.notes || '');
        setShowForm(true);
    };

    const handleSave = async () => {
        const finalCategory = category === 'Other' && customCategory ? customCategory : category;
        const val = parseFloat(amount);
        if (!finalCategory || isNaN(val) || val <= 0) return;

        if (editingId) {
            await updateExpense({
                id: editingId,
                category: finalCategory,
                amount: val,
                date,
                description,
                notes
            });
        } else {
            await addExpense({
                id: crypto.randomUUID(),
                category: finalCategory,
                amount: val,
                date,
                description,
                notes
            });
        }

        resetForm();
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingId(null);
        setCategory('');
        setCustomCategory('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setNotes('');
    };

    // Sort by date desc
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const formatDate = (dateStr: string) => {
        if (!mounted) return '';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatNumber = (num: number) => {
        if (!mounted) return num.toString();
        return num.toLocaleString();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <span className={styles.brandLabel}>Studio Ledger</span>
                    <h1 className={styles.title}>Operational Expenses</h1>
                </div>
                <button onClick={() => setShowForm(true)} className={styles.createButton}>
                    <Plus size={18} /> Record New Expense
                </button>
            </header>

            {showForm && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ marginBottom: 0 }}>{editingId ? 'Refine Record' : 'Log Studio Expense'}</h2>
                            <button onClick={resetForm} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className={styles.formGroup}>
                                <label><Tag size={12} /> Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className={styles.input}>
                                    <option value="">Select Category</option>
                                    {PREDEFINED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label><Calendar size={12} /> Transaction Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        {category === 'Other' && (
                            <div className={styles.animateFade}>
                                <div className={styles.formGroup}>
                                    <label>Custom Label</label>
                                    <input
                                        type="text"
                                        placeholder="Enter category name"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label><DollarSign size={12} /> Amount ({settings.currency})</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>General Description</label>
                            <input
                                type="text"
                                placeholder="Short identification..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Internal Artisanal Notes</label>
                            <textarea
                                placeholder="Additional details, vendor info, etc."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className={styles.input}
                                style={{ minHeight: '80px', paddingTop: '0.5rem' }}
                            />
                        </div>

                        <div className={styles.formActions}>
                            <button onClick={resetForm} className={styles.cancelButton}>Discard</button>
                            <button onClick={handleSave} className={styles.saveButton}>Save Expense Record</button>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.list}>
                {sortedExpenses.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>The studio ledger is currently clear.</p>
                        <button onClick={() => setShowForm(true)} className={styles.primaryButton}>
                            <Plus size={18} /> Record First Expense
                        </button>
                    </div>
                ) : (
                    sortedExpenses.map(expense => (
                        <div key={expense.id} className={styles.card}>
                            <div className={styles.cardMain}>
                                <div className={styles.cardInfo}>
                                    <div className={styles.category}>{expense.category}</div>
                                    <div className={styles.desc}>{expense.description || 'General Expense'}</div>
                                    {expense.notes && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: '0.5rem' }}>{expense.notes}</div>}
                                    <div className={styles.date}>{formatDate(expense.date)}</div>
                                </div>
                                <div className={styles.amount}>
                                    {settings.currency} {formatNumber(expense.amount)}
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button onClick={() => handleEdit(expense)} className={styles.iconButton} aria-label="Edit"><Edit2 size={16} /></button>
                                <button onClick={() => deleteExpense(expense.id)} className={styles.iconButton} aria-label="Delete"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

