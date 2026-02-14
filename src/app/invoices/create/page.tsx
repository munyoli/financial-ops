'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/context/StorageContext';
import { Quote, Invoice, QuoteItem } from '@/lib/types';
import { FileText, Plus, ArrowLeft, Calendar, User, Tag, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function CreateInvoicePage() {
    const router = useRouter();
    const { quotes, invoices, addInvoice, settings } = useStorage();

    const [mode, setMode] = useState<'quote' | 'direct'>('quote');
    const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');

    // Direct Mode States
    const [clientName, setClientName] = useState('');
    const [directAmount, setDirectAmount] = useState('');
    const [directDescription, setDirectDescription] = useState('');

    const eligibleQuotes = quotes.filter(q =>
        (q.status === 'sent' || q.status === 'accepted') &&
        !invoices.some(inv => inv.quoteId === q.id)
    );

    const selectedQuote = quotes.find(q => q.id === selectedQuoteId);

    useEffect(() => {
        const count = invoices.length + 1;
        setInvoiceNumber(`INV-${String(count).padStart(3, '0')}`);
    }, [invoices]);

    useEffect(() => {
        const date = new Date(issueDate);
        date.setDate(date.getDate() + 14);
        setDueDate(date.toISOString().split('T')[0]);
    }, [issueDate]);

    const handleCreate = async () => {
        let newInvoice: Invoice;

        if (mode === 'quote') {
            if (!selectedQuote) return;
            newInvoice = {
                id: crypto.randomUUID(),
                quoteId: selectedQuote.id,
                invoiceNumber,
                issueDate,
                dueDate,
                clientName: selectedQuote.clientName,
                clientPhone: selectedQuote.clientPhone,
                items: selectedQuote.items,
                totalAmount: selectedQuote.totalClientPrice,
                payments: [],
                status: 'pending'
            };
        } else {
            const amount = parseFloat(directAmount);
            if (!clientName || isNaN(amount)) return;

            const item: QuoteItem = {
                id: crypto.randomUUID(),
                garmentTypeId: 'manual',
                garmentName: directDescription || 'Custom Bespoke Service',
                quantity: 1,
                unitPrice: amount,
                fabricCost: 0,
                trimCost: 0,
                laborCost: amount,
                complexityAdjustment: 0,
                overheadAmount: 0,
                profitAmount: 0,
                clientPrice: amount
            };

            newInvoice = {
                id: crypto.randomUUID(),
                quoteId: '', // Direct entry has no quote link
                invoiceNumber,
                issueDate,
                dueDate,
                clientName,
                items: [item],
                totalAmount: amount,
                payments: [],
                status: 'pending'
            };
        }

        await addInvoice(newInvoice);
        router.push(`/invoices/${newInvoice.id}`);
    };

    return (
        <div className={styles.container}>
            <header style={{ marginBottom: '2rem' }}>
                <button onClick={() => router.back()} className={styles.secondaryButton} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ArrowLeft size={14} /> Atelier
                </button>
                <span className={styles.brandLabel}>Statements & Records</span>
                <h1 className={styles.title}>Generate Statement</h1>
            </header>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setMode('quote')}
                    className={mode === 'quote' ? styles.primaryButton : styles.secondaryButton}
                    style={{ margin: 0, flex: 1 }}
                >
                    From Quote
                </button>
                <button
                    onClick={() => setMode('direct')}
                    className={mode === 'direct' ? styles.primaryButton : styles.secondaryButton}
                    style={{ margin: 0, flex: 1 }}
                >
                    Direct Entry
                </button>
            </div>

            {mode === 'quote' && eligibleQuotes.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No accepted quotes available.</p>
                    <p className={styles.subtext}>You can create a direct statement instead or process a quote.</p>
                    <button onClick={() => setMode('direct')} className={styles.secondaryButton}>
                        Switch to Direct Entry
                    </button>
                </div>
            ) : (
                <div className={styles.form}>
                    {mode === 'quote' ? (
                        <div className={styles.group}>
                            <label className={styles.label}><FileText size={12} /> Select Master Quote</label>
                            <select
                                value={selectedQuoteId}
                                onChange={(e) => setSelectedQuoteId(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">-- Choose a record --</option>
                                {eligibleQuotes.map(q => (
                                    <option key={q.id} value={q.id}>
                                        {q.clientName} — {settings.currency}{q.totalClientPrice.toLocaleString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <>
                            <div className={styles.group}>
                                <label className={styles.label}><User size={12} /> Client Name</label>
                                <input
                                    className={styles.input}
                                    placeholder="Enter beneficiary name"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                />
                            </div>
                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label className={styles.label}><Tag size={12} /> Service Description</label>
                                    <input
                                        className={styles.input}
                                        placeholder="e.g. Wedding Suit Fitting"
                                        value={directDescription}
                                        onChange={e => setDirectDescription(e.target.value)}
                                    />
                                </div>
                                <div className={styles.group}>
                                    <label className={styles.label}>Valuation ({settings.currency})</label>
                                    <input
                                        type="number"
                                        className={styles.input}
                                        placeholder="0.00"
                                        value={directAmount}
                                        onChange={e => setDirectAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {((mode === 'quote' && selectedQuote) || mode === 'direct') && (
                        <div className={styles.animateFade}>
                            {mode === 'quote' && selectedQuote && (
                                <div className={styles.card}>
                                    <h3>Bespoke Summary</h3>
                                    <p>{selectedQuote.clientName}</p>
                                    <div className={styles.list}>
                                        {selectedQuote.items.map(item => (
                                            <div key={item.id} className={styles.listItem}>
                                                <span>{item.garmentName} Fabrication</span>
                                                <span style={{ fontWeight: 700 }}>{settings.currency}{item.clientPrice.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                                        Total: {settings.currency}{selectedQuote.totalClientPrice.toLocaleString()}
                                    </div>
                                </div>
                            )}

                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label className={styles.label}><Tag size={12} /> Statement Serial</label>
                                    <input
                                        type="text"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.group}>
                                    <label className={styles.label}><Calendar size={12} /> Issued On</label>
                                    <input
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) => setIssueDate(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.group}>
                                    <label className={styles.label}><Calendar size={12} /> Due Date</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className={styles.input}
                                    />
                                </div>
                            </div>

                            <button onClick={handleCreate} className={styles.primaryButton} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                Archive & Generate Statement <ArrowRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
