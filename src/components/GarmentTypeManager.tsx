'use client';

import { useStorage } from '@/context/StorageContext';
import { GarmentType } from '@/lib/types';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import styles from './SettingsComponents.module.css';
import { v4 as uuidv4 } from 'uuid';

export default function GarmentTypeManager() {
    const { garmentTypes, addGarmentType, updateGarmentType, deleteGarmentType, settings } = useStorage();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<GarmentType>>({});
    const [isAdding, setIsAdding] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatNumber = (num: number) => {
        if (!mounted) return num.toString();
        return num.toLocaleString();
    };

    const startEdit = (g: GarmentType) => {
        setEditingId(g.id);
        setEditForm(g);
        setIsAdding(false);
    };

    const startAdd = () => {
        setIsAdding(true);
        setEditForm({ name: '', defaultLaborCost: 0 });
        setEditingId(null);
    };

    const cancel = () => {
        setEditingId(null);
        setIsAdding(false);
        setEditForm({});
    };

    const save = () => {
        if (!editForm.name || editForm.defaultLaborCost === undefined) return;

        if (isAdding) {
            addGarmentType({
                id: uuidv4(),
                name: editForm.name,
                defaultLaborCost: Number(editForm.defaultLaborCost),
            });
        } else if (editingId) {
            updateGarmentType({
                id: editingId,
                name: editForm.name,
                defaultLaborCost: Number(editForm.defaultLaborCost),
            } as GarmentType);
        }
        cancel();
    };

    return (
        <div className="card" style={{ marginTop: '1rem' }}>
            <div className={styles.headerRow}>
                <h2 className={styles.sectionTitle}>Garment Types</h2>
                {!isAdding && !editingId && (
                    <button onClick={startAdd} className="btn btn-sm btn-secondary" style={{ padding: '0.4rem' }}>
                        <Plus size={18} />
                    </button>
                )}
            </div>

            <div className={styles.list}>
                {isAdding && (
                    <div className={styles.editRow}>
                        <input
                            className="input"
                            placeholder="Name"
                            value={editForm.name}
                            onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <input
                            className="input"
                            type="number"
                            placeholder="Labor"
                            value={editForm.defaultLaborCost}
                            onChange={e => setEditForm(prev => ({ ...prev, defaultLaborCost: Number(e.target.value) }))}
                        />
                        <div className={styles.actions}>
                            <button onClick={save} className="btn btn-primary btn-sm"><Plus size={16} /></button>
                            <button onClick={cancel} className="btn btn-secondary btn-sm"><X size={16} /></button>
                        </div>
                    </div>
                )}

                {garmentTypes.map((g) => (
                    <div key={g.id} className={styles.item}>
                        {editingId === g.id ? (
                            <div className={styles.editRow}>
                                <input
                                    className="input"
                                    value={editForm.name}
                                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <input
                                    className="input"
                                    type="number"
                                    value={editForm.defaultLaborCost}
                                    onChange={e => setEditForm(prev => ({ ...prev, defaultLaborCost: Number(e.target.value) }))}
                                />
                                <div className={styles.actions}>
                                    <button onClick={save} className="btn btn-primary btn-sm">Save</button>
                                    <button onClick={cancel} className="btn btn-secondary btn-sm"><X size={16} /></button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.info}>
                                    <div className={styles.name}>{g.name}</div>
                                    <div className={styles.meta}>
                                        Default Labor: {settings.currency} {formatNumber(g.defaultLaborCost)}
                                    </div>
                                </div>
                                <div className={styles.actions}>
                                    <button onClick={() => startEdit(g)} className={styles.iconBtn}>
                                        <Pencil size={18} />
                                    </button>
                                    <button onClick={() => deleteGarmentType(g.id)} className={styles.iconBtn}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
