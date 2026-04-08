'use client';

import React, { Suspense } from 'react';
import Navbar from "@/components/Navbar";
import CommandKSearch from "@/components/CommandKSearch";
import InspectorPanel from "@/components/InspectorPanel";
import { useStorage } from "@/context/StorageContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { inspectorItem, setInspectorItem } = useStorage();
  
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-stage">
        <Suspense fallback={<div className="loading-stage">Loading...</div>}>
          {children}
        </Suspense>
      </main>
      <CommandKSearch />
      <InspectorPanel 
        isOpen={!!inspectorItem} 
        onClose={() => setInspectorItem(null)} 
        data={inspectorItem} 
      />
    </div>
  );
}
