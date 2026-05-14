import { branches } from '../data/branches';
import { useAppStore } from '../store';

export default function BranchSelector() {
  const setBranch = useAppStore(s => s.setBranch);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 overflow-y-auto"
         style={{ background: 'var(--bg-primary)' }}>

      {/* Background orbs */}
      <div className="orb orb-amber" />
      <div className="orb orb-blue" />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 amber-glow"
               style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <span className="text-4xl">📦</span>
          </div>
          <h1 className="text-3xl font-bold text-amber-gradient mb-1">
            Mutlukent Sipariş
          </h1>
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">
            Mutlukent Esenlik Hizmetleri A.Ş.
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6">
          <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium text-center mb-5">
            🏪 Şubenizi seçin
          </p>

          <div className="grid grid-cols-2 gap-3">
            {branches.map(branch => (
              <button
                key={branch.id}
                onClick={() => setBranch(branch)}
                className="branch-card flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer"
                style={{
                  background: 'var(--bg-card2)',
                  border: '1px solid var(--border)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.5)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(245,158,11,0.15)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <span className="text-3xl">{branch.emoji}</span>
                <span className="text-xs font-semibold text-center leading-tight"
                      style={{ color: 'var(--text-primary)' }}>
                  {branch.name}
                </span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)' }}>
            Seçiminiz cihazınızda hatırlanır
          </p>
        </div>
      </div>
    </div>
  );
}
