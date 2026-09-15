import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { AgentChat } from './AgentChat';
import { useClientes } from '@/hooks/useClientes';

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  // Load clientes on mount — populates the "Empresa activa" selector in Sidebar
  useClientes();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onAgentClick={() => setAgentOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-brand-bg p-6">
          <Outlet />
        </main>
      </div>
      <AgentChat open={agentOpen} onClose={() => setAgentOpen(false)} />
    </div>
  );
}
