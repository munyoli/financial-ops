'use client';

import React, { useState } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useStorage } from '@/context/StorageContext';

export default function NotificationCenter() {
    const { notifications, markNotificationRead } = useStorage();
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter((n: any) => !n.is_read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case 'success': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case 'error': return <XCircle className="h-5 w-5 text-rose-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const handleMarkAsRead = async (id: string) => {
        await markNotificationRead(id);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-neutral-800 transition-colors"
            >
                <Bell className="h-6 w-6 text-neutral-400 hover:text-white" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-3 w-3 bg-rose-500 rounded-full border-2 border-neutral-900"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl z-50">
                    <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
                        <h3 className="font-medium text-white">Notifications</h3>
                        <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">{unreadCount} New</span>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-neutral-500 text-sm">
                                You're all caught up!
                            </div>
                        ) : (
                            notifications.map((notif: any) => (
                                <div 
                                    key={notif.id} 
                                    className={`p-4 border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors ${!notif.is_read ? 'bg-neutral-800/20' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="shrink-0 mt-1">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className={`text-sm font-medium ${!notif.is_read ? 'text-white' : 'text-neutral-300'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && (
                                                    <button 
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="text-neutral-500 hover:text-emerald-400 transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-neutral-500 mt-2">
                                                {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                <span className="mx-2">•</span>
                                                <span className="capitalize">{notif.department}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
