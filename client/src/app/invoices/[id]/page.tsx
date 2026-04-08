'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStorage } from '@/context/StorageContext';
import { Invoice, Payment } from '@/lib/types';
import { Printer, ArrowLeft, Plus, Download, CreditCard, Calendar, FileText, Scissors } from 'lucide-react';
import styles from './page.module.css';

export default function InvoiceDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { invoices, updateInvoice, addProductionOrder, settings } = useStorage();
    const [invoice, setInvoice] = useState<Invoice | undefined>(undefined);
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [isStartingProduction, setIsStartingProduction] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Payment Form State
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [method, setMethod] = useState<'cash' | 'mpesa' | 'bank' | 'other'>('mpesa');
    const [notes, setNotes] = useState('');

    // Load invoice
    useEffect(() => {
        const found = invoices.find(i => i.id === id);
        setInvoice(found);
    }, [id, invoices]);

    if (!invoice) return <div className={styles.loading}>Preparing Statement...</div>;

    const handleStartProduction = async () => {
        if (!confirm('Initialize production job for this statement?')) return;
        
        setIsStartingProduction(true);
        try {
            await addProductionOrder({
                orderId: invoice.invoiceNumber,
                clientName: invoice.clientName,
                brandId: 'ATELIER-01', // Default
                dueDate: invoice.dueDate,
                startDate: new Date().toISOString()
            });
            alert('Production job initialized successfully!');
            router.push('/production');
        } catch (error) {
            console.error('Failed to start production:', error);
            alert('Failed to initialize production.');
        } finally {
            setIsStartingProduction(false);
        }
    };

    const totalPaid = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const balanceDue = invoice.totalAmount - totalPaid;

    const handleAddPayment = () => {
        const payAmount = parseFloat(amount);
        if (isNaN(payAmount) || payAmount <= 0) return;

        const newPayment: Payment = {
            id: crypto.randomUUID(),
            invoiceId: invoice.id,
            amount: payAmount,
            date,
            method,
            notes
        };

        const newTotalPaid = totalPaid + payAmount;
        let newStatus: Invoice['status'] = 'partial';
        if (newTotalPaid >= invoice.totalAmount) {
            newStatus = 'paid';
        } else if (newTotalPaid === 0) {
            newStatus = 'pending';
        }

        const updatedInvoice: Invoice = {
            ...invoice,
            payments: [...(invoice.payments || []), newPayment],
            status: newStatus
        };

        updateInvoice(updatedInvoice);
        setShowPaymentForm(false);
        setAmount('');
        setNotes('');
    };

    const handlePrint = () => {
        if (typeof window !== 'undefined') window.print();
    };

    const formatDate = (dateStr: string) => {
        if (!mounted) return '';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatHistoryDate = (dateStr: string) => {
        if (!mounted) return '';
        return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatNumber = (num: number) => {
        if (!mounted) return num.toString();
        return num.toLocaleString();
    };

    return (
        <div className={styles.container}>
            <div className={styles.actions}>
                <button onClick={() => router.back()} className={styles.backButton}>
                    <ArrowLeft size={16} /> Return to Ledger
                </button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={handleStartProduction} 
                        disabled={isStartingProduction}
                        className={styles.printButton}
                        style={{ border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}
                    >
                        <Scissors size={16} /> {isStartingProduction ? 'Initializing...' : 'Start Production'}
                    </button>
                    <button onClick={handlePrint} className={styles.printButton}>
                        <Printer size={16} /> Print Statement
                    </button>
                </div>
            </div>

            <div className={styles.paper}>
                <div className={`${styles.statusBanner} ${styles[invoice.status]}`}>
                    {invoice.status}
                </div>

                <header className={styles.header}>
                    <div>
                        <h1 className={styles.businessName}>{settings.businessName}</h1>
                        <div className={styles.meta}>
                            <p>Serial: {invoice.invoiceNumber}</p>
                            <p>Issued: {formatDate(invoice.issueDate)}</p>
                            <p>Expiry: {formatDate(invoice.dueDate)}</p>
                        </div>
                    </div>
                    <div className={styles.clientInfo}>
                        <h3>Bill To</h3>
                        <p className={styles.clientName}>{invoice.clientName}</p>
                    </div>
                </header>

                <img src="/images/luxury/dress.png" className={styles.dressImage} alt="Statement Garment" />

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th className={styles.right}>Qty</th>
                            <th className={styles.right}>Unit Price</th>
                            <th className={styles.right}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, idx) => (
                            <tr key={idx}>
                                <td>
                                    <div className={styles.itemName}>{item.garmentName} Bespoke</div>
                                    {item.notes && <div className={styles.itemNotes}>{item.notes}</div>}
                                </td>
                                <td className={styles.right}>{item.quantity || 1}</td>
                                <td className={styles.right}>{settings.currency} {formatNumber(item.unitPrice || (item.clientPrice / (item.quantity || 1)))}</td>
                                <td className={styles.right}>{settings.currency} {formatNumber(item.clientPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={3}>Total Investment</td>
                            <td className={styles.right}>{settings.currency} {formatNumber(invoice.totalAmount)}</td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={{ color: 'var(--color-success)' }}>Deposited / Paid</td>
                            <td className={styles.right}>{settings.currency} {formatNumber(totalPaid)}</td>
                        </tr>
                        <tr className={styles.balanceRow}>
                            <td colSpan={3}>Balance Due</td>
                            <td className={styles.right}>{settings.currency} {formatNumber(balanceDue)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className={styles.paymentsSection}>
                    <div className={styles.paymentsHeader}>
                        <h3>Statement History</h3>
                        {balanceDue > 0 && (
                            <button
                                onClick={() => setShowPaymentForm(!showPaymentForm)}
                                className={styles.addPaymentButton}
                            >
                                <Plus size={14} /> Log Payment
                            </button>
                        )}
                    </div>

                    {showPaymentForm && (
                        <div className={styles.paymentForm}>
                            <h4>Record Client Remittance</h4>
                            <div className={styles.formGroup}>
                                <label><CreditCard size={12} /> amount ({settings.currency})</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder={`Balance: ${balanceDue}`}
                                />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label><Calendar size={12} /> date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label><FileText size={12} /> method</label>
                                    <select value={method} onChange={(e) => setMethod(e.target.value as any)}>
                                        <option value="mpesa">M-Pesa</option>
                                        <option value="cash">Cash Remittance</option>
                                        <option value="bank">Bank Transfer</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Internal Notes</label>
                                <input
                                    type="text"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="e.g. Reference code or special conditions"
                                />
                            </div>
                            <div className={styles.formActions}>
                                <button onClick={() => setShowPaymentForm(false)} className={styles.cancelButton}>Discard</button>
                                <button onClick={handleAddPayment} className={styles.saveButton}>Register Payment</button>
                            </div>
                        </div>
                    )}

                    {(!invoice.payments || invoice.payments.length === 0) ? (
                        <p className={styles.noPayments}>No financial activity recorded for this statement.</p>
                    ) : (
                        <div className={styles.paymentList}>
                            {invoice.payments.map(p => (
                                <div key={p.id} className={styles.paymentItem}>
                                    <span>{formatHistoryDate(p.date)} — {p.method.toUpperCase()}</span>
                                    <span>{settings.currency} {p.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

