'use client';

import { useStorage } from '@/context/StorageContext';
import React, { useState } from 'react';
import styles from './SettingsComponents.module.css';

export default function GlobalSettingsForm() {
    const { settings, updateSettings } = useStorage();
    const [formData, setFormData] = useState(settings);
    const [saved, setSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            // Convert numbers, keep strings
            [name]: name === 'businessName' || name === 'currency' ? value : Number(value),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
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
                    <label className="label">Default Overhead (%)</label>
                    <input
                        className="input"
                        type="number"
                        name="overheadRate"
                        value={formData.overheadRate}
                        onChange={handleChange}
                    />
                    <span className={styles.helpText}>Added to every quote to cover rent, utilities, etc.</span>
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

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    {saved ? 'Saved!' : 'Save Settings'}
                </button>
            </form>
        </div>
    );
}
