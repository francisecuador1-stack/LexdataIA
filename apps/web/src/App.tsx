import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Phase1Normas } from './pages/Phase1Normas';
import { Phase2Amenazas } from './pages/Phase2Amenazas';
import { Phase3Implementacion } from './pages/Phase3Implementacion';
import { Phase4Definicion } from './pages/Phase4Definicion';
import { Phase5Supervision } from './pages/Phase5Supervision';
import { Phase6Auditoria } from './pages/Phase6Auditoria';
import { Phase7Mejora } from './pages/Phase7Mejora';
import { Capacitaciones } from './pages/Capacitaciones';
import { ClientPortal } from './pages/ClientPortal';
import { ClientDataForm } from './pages/ClientDataForm';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="fase-1" element={<Phase1Normas />} />
        <Route path="fase-2" element={<Phase2Amenazas />} />
        <Route path="fase-3" element={<Phase3Implementacion />} />
        <Route path="fase-4" element={<Phase4Definicion />} />
        <Route path="fase-5" element={<Phase5Supervision />} />
        <Route path="fase-6" element={<Phase6Auditoria />} />
        <Route path="fase-7" element={<Phase7Mejora />} />
        <Route path="capacitaciones" element={<Capacitaciones />} />
        <Route path="portal-cliente" element={<ClientPortal />} />
        <Route path="registro" element={<ClientDataForm />} />
      </Route>
    </Routes>
  );
}
