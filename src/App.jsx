import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store.jsx';
import Layout from './components/Layout.jsx';
import Landing from './pages/Landing.jsx';

const Verify = lazy(() => import('./pages/Verify.jsx'));
const QRStudio = lazy(() => import('./pages/QRStudio.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Inventory = lazy(() => import('./pages/Inventory.jsx'));
const Redistribution = lazy(() => import('./pages/Redistribution.jsx'));
const Audits = lazy(() => import('./pages/Audits.jsx'));
const MedicineCatalog = lazy(() => import('./pages/MedicineCatalog.jsx'));
const StockRequirements = lazy(() => import('./pages/StockRequirements.jsx'));
const EmergencyTransfer = lazy(() => import('./pages/EmergencyTransfer.jsx'));

const spinner = (
  <div className="grid min-h-[40vh] place-items-center">
    <div className="size-8 animate-spin rounded-full border-2 border-edge border-t-brand-400" />
  </div>
);

function Shell() {
  const { account, ready } = useStore();
  const nav = useNavigate();
  useEffect(() => {
    document.title = account ? 'PharmSecure — ' + account.title : 'PharmSecure — Verify. Rescue. Connect.';
  }, [account]);
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="relative">
          <span className="absolute inset-0 -z-10 rounded-full bg-brand-500/20 blur-2xl drift-a" />
          <div className="size-10 animate-spin rounded-full border-2 border-edge border-t-brand-400" />
        </div>
      </div>
    );
  }
  return account ? (
    <Layout>
      <Suspense fallback={spinner}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/match" element={<Redistribution />} />
          <Route path="/qr" element={<QRStudio />} />
          <Route path="/audits" element={<Audits />} />
          <Route path="/catalog" element={<MedicineCatalog />} />
          <Route path="/requirements" element={<StockRequirements />} />
          <Route path="/emergency" element={<EmergencyTransfer />} />
        </Routes>
      </Suspense>
    </Layout>
  ) : (
    <Landing />
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </StoreProvider>
  );
}
