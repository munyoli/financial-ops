'use client';

import { useStorage } from '@/context/StorageContext';
import { GarmentType, Quote, QuoteItem, DirectCosts, IndirectCosts, BusinessCosts, PricingSummary } from '@/lib/types';
import { calculateGarmentPricing } from '@/lib/pricing';
import { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChevronRight, ChevronLeft, Save, Star, Scissors, User, Package, Toolbox, Briefcase, BarChart3, Info } from 'lucide-react';
import styles from './QuoteBuilder.module.css';
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
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [quantity, setQuantity] = useState<number>(1);
    const [quoteNotes, setQuoteNotes] = useState('');

    // --- Pricing State ---

    // Direct Costs
    const [materials, setMaterials] = useState({
        main_fabric: 0, lining: 0, interfacing: 0, zip: 0, buttons_hooks: 0, thread: 0, trims: 0, labels: 0
    });
    const [labour, setLabour] = useState({
        pattern_making: 0, cutting: 0, sewing: 0, handwork: 0, finishing: 0
    });
    const [packaging, setPackaging] = useState({
        garment_bag: 0, tags: 0, hanger: 0
    });
    const [wastagePercent, setWastagePercent] = useState(5);

    // Indirect Costs (Auto-allocated from settings)
    const [indirect, setIndirect] = useState(() => {
        const vol = settings.estimatedMonthlyVolume || 20;
        const mo = settings.monthlyOverheads || {
            rent: 0, electricity: 0, internet: 0, phone: 0, maintenance: 0, salaries: 0, insurance: 0, depreciation: 0, transport: 0
        };
        return {
            rent_portion: Math.round(mo.rent / vol),
            electricity_portion: Math.round(mo.electricity / vol),
            internet_portion: Math.round(mo.internet / vol),
            phone_portion: Math.round(mo.phone / vol),
            machine_maintenance: Math.round(mo.maintenance / vol),
            staff_salaries_portion: Math.round(mo.salaries / vol),
            insurance_portion: Math.round(mo.insurance / vol),
            equipment_depreciation: Math.round(mo.depreciation / vol),
            transport_for_sourcing: Math.round(mo.transport / vol)
        };
    });

    // Business Costs
    const [business, setBusiness] = useState({
        designer_fee: 0, marketing_portion: 0, software_subscriptions: 0,
        website_social_tools: 0, logistics_to_stockist: 0
    });
    const [contingencyPercent, setContingencyPercent] = useState(5);
    const [complexityMultiplier, setComplexityMultiplier] = useState(1);
    const [taxRate, setTaxRate] = useState(16); // Default to 16% (KE VAT)

    const selectedGarment = garmentTypes.find(g => g.id === selectedGarmentId);

    // Auto-fill base labour if garment selected
    useEffect(() => {
        if (selectedGarment && labour.sewing === 0) {
            setLabour(prev => ({ ...prev, sewing: selectedGarment.defaultLaborCost }));
        }
    }, [selectedGarmentId]);

    // Live Calculations
    const pricingResult = useMemo(() => {
        return calculateGarmentPricing(
            { materials: { ...materials, subtotal_materials: 0 }, labour: { ...labour, subtotal_labour: 0 }, packaging: { ...packaging, subtotal_packaging: 0 }, wastage: { wastage_allowance_percentage: wastagePercent, subtotal_wastage: 0 } },
            indirect,
            { ...business, contingency_percentage: contingencyPercent, total_business_costs: 0 },
            { wholesale: settings.wholesaleMarkup || 2.1, retail: settings.retailMarkup || 2.2 },
            { complexityMultiplier, taxRate }
        );
    }, [materials, labour, packaging, wastagePercent, indirect, business, contingencyPercent, settings, complexityMultiplier, taxRate]);

    const formatNumber = (num: number) => {
        if (!mounted) return num.toString();
        return num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    };

    const handleSave = async () => {
        if (!selectedGarment) return;

        const newQuote: Quote = {
            id: uuidv4(),
            clientName: clientName || 'Walk-in Client',
            clientPhone: clientPhone,
            date: new Date().toISOString(),
            status: 'draft',
            totalCost: pricingResult.pricing_summary.total_cost_price * quantity,
            totalClientPrice: pricingResult.pricing_summary.recommended_retail_price * quantity,
            notes: quoteNotes,
            items: [
                {
                    id: uuidv4(),
                    garmentTypeId: selectedGarment.id,
                    garmentName: selectedGarment.name,
                    quantity: quantity,
                    unitPrice: pricingResult.pricing_summary.recommended_retail_price,
                    pricing_details: pricingResult,
                    // Legacy values
                    fabricCost: pricingResult.direct_costs.materials.subtotal_materials,
                    trimCost: pricingResult.direct_costs.materials.trims,
                    laborCost: pricingResult.direct_costs.labour.subtotal_labour,
                    complexityAdjustment: 0,
                    overheadAmount: pricingResult.indirect_costs.total_indirect_costs,
                    profitAmount: pricingResult.pricing_summary.recommended_retail_price - pricingResult.pricing_summary.total_cost_price,
                    clientPrice: pricingResult.pricing_summary.recommended_retail_price * quantity,
                    notes: quoteNotes
                }
            ]
        };

        await addQuote(newQuote);
        router.push('/quotes');
    };

    const renderInput = (label: string, value: number, onChange: (val: number) => void, prefix = '') => (
        <div className="input-group">
            <label className="label">{label}</label>
            <div style={{ position: 'relative' }}>
                <input
                    className="input"
                    type="number"
                    value={value || ''}
                    onChange={e => onChange(Number(e.target.value))}
                    placeholder="0"
                />
            </div>
        </div>
    );

    return (
        <div style={{ paddingBottom: '100px' }}>
            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${(step / 5) * 100}%` }}></div>
            </div>

            <div className="couture-card">
                {/* STEP 1: GARMENT SELECTION */}
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
                                <label className="label"><User size={12} /> Client Name</label>
                                <input className="input" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Full name" />
                            </div>
                            <div className="input-group">
                                <label className="label">Contact Phone</label>
                                <input className="input" value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+254..." />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label"><Scissors size={12} /> Choose Model / Template</label>
                            <div className={styles.garmentGrid}>
                                {garmentTypes.map(g => (
                                    <button
                                        key={g.id}
                                        className={`${styles.garmentBtn} ${selectedGarmentId === g.id ? styles.selected : ''}`}
                                        onClick={() => setSelectedGarmentId(g.id)}
                                    >
                                        <div className={styles.garmentName}>{g.name}</div>
                                        <div className={styles.garmentPrice}>Base Labour: {settings.currency} {formatNumber(g.defaultLaborCost)}</div>
                                        {selectedGarmentId === g.id && <Star size={14} style={{ position: 'absolute', top: 10, right: 10, color: 'var(--color-accent)' }} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.navRow}>
                            <span></span>
                            <button className="btn btn-primary" disabled={!selectedGarmentId} onClick={() => setStep(2)}>
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: DIRECT COSTS */}
                {step === 2 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.stepHeader}>
                            <div className={styles.stepHeaderInner}>
                                <span className="brand-label">Phase II</span>
                                <h2 className={styles.stepTitle}>Direct Costs (Materials & Labour)</h2>
                            </div>
                        </div>

                        <div className={styles.gridSection}>
                            <h3 className={styles.sectionTitle}><Package size={16} /> Materials</h3>
                            <div className={styles.inputGrid}>
                                {renderInput('Main Fabric', materials.main_fabric, (v) => setMaterials({ ...materials, main_fabric: v }))}
                                {renderInput('Lining', materials.lining, (v) => setMaterials({ ...materials, lining: v }))}
                                {renderInput('Interfacing', materials.interfacing, (v) => setMaterials({ ...materials, interfacing: v }))}
                                {renderInput('Zip', materials.zip, (v) => setMaterials({ ...materials, zip: v }))}
                                {renderInput('Buttons/Hooks', materials.buttons_hooks, (v) => setMaterials({ ...materials, buttons_hooks: v }))}
                                {renderInput('Thread', materials.thread, (v) => setMaterials({ ...materials, thread: v }))}
                                {renderInput('Trims', materials.trims, (v) => setMaterials({ ...materials, trims: v }))}
                                {renderInput('Labels', materials.labels, (v) => setMaterials({ ...materials, labels: v }))}
                            </div>
                            <div className={styles.subtotalRow}>Subtotal Materials: {settings.currency} {formatNumber(pricingResult.direct_costs.materials.subtotal_materials)}</div>
                        </div>

                        <div className={styles.gridSection}>
                            <h3 className={styles.sectionTitle}><Toolbox size={16} /> Labour</h3>
                            <div className={styles.inputGrid}>
                                {renderInput('Pattern Making', labour.pattern_making, (v) => setLabour({ ...labour, pattern_making: v }))}
                                {renderInput('Cutting', labour.cutting, (v) => setLabour({ ...labour, cutting: v }))}
                                {renderInput('Sewing', labour.sewing, (v) => setLabour({ ...labour, sewing: v }))}
                                {renderInput('Handwork', labour.handwork, (v) => setLabour({ ...labour, handwork: v }))}
                                {renderInput('Finishing', labour.finishing, (v) => setLabour({ ...labour, finishing: v }))}
                            </div>
                            <div className={styles.subtotalRow}>Subtotal Labour: {settings.currency} {formatNumber(pricingResult.direct_costs.labour.subtotal_labour)}</div>
                        </div>

                        <div className={styles.gridSection}>
                            <h3 className={styles.sectionTitle}>Packaging & Wastage</h3>
                            <div className={styles.inputGrid}>
                                {renderInput('Garment Bag', packaging.garment_bag, (v) => setPackaging({ ...packaging, garment_bag: v }))}
                                {renderInput('Tags', packaging.tags, (v) => setPackaging({ ...packaging, tags: v }))}
                                {renderInput('Hanger', packaging.hanger, (v) => setPackaging({ ...packaging, hanger: v }))}
                                {renderInput('Wastage (%)', wastagePercent, (v) => setWastagePercent(v))}
                            </div>
                            <div className={styles.totalBlock}>
                                Total Direct Costs: {settings.currency} {formatNumber(pricingResult.direct_costs.total_direct_costs)}
                            </div>
                        </div>

                        <div className={styles.navRow}>
                            <button className="btn btn-secondary" onClick={() => setStep(1)}><ChevronLeft size={18} /> Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(3)}>Continue <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* STEP 3: INDIRECT COSTS */}
                {step === 3 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.stepHeader}>
                            <div className={styles.stepHeaderInner}>
                                <span className="brand-label">Phase III</span>
                                <h2 className={styles.stepTitle}>Indirect Costs (Overheads)</h2>
                            </div>
                        </div>

                        <p className={styles.helperText}>Enter the portion of monthly overheads allocated to this single garment.</p>

                        <div className={styles.inputGrid}>
                            {renderInput('Rent Portion', indirect.rent_portion, (v) => setIndirect({ ...indirect, rent_portion: v }))}
                            {renderInput('Electricity', indirect.electricity_portion, (v) => setIndirect({ ...indirect, electricity_portion: v }))}
                            {renderInput('Internet', indirect.internet_portion, (v) => setIndirect({ ...indirect, internet_portion: v }))}
                            {renderInput('Phone', indirect.phone_portion, (v) => setIndirect({ ...indirect, phone_portion: v }))}
                            {renderInput('Maintenance', indirect.machine_maintenance, (v) => setIndirect({ ...indirect, machine_maintenance: v }))}
                            {renderInput('Other Staff Salaries', indirect.staff_salaries_portion, (v) => setIndirect({ ...indirect, staff_salaries_portion: v }))}
                            {renderInput('Insurance', indirect.insurance_portion, (v) => setIndirect({ ...indirect, insurance_portion: v }))}
                            {renderInput('Depreciation', indirect.equipment_depreciation, (v) => setIndirect({ ...indirect, equipment_depreciation: v }))}
                            {renderInput('Transport (Sourcing)', indirect.transport_for_sourcing, (v) => setIndirect({ ...indirect, transport_for_sourcing: v }))}
                        </div>

                        <div className={styles.totalBlock}>
                            Total Indirect Costs: {settings.currency} {formatNumber(pricingResult.indirect_costs.total_indirect_costs)}
                        </div>

                        <div className={styles.navRow}>
                            <button className="btn btn-secondary" onClick={() => setStep(2)}><ChevronLeft size={18} /> Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(4)}>Continue <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* STEP 4: BUSINESS COSTS */}
                {step === 4 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.stepHeader}>
                            <div className={styles.stepHeaderInner}>
                                <span className="brand-label">Phase IV</span>
                                <h2 className={styles.stepTitle}>Business Costs</h2>
                            </div>
                        </div>

                        <div className={styles.inputGrid}>
                            {renderInput('Designer Fee (Salary)', business.designer_fee, (v) => setBusiness({ ...business, designer_fee: v }))}
                            {renderInput('Marketing', business.marketing_portion, (v) => setBusiness({ ...business, marketing_portion: v }))}
                            {renderInput('Software Subscriptions', business.software_subscriptions, (v) => setBusiness({ ...business, software_subscriptions: v }))}
                            {renderInput('Website & Tools', business.website_social_tools, (v) => setBusiness({ ...business, website_social_tools: v }))}
                            {renderInput('Logistics to Stockist', business.logistics_to_stockist, (v) => setBusiness({ ...business, logistics_to_stockist: v }))}
                            {renderInput('Contingency (%)', contingencyPercent, (v) => setContingencyPercent(v))}
                        </div>

                        <div className={styles.gridSection} style={{ marginTop: '2rem' }}>
                            <h3 className={styles.sectionTitle}><Star size={16} /> Complexity & Tax Sensitivity</h3>
                            <div className={styles.complexityButtons}>
                                {[
                                    { label: 'Standard', val: 1.0, desc: 'Next-day RTW / Simple construction' },
                                    { label: 'Complex', val: 1.25, desc: 'Draping & intricate details' },
                                    { label: 'Couture', val: 1.6, desc: 'Luxury Bespoke / Wedding Gowns' },
                                    { label: 'Masterpiece', val: 2.2, desc: 'Red Carpet / Runway Artistry' }
                                ].map(c => (
                                    <button
                                        key={c.label}
                                        className={`${styles.complexityBtn} ${complexityMultiplier === c.val ? styles.active : ''}`}
                                        onClick={() => setComplexityMultiplier(c.val)}
                                    >
                                        <div className={styles.compLabel}>{c.label}</div>
                                        <div className={styles.compVal}>{c.val}x</div>
                                        <div className={styles.compDesc}>{c.desc}</div>
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop: '1.5rem' }}>
                                {renderInput('Applicable Tax / VAT (%)', taxRate, setTaxRate)}
                            </div>
                        </div>

                        <div className={styles.totalBlock}>
                            Total Business Costs: {settings.currency} {formatNumber(pricingResult.business_costs.total_business_costs)}
                        </div>

                        <div className={styles.navRow}>
                            <button className="btn btn-secondary" onClick={() => setStep(3)}><ChevronLeft size={18} /> Back</button>
                            <button className="btn btn-primary" onClick={() => setStep(5)}>Review Valuation <ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}

                {/* STEP 5: SUMMARY & PRICING */}
                {step === 5 && (
                    <div className={styles.stepContainer}>
                        <div className={styles.stepHeader}>
                            <div className={styles.stepHeaderInner}>
                                <span className="brand-label">Final Phase</span>
                                <h2 className={styles.stepTitle}>Valuation & Markup</h2>
                            </div>
                        </div>

                        <div className={styles.pricingDashboard}>
                            <div className={styles.pricingCard}>
                                <div className={styles.cardHeader}>Section Totals</div>
                                <div className={styles.summaryRow}>
                                    <span>Direct Costs</span>
                                    <span>{settings.currency} {formatNumber(pricingResult.direct_costs.total_direct_costs)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Indirect Costs</span>
                                    <span>{settings.currency} {formatNumber(pricingResult.indirect_costs.total_indirect_costs)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Business Costs</span>
                                    <span>{settings.currency} {formatNumber(pricingResult.business_costs.total_business_costs)}</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.tcpRow}`}>
                                    <span>Total Cost Price (TCP)</span>
                                    <span>{settings.currency} {formatNumber(pricingResult.pricing_summary.total_cost_price)}</span>
                                </div>
                            </div>

                            <div className={styles.pricingCard}>
                                <div className={styles.cardHeader}>Target Pricing</div>
                                <div className={styles.summaryRow}>
                                    <span>Wholesale Price (x{pricingResult.pricing_summary.wholesale_markup.toFixed(2)})</span>
                                    <span>{settings.currency} {formatNumber(pricingResult.pricing_summary.wholesale_price)}</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.rrpRow}`}>
                                    <span>Recommended Retail Price (RRP)</span>
                                    <span>{settings.currency} {formatNumber(pricingResult.pricing_summary.recommended_retail_price)}</span>
                                </div>
                            </div>

                            <div className={styles.pricingCard}>
                                <div className={styles.cardHeader}>Expert Profit Analysis</div>
                                <div className={styles.summaryRow}>
                                    <span>Applicable Tax (VAT)</span>
                                    <span>- {settings.currency} {formatNumber(pricingResult.pricing_summary.tax_amount)}</span>
                                </div>
                                <div className={styles.summaryRow}>
                                    <span>Total Cost Recovery</span>
                                    <span>- {settings.currency} {formatNumber(pricingResult.pricing_summary.total_cost_price)}</span>
                                </div>
                                <div className={`${styles.summaryRow} ${styles.profitRow}`}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 700 }}>Net Take-Home Profit</span>
                                        <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>After costs and tax</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{settings.currency} {formatNumber(pricingResult.pricing_summary.net_profit)}</div>
                                        <div style={{ color: 'var(--color-success)', fontSize: '0.75rem' }}>{pricingResult.pricing_summary.net_profit_margin_percentage.toFixed(1)}% Margin</div>
                                    </div>
                                </div>
                                <div className={styles.profitIndicatorBar}>
                                    <div
                                        className={styles.profitFill}
                                        style={{ width: `${Math.min(100, pricingResult.pricing_summary.net_profit_margin_percentage)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">Order Quantity</label>
                            <input className="input" type="number" min="1" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} />
                        </div>

                        <div className={styles.finalTotal}>
                            <span className={styles.totalLabel}>Total Quotation Value</span>
                            <span className={styles.totalValue}>{settings.currency} {formatNumber(pricingResult.pricing_summary.recommended_retail_price * quantity)}</span>
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
                            <button className="btn btn-secondary" onClick={() => setStep(4)}><ChevronLeft size={18} /> Back</button>
                            <button className="btn btn-primary" style={{ background: 'var(--color-success)', gap: '0.5rem' }} onClick={handleSave}>
                                <Save size={18} /> Save Bespoke Quote
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

