'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStorage } from '@/context/StorageContext';
import { Quote, Invoice } from '@/lib/types';
import { Printer, ArrowLeft, CheckCircle, Send, Trash2, Receipt, Phone, FileText } from 'lucide-react';
import styles from './page.module.css';

export default function QuoteDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { quotes, updateQuote, deleteQuote, addInvoice, settings } = useStorage();
    const [quote, setQuote] = useState<Quote | undefined>(undefined);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const found = quotes.find(q => q.id === String(id));
        setQuote(found);
    }, [id, quotes]);

    if (!quote) return <div className={styles.loading}>Retrieving Valuation...</div>;

    const handleStatusChange = async (newStatus: Quote['status']) => {
        await updateQuote({ ...quote, status: newStatus });
    };

    const handleConvertToInvoice = async () => {
        const invoiceData: Invoice = {
            id: crypto.randomUUID(),
            quoteId: quote.id,
            invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            clientName: quote.clientName,
            totalAmount: quote.totalClientPrice,
            status: 'pending',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: quote.items,
            payments: []
        };

        await addInvoice(invoiceData);
        // addInvoice also updates quote status to 'accepted' in the backend
        router.push('/invoices');
    };

    const formatNumber = (num: number) => {
        if (!mounted) return num.toString();
        return num.toLocaleString();
    };

    const formatDate = (dateStr: string) => {
        if (!mounted) return '';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className={styles.container}>
            <div className={styles.actions}>
                <button onClick={() => router.push('/quotes')} className={styles.backButton}>
                    <ArrowLeft size={16} /> All Quotations
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => window.print()} className={styles.secondaryButton}>
                        <Printer size={16} /> Print
                    </button>
                    {quote.status !== 'accepted' && (
                        <button onClick={handleConvertToInvoice} className={styles.primaryButton}>
                            <Receipt size={16} /> Convert to Statement
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.paper}>
                <div className={`${styles.statusBadge} ${styles[quote.status]}`}>
                    {quote.status}
                </div>

                <header className={styles.header}>
                    <div className={styles.brandInfo}>
                        <h1 className={styles.businessName}>{settings.businessName}</h1>
                        <p className={styles.docType}>Bespoke Fabrication Quotation</p>
                    </div>
                    <div className={styles.meta}>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Date:</span>
                            <span>{formatDate(quote.date)}</span>
                        </div>
                        <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>Reference:</span>
                            <span>QT-{quote.id.slice(0, 8)}</span>
                        </div>
                    </div>
                </header>

                <div className={styles.clientSection}>
                    <div className={styles.to}>
                        <h3>Prepared For</h3>
                        <p className={styles.clientName}>{quote.clientName}</p>
                        {quote.clientPhone && (
                            <p className={styles.clientContact}><Phone size={12} /> {quote.clientPhone}</p>
                        )}
                    </div>
                </div>

                <img src="/images/luxury/dress.png" className={styles.dressImage} alt="Bespoke Garment" />

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th className={styles.right}>Qty</th>
                            <th className={styles.right}>Unit Investment</th>
                            <th className={styles.right}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quote.items.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <div className={styles.itemName}>{item.garmentName} Bespoke</div>
                                    {item.notes && <div className={styles.itemNotes}>{item.notes}</div>}
                                </td>
                                <td className={styles.right}>{item.quantity}</td>
                                <td className={styles.right}>{settings.currency} {formatNumber(item.unitPrice)}</td>
                                <td className={styles.right}>{settings.currency} {formatNumber(item.clientPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className={styles.footer}>
                    <div className={styles.notesSection}>
                        <h3>Artisanal Notes</h3>
                        <p>{quote.notes || 'No specific fabrication notes provided for this record.'}</p>
                    </div>
                    <div className={styles.totals}>
                        <div className={styles.totalRow}>
                            <span>Total Investment</span>
                            <span className={styles.grandTotal}>{settings.currency} {formatNumber(quote.totalClientPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.lifecycle}>
                <h3>Lifecycle Management</h3>
                <div className={styles.lifecycleButtons}>
                    <button
                        onClick={() => handleStatusChange('sent')}
                        className={`${styles.cycleBtn} ${quote.status === 'sent' ? styles.active : ''}`}
                    >
                        <Send size={14} /> Mark as Sent
                    </button>
                    <button
                        onClick={() => handleStatusChange('accepted')}
                        className={`${styles.cycleBtn} ${quote.status === 'accepted' ? styles.active : ''}`}
                    >
                        <CheckCircle size={14} /> Mark Accepted
                    </button>
                    <button
                        onClick={async () => { if (confirm('Permanently delete this record?')) { await deleteQuote(quote.id); router.push('/quotes'); } }}
                        className={styles.deleteBtn}
                    >
                        <Trash2 size={14} /> Delete Record
                    </button>
                </div>
            </div>
        </div>
    );
}
