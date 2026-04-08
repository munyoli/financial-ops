'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Scissors, Palette, Layers, Info, CheckCircle2 } from 'lucide-react';
import styles from './InspectorPanel.module.css';
import { useStorage } from '@/context/StorageContext';
import { ProductionStatus } from '@/lib/types';

interface InspectorPanelProps {
    isOpen: boolean;
    onClose: () => void;
    data: any; 
}

export default function InspectorPanel({ isOpen, onClose, data }: InspectorPanelProps) {
    const { updateProductionOrder } = useStorage();
    const [localData, setLocalData] = useState<any>(null);

    useEffect(() => {
        if (data) setLocalData(data);
    }, [data]);

    if (!isOpen || !localData) return null;

    const isProductionOrder = 'currentStatus' in localData;

    const handleUpdate = async () => {
        if (isProductionOrder) {
            await updateProductionOrder(localData);
        }
        onClose();
    };

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={styles.panel}>
                <header className={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className={styles.categoryIcon}>
                            {isProductionOrder ? <Scissors size={18} /> : <Layers size={18} />}
                        </div>
                        <div>
                            <span className="brand-label">{isProductionOrder ? 'Production Order' : 'Quick Edit'}</span>
                            <h3 className={styles.title}>{localData?.clientName || localData?.title || 'Studio Item'}</h3>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                <div className={styles.content}>
                    <section className={styles.section}>
                        <h4 className={styles.sectionTitle}>Atelier Attributes</h4>
                        <div className="input-group">
                            <label className="label">
                                {isProductionOrder ? 'Order Reference' : 'Display Name'}
                            </label>
                            <input 
                                className="input" 
                                value={localData?.orderId || localData?.title || ''} 
                                onChange={(e) => setLocalData({...localData, orderId: e.target.value})}
                                placeholder="e.g. ORD-101" 
                            />
                        </div>
                        <div className="input-group">
                            <label className="label">Status</label>
                            <select 
                                className="input"
                                value={localData?.currentStatus || ''}
                                onChange={(e) => setLocalData({...localData, currentStatus: e.target.value})}
                            >
                                <option value={ProductionStatus.cutting}>Cutting</option>
                                <option value={ProductionStatus.sewing}>Sewing</option>
                                <option value={ProductionStatus.finishing}>Finishing</option>
                                <option value={ProductionStatus.qc}>Quality Control</option>
                                <option value={ProductionStatus.done}>Ready for Client</option>
                            </select>
                        </div>
                    </section>

                    {isProductionOrder && (
                        <section className={styles.section}>
                            <h4 className={styles.sectionTitle}>Production Progress</h4>
                             <div className="input-group">
                                <label className="label">Progress ({localData.progressPercentage}%)</label>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    step="5"
                                    value={localData.progressPercentage || 0}
                                    onChange={(e) => setLocalData({...localData, progressPercentage: Number(e.target.value)})}
                                    style={{ width: '100%', accentColor: 'var(--color-accent)' }}
                                />
                            </div>
                            <div className="input-group" style={{ marginTop: '1rem' }}>
                                <label className="label">Assigned Tailor</label>
                                <input 
                                    className="input" 
                                    value={localData.assignedTailor || ''} 
                                    onChange={(e) => setLocalData({...localData, assignedTailor: e.target.value})}
                                />
                            </div>
                        </section>
                    )}

                    <section className={styles.section}>
                         <h4 className={styles.sectionTitle}>Notes</h4>
                         <textarea 
                            className="input" 
                            style={{ minHeight: '120px' }} 
                            placeholder="Add atelier notes..." 
                            value={localData.notes || ''}
                            onChange={(e) => setLocalData({...localData, notes: e.target.value})}
                         />
                    </section>
                </div>

                <footer className={styles.footer}>
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleUpdate}>
                        <Save size={16} /> Update Studio Record
                    </button>
                </footer>
            </div>
        </>
    );
}
