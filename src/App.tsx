import { useAppStore } from './store';
import BranchSelector from './components/BranchSelector';
import Header from './components/Header';
import TodayAlert from './components/TodayAlert';
import SupplierTabs from './components/SupplierTabs';
import OrderForm from './components/OrderForm';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const { selectedBranch, isAdmin, activeSupplier } = useAppStore();

  if (!selectedBranch) return <BranchSelector />;
  if (isAdmin) return <AdminDashboard />;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Background orbs */}
      <div className="orb orb-amber" />
      <div className="orb orb-blue" />

      <div className="relative z-10">
        <Header />
        <TodayAlert />
        <div className="sticky top-0 z-20" style={{ background: 'var(--bg-primary)' }}>
          <SupplierTabs />
        </div>
        <main className="max-w-2xl mx-auto">
          <OrderForm key={activeSupplier} supplierId={activeSupplier} />
        </main>
      </div>
    </div>
  );
}
