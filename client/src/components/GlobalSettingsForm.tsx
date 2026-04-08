'use client';

import { useStorage } from '@/context/StorageContext';
import React, { useState } from 'react';
import styles from './SettingsComponents.module.css';

export default function GlobalSettingsForm() {
    const { settings, updateSettings } = useStorage();
    const [formData, setFormData] = useState(settings);
    const [saved, setSaved] = useState(false);

    // Sync with storage when settings load from API
    React.useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('overhead_')) {
            const field = name.replace('overhead_', '');
            setFormData((prev) => ({
                ...prev,
                monthlyOverheads: {
                    ...(prev.monthlyOverheads || {}),
                    [field]: Number(value)
                } as any
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: name === 'businessName' || name === 'currency' ? value : Number(value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateSettings(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="card">
            <h2 className={styles.sectionTitle}>Global Configuration</h2>
            <form onSubmit={handleSubmit} className={styles.formStack}>
                <div className="input-group">
                    <label className="label">Business Name</label>
                    <input
                        className="input"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                    />
                </div>
                <div className="input-group">
                    <label className="label">Currency Symbol</label>
                    <input
                        className="input"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                    />
                </div>

                <div className="input-group">
                    <label className="label">Minimum Profit Margin (%)</label>
                    <input
                        className="input"
                        type="number"
                        name="minProfitMargin"
                        value={formData.minProfitMargin}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.divider}></div>

                <h3 className={styles.subSectionTitle}>Institutional Overhead Allocation</h3>
                <p className={styles.helpText} style={{ marginBottom: '1.5rem' }}>
                    Define your total monthly business expenses. The system will divide these by your production volume to calculate the overhead portion per garment.
                </p>

                <div className="input-group">
                    <label className="label" style={{ color: 'var(--color-accent)' }}>Estimated Monthly Volume (units)</label>
                    <input
                        className="input"
                        type="number"
                        name="estimatedMonthlyVolume"
                        value={formData.estimatedMonthlyVolume || 0}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles.overheadGrid}>
                    <div className="input-group">
                        <label className="label">Monthly Rent</label>
                        <input className="input" type="number" name="overhead_rent" value={formData.monthlyOverheads?.rent || 0} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label className="label">Electricity</label>
                        <input className="input" type="number" name="overhead_electricity" value={formData.monthlyOverheads?.electricity || 0} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label className="label">Internet</label>
                        <input className="input" type="number" name="overhead_internet" value={formData.monthlyOverheads?.internet || 0} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label className="label">Salaries (Support Staff)</label>
                        <input className="input" type="number" name="overhead_salaries" value={formData.monthlyOverheads?.salaries || 0} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label className="label">Machine Maintenance</label>
                        <input className="input" type="number" name="overhead_maintenance" value={formData.monthlyOverheads?.maintenance || 0} onChange={handleChange} />
                    </div>
                    <div className="input-group">
                        <label className="label">Transport & Sourcing</label>
                        <input className="input" type="number" name="overhead_transport" value={formData.monthlyOverheads?.transport || 0} onChange={handleChange} />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    {saved ? 'Saved!' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}
