'use client';

import React, { useState, useEffect } from 'react';
import { Search, Command, X, Layers, Palette, Users, Scissors } from 'lucide-react';
import styles from './CommandKSearch.module.css';
import { useStorage } from '@/context/StorageContext';

export default function CommandKSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const { invoices, quotes, expenses } = useStorage();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.searchHeader}>
                    <Search size={20} className={styles.icon} />
                    <input 
                        autoFocus
                        className={styles.input} 
                        placeholder="Search for fabric, client, or collection..." 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <div className={styles.shortcut}>ESC</div>
                </div>

                <div className={styles.results}>
                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Suggestions</h4>
                        <div className={styles.item}>
                            <Layers size={16} />
                            <span>Summer Silk 24 Collection</span>
                            <span className={styles.meta}>Collection</span>
                        </div>
                        <div className={styles.item}>
                            <Palette size={16} />
                            <span>Champagne Satin Fabric</span>
                            <span className={styles.meta}>Textile</span>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Quick Actions</h4>
                        <div className={styles.item}>
                            <Plus size={16} />
                            <span>Create New Collection</span>
                        </div>
                        <div className={styles.item}>
                            <Scissors size={16} />
                            <span>Draft New Quote</span>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <span>↑↓ to navigate</span>
                    <span>↵ to select</span>
                </div>
            </div>
        </div>
    );
}

function Plus({ size }: { size: number }) {
    return (
        <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
