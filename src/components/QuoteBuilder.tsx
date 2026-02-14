'use client';

import { useStorage } from '@/context/StorageContext';
import { GarmentType, Quote, QuoteItem } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChevronRight, ChevronLeft, Save, Check, Star, Scissors, User, Layers } from 'lucide-react';
import styles from './QuoteBuilder.module.css';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function QuoteBuilder() {
    const { settings, garmentTypes, addQuote } = useStorage();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [step, setStep] = useState(1);
    const [selectedGarmentId, setSelectedGarmentId] = useState<string>('');

    // Form State
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [quantity, setQuantity] = useState<number>(1);
    const [fabricCost, setFabricCost] = useState<number>(0);
    const [trimCost, setTrimCost] = useState<number>(0);
    const [laborOverride, setLaborOverride] = useState<number | null>(null);
    const [quoteNotes, setQuoteNotes] = useState('');

    const selectedGarment = garmentTypes.find(g => g.id === selectedGarmentId);

    // Calculations
    const laborCost = laborOverride !== null ? laborOverride : (selectedGarment?.defaultLaborCost || 0);
    const materialCost = fabricCost + trimCost;
    const primeCost = laborCost + materialCost;

    const overheadAmount = Math.ceil(primeCost * (settings.overheadRate / 100));
    const totalCost = primeCost + overheadAmount;

    const profitAmount = Math.ceil(totalCost * (settings.minProfitMargin / 100));
    const unitPrice = totalCost + profitAmount;
    const totalLinePrice = unitPrice * quantity;

    const formatNumber = (num: number) => {
        if (!mounted) return num.toString();
        return num.toLocaleString();
    };

    const handleSave = async () => {
        if (!selectedGarment) return;

        const newQuote: Quote = {
            id: uuidv4(),
            clientName: clientName || 'Walk-in Client',
            clientPhone: clientPhone,
            date: new Date().toISOString(),
            status: 'draft',
            totalCost: totalCost * quantity,
            totalClientPrice: totalLinePrice,
            notes: quoteNotes,
            items: [
                {
                    id: uuidv4(),
                    garmentTypeId: selectedGarment.id,
                    garmentName: selectedGarment.name,
                    quantity: quantity,
                    unitPrice: unitPrice,
                    fabricCost,
                    trimCost,
                    laborCost,
                    complexityAdjustment: laborOverride !== null ? laborOverride - (selectedGarment?.defaultLaborCost || 0) : 0,
                    overheadAmount,
                    profitAmount,
                    clientPrice: totalLinePrice,
                    notes: quoteNotes
                }
            ]
        };

        await addQuote(newQuote);
        router.push('/quotes');
    };

    return (
        <div style={{ paddingBottom: '100px' }}>
            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${(step / 4) * 100}%` }}></div>
            </div>

            <div className="couture-card">
                {step === 1 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.stepHeader}>
                            <div className={styles.stepHeaderInner}>
                                <span className="brand-label">Phase I</span>
                                <h2 className={styles.stepTitle}>Garment Selection</h2>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="label"><User size={12} /> Beneficiary / Client</label>
                                <input
                                    className="input"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    placeholder="Full name"
                                />
                            </div>
                            <div className="input-group">
                                <label className="label">Contact Phone</label>
                                <input
                                    className="input"
                                    value={clientPhone}
                                    onChange={e => setClientPhone(e.target.value)}
                                    placeholder="+254..."
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label"><Scissors size={12} /> Choose Model</label>
                            <div className={styles.garmentGrid}>
                                {garmentTypes.map(g => (
                                    <button
                                        key={g.id}
                                        className={`${styles.garmentBtn} ${selectedGarmentId === g.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedGarmentId(g.id)}
                                    >
                                        <div className={styles.garmentName}>{g.name}</div>
                                        <div className={styles.garmentPrice}>Base: {settings.currency} {formatNumber(g.defaultLaborCost)}</div>
                                        {selectedGarmentId === g.id && <Star size={14} style={{ position: 'absolute', top: 10, right: 10, color: 'var(--color-accent)' }} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.navRow}>
                            <span></span>
                            <button
                                className="btn btn-primary"
                                disabled={!selectedGarmentId}
                                style={{ padding: '1rem 2rem', gap: '0.5rem' }}
                                onClick={() => setStep(2)}
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.stepHeader}>
                            <div className={styles.stepHeaderInner}>
                                <span className="brand-label">Phase II</span>
                                <h2 className={styles.stepTitle}>Material Valuation</h2>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Order Quantity</label>
                            <input
                                className="input"
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label className="label">Primary Fabric Valuation</label>
                                <input
                                    className="input"
                                    type="number"
                                    value={fabricCost || ''}
                                    onChange={e => setFabricCost(Number(e.target.value))}
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="input-group">
                                <label className="label">Trimmings</label>
                                <input
                                    className="input"
                                    type="number"
                                    value={trimCost || ''}
                                    onChange={e => setTrimCost(Number(e.target.value))}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className={styles.navRow}>
                            <button className="btn btn-secondary" style={{ padding: '1rem 1.5rem' }} onClick={() => setStep(1)}><ChevronLeft size={18} /> Back</button>
                            <button className="btn btn-primary" style={{ padding: '1rem 2rem' }} onClick={() => setStep(3)}>Continue <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.stepHeader}>
                            <div className={styles.stepHeaderInner}>
                                <span className="brand-label">Phase III</span>
                                <h2 className={styles.stepTitle}>Craftsmanship</h2>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Complexity Adjustment (Final Labor per unit)</label>
                            <input
                                className="input"
                                type="number"
                                value={laborCost}
                                onChange={e => setLaborOverride(Number(e.target.value))}
                            />
                        </div>

                        <div className={styles.navRow}>
                            <button className="btn btn-secondary" style={{ padding: '1rem 1.5rem' }} onClick={() => setStep(2)}><ChevronLeft size={18} /> Back</button>
                            <button className="btn btn-primary" style={{ padding: '1rem 2rem' }} onClick={() => setStep(4)}>Review <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.stepHeader}>
                            <div className={styles.stepHeaderInner}>
                                <span className="brand-label">Final Phase</span>
                                <h2 className={styles.stepTitle}>Valuation Summary</h2>
                            </div>
                        </div>

                        <div className={styles.receipt}>
                            <div className={styles.receiptRow}>
                                <span>Unit Build Cost (Mat + Labor)</span>
                                <span>{settings.currency} {formatNumber(primeCost)}</span>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Unit Studio Overhead</span>
                                <span>{settings.currency} {formatNumber(overheadAmount)}</span>
                            </div>
                            <div className={styles.receiptRow}>
                                <span>Unit Bespoke Margin</span>
                                <span>{settings.currency} {formatNumber(profitAmount)}</span>
                            </div>
                            <div className={`${styles.receiptRow} ${styles.totalRow}`}>
                                <span>Total Unit Price</span>
                                <span>{settings.currency} {formatNumber(unitPrice)}</span>
                            </div>
                            <div className={styles.receiptRow} style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--color-border)' }}>
                                <span>Quantity</span>
                                <span>x {quantity}</span>
                            </div>
                            <div className={`${styles.receiptRow} ${styles.finalPrice}`}>
                                <span>Total Investment</span>
                                <span>{settings.currency} {formatNumber(totalLinePrice)}</span>
                            </div>
                        </div>

                        <div className="input-group" style={{ marginTop: '1.5rem' }}>
                            <label className="label">Internal Project Notes</label>
                            <textarea
                                className="input"
                                style={{ minHeight: '80px', paddingTop: '0.5rem' }}
                                value={quoteNotes}
                                onChange={e => setQuoteNotes(e.target.value)}
                                placeholder="Specific fabric details, deadlines, etc."
                            />
                        </div>

                        <div className={styles.navRow}>
                            <button className="btn btn-secondary" style={{ padding: '1rem 1.5rem' }} onClick={() => setStep(3)}><ChevronLeft size={18} /> Back</button>
                            <button className="btn btn-primary" style={{ padding: '1rem 2rem', background: 'var(--color-success)', gap: '0.5rem' }} onClick={handleSave}>
                                <Save size={18} /> Save Bespoke Quote
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

