import { useEffect, useState } from 'react';
import { useStore, ACCOUNTS } from '../store.jsx';
import { Icon, cx } from '../components/ui.jsx';

const ROLE_DATA = {
  'acc_admin': { icon: 'local_hospital', color: '#61AFEF', desc: 'CityCare Multispecialty Hospital', tagline: 'Manage hospital inventory & track expiry', gradient: 'from-blue-500/20 to-cyan-500/10' },
  'acc_clinic': { icon: 'medical_services', color: '#60a5fa', desc: 'GreenLeaf Rural Clinic', tagline: 'Request critical medicines & track deliveries', gradient: 'from-blue-500/20 to-cyan-500/10' },
  'acc_ngo': { icon: 'public', color: '#D19A4E', desc: 'Aarogya Seva Charitable Trust', tagline: 'Identify surplus & rescue wasted stock', gradient: 'from-amber-500/20 to-orange-500/10' },
  'acc_mfg': { icon: 'prescriptions', color: '#C678DD', desc: 'Sunrise Pharma Manufacturing', tagline: 'Issue QR identities & monitor authenticity', gradient: 'from-purple-500/20 to-pink-500/10' },
};

/* ── Big 3D Medicine Bottle ── */
function BigMedicineBottle() {
  return (
    <div className="scene-3d w-48 h-64">
      <div className="object-3d">
        {/* Bottle body */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-36 h-48 rounded-xl bg-gradient-to-b from-panel2 to-panel border border-edge shadow-[0_0_40px_rgba(59,130,246,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]">
          {/* Label */}
          <div className="absolute top-6 left-3 right-3 h-20 rounded-lg bg-gradient-to-br from-brand-500/10 to-transparent border border-brand-500/20 p-3">
            <div className="w-12 h-1.5 rounded-full bg-brand-400/40 mb-2" />
            <div className="w-16 h-1 rounded-full bg-mist-500/30 mb-1.5" />
            <div className="w-10 h-1 rounded-full bg-mist-500/20 mb-3" />
            <div className="flex items-center gap-1.5 mt-auto">
              <div className="grid size-5 place-items-center rounded bg-brand-500/20">
                <Icon name="verified" size={10} className="text-brand-300" />
              </div>
              <span className="text-[8px] font-medium text-brand-300">VERIFIED</span>
            </div>
          </div>
          {/* Liquid level */}
          <div className="absolute bottom-0 left-0 right-0 h-28 rounded-b-xl bg-gradient-to-t from-brand-500/8 to-transparent" />
          {/* Highlight */}
          <div className="absolute top-2 left-2 w-1 h-16 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
        </div>
        {/* Cap */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-8 rounded-t-lg bg-gradient-to-b from-edge2 to-edge border border-edge shadow-lg">
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-2 rounded bg-mist-600/30" />
        </div>
        {/* Glow ring */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-4 rounded-full bg-brand-500/10 blur-xl" />
      </div>
    </div>
  );
}

/* ── Big 3D Pill Capsule ── */
function BigPillCapsule() {
  return (
    <div className="scene-3d w-32 h-20">
      <div className="object-3d rotate-pill">
        <div className="relative w-full h-full">
          {/* Left half */}
          <div className="absolute left-0 top-0 w-1/2 h-full rounded-l-full bg-gradient-to-b from-brand-400 to-brand-600 border border-brand-500/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_20px_rgba(59,130,246,0.3)]">
            <div className="absolute top-2 left-2 w-1 h-8 rounded-full bg-white/20" />
          </div>
          {/* Right half */}
          <div className="absolute right-0 top-0 w-1/2 h-full rounded-r-full bg-gradient-to-b from-mist-200 to-mist-400 border border-mist-300/50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]">
            <div className="absolute top-2 right-3 w-1 h-8 rounded-full bg-white/30" />
          </div>
          {/* Center line */}
          <div className="absolute left-1/2 top-0 -translate-x-px w-0.5 h-full bg-mist-600/30" />
          {/* Text on capsule */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 text-[7px] font-bold text-white/60 tracking-wider">PS</div>
        </div>
      </div>
    </div>
  );
}

/* ── Big 3D Syringe ── */
function BigSyringe() {
  return (
    <div className="scene-3d w-16 h-52">
      <div className="object-3d rotate-syringe">
        <div className="relative w-full h-full">
          {/* Plunger top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-3 rounded-t bg-gradient-to-b from-mist-300 to-mist-400 border border-mist-300/50" />
          {/* Plunger rod */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-10 bg-gradient-to-b from-mist-400 to-mist-300" />
          {/* Barrel */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-10 h-24 rounded-sm bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            {/* Liquid */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-500/30 to-brand-400/10" />
            {/* Marks */}
            {[0,1,2,3,4].map(i => (
              <div key={i} className="absolute left-1 w-3 h-px bg-mist-400/30" style={{ top: `${20 + i * 12}%` }} />
            ))}
            {/* Highlight */}
            <div className="absolute top-1 left-1 w-0.5 h-20 rounded-full bg-white/15" />
          </div>
          {/* Needle hub */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-4 h-3 rounded-b bg-brand-500/30 border border-brand-500/40" />
          {/* Needle */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-brand-400/60 to-brand-400/20" />
          {/* Glow */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-3 rounded-full bg-brand-500/10 blur-lg" />
        </div>
      </div>
    </div>
  );
}

/* ── Big 3D Medicine Box ── */
function BigMedicineBox() {
  return (
    <div className="scene-3d w-36 h-28">
      <div className="object-3d rotate-box">
        <div className="relative w-full h-full rounded-lg bg-gradient-to-br from-panel2 to-panel border border-edge shadow-[0_8px_30px_rgba(59,130,246,0.1)]">
          {/* Front face */}
          <div className="absolute inset-2 rounded border border-brand-500/20 bg-gradient-to-br from-brand-500/5 to-transparent p-3">
            <div className="w-8 h-1.5 rounded-full bg-brand-400/40 mb-2" />
            <div className="w-14 h-1 rounded-full bg-mist-500/30 mb-1" />
            <div className="w-10 h-1 rounded-full bg-mist-500/20 mb-3" />
            <div className="flex items-center gap-1">
              <div className="grid size-4 place-items-center rounded bg-brand-500/20">
                <Icon name="verified" size={8} className="text-brand-300" />
              </div>
              <span className="text-[7px] font-medium text-brand-300">GENUINE</span>
            </div>
          </div>
          {/* Side face (3D illusion) */}
          <div className="absolute -right-3 top-2 w-4 h-full rounded-r bg-gradient-to-r from-edge to-panel2 border-y border-r border-edge skew-y-[-8deg]" />
          {/* Top face (3D illusion) */}
          <div className="absolute -top-2 left-2 right-0 h-3 rounded-t bg-gradient-to-b from-edge2 to-edge border-x border-t border-edge skew-x-[-6deg]" />
          {/* Highlight */}
          <div className="absolute top-1 left-1 w-0.5 h-12 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

/* ── DNA Helix Background ── */
function DNAHelixBG() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-20 opacity-10 pointer-events-none hidden lg:block">
      <svg width="80" height="100%" viewBox="0 0 80 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full">
        <path d="M20 0C20 0 60 100 60 200C60 300 20 400 20 500C20 550 40 600 40 600" stroke="#34d399" strokeWidth="1.5" strokeDasharray="6 6"/>
        <path d="M60 0C60 0 20 100 20 200C20 300 60 400 60 500C60 550 40 600 40 600" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6 6"/>
        {[50,100,150,200,250,300,350,400,450,500,550].map((y, i) => (
          <line key={i} x1="25" y1={y} x2="55" y2={y} stroke="#1e2a3a" strokeWidth="1"/>
        ))}
      </svg>
    </div>
  );
}

export default function Landing() {
  const { login } = useStore();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('acc_admin');
  const [terminalId, setTerminalId] = useState('');
  const [passkey, setPasskey] = useState('');
  const [hoveredRole, setHoveredRole] = useState(null);

  useEffect(() => {
    document.title = 'PharmSecure';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(selectedRole); setError('');
    try { await login(selectedRole, 'pharmsecure123'); }
    catch (e) { setError(e.message); }
    finally { setBusy(''); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-void bg-medical-pattern overflow-hidden">
      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-edge/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center bg-panel border border-edge rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <Icon name="shield" size={17} className="text-brand-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-mist-50 tracking-tight">Pharm<span className="text-brand-300">Secure</span></span>
            <span className="ml-2 text-[9px] font-medium text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded">v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-mist-500">
            <div className="size-1.5 bg-blue-400 rounded-full animate-live" />
            <span>All systems operational</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow relative">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[calc(100vh-120px)]">

            {/* ── Left: Hero + 3D Graphics ── */}
            <div className="lg:col-span-7 relative">
              <DNAHelixBG />

              {/* Hero text */}
              <div className="relative z-10 mb-8">
                <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 mb-5">
                  <div className="size-1.5 bg-brand-400 rounded-full animate-live" />
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-300">Pharmaceutical Supply Chain Security</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-mist-50 leading-[1.05] tracking-tight">
                  Verify.<br/>
                  Rescue.<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">Connect.</span>
                </h1>
                <p className="mt-5 text-sm text-mist-400 leading-relaxed max-w-lg">
                  Detect counterfeit medicines and prevent genuine stock from becoming waste. 
                  One scan at a time — powered by blockchain verification and AI-driven surplus intelligence.
                </p>
              </div>

              {/* ── 3D Medicine Graphics Grid ── */}
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                {/* Big Medicine Bottle */}
                <div className="flex flex-col items-center gap-3 group">
                  <div className="transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                    <BigMedicineBottle />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-mist-200">MediVault Pro</p>
                    <p className="text-[9px] text-mist-500">Anti-counterfeit bottle</p>
                  </div>
                </div>

                {/* Big Pill Capsule */}
                <div className="flex flex-col items-center gap-3 group">
                  <div className="transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                    <BigPillCapsule />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-mist-200">CapsuleShield</p>
                    <p className="text-[9px] text-mist-500">QR-encoded capsule</p>
                  </div>
                </div>

                {/* Big Syringe */}
                <div className="flex flex-col items-center gap-3 group">
                  <div className="transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                    <BigSyringe />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-mist-200">InjectVerify</p>
                    <p className="text-[9px] text-mist-500">Tracked syringe unit</p>
                  </div>
                </div>

                {/* Big Medicine Box */}
                <div className="flex flex-col items-center gap-3 group">
                  <div className="transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2">
                    <BigMedicineBox />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold text-mist-200">BoxTrace</p>
                    <p className="text-[9px] text-mist-500">Serialized packaging</p>
                  </div>
                </div>
              </div>

              {/* Floating data points */}
              <div className="absolute top-32 right-24 z-20 hidden lg:block animate-float-a">
                <div className="bg-panel/90 backdrop-blur border border-edge rounded-xl px-4 py-2.5 shadow-lg">
                  <p className="text-[9px] text-mist-500 uppercase tracking-wider">Batch Status</p>
                  <p className="text-xs font-bold text-brand-300 font-mono">PARA-2501-001</p>
                </div>
              </div>
              <div className="absolute bottom-20 left-48 z-20 hidden lg:block animate-float-b">
                <div className="bg-panel/90 backdrop-blur border border-edge rounded-xl px-4 py-2.5 shadow-lg">
                  <p className="text-[9px] text-mist-500 uppercase tracking-wider">Authenticity</p>
                  <p className="text-xs font-bold text-blue-300">Verified ✓</p>
                </div>
              </div>

              {/* Feature pills */}
              <div className="relative z-10 flex flex-wrap gap-2 mt-8">
                {[
                  { icon: 'scan', label: 'Anti-Counterfeit' },
                  { icon: 'arrows', label: 'Surplus Intelligence' },
                  { icon: 'truck', label: 'Emergency Redistribution' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2 bg-panel border border-edge rounded-full px-3.5 py-2 hover:border-brand-500/30 transition-colors cursor-default">
                    <Icon name={f.icon} size={13} className="text-brand-400" />
                    <span className="text-[11px] font-medium text-mist-300">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="relative z-10 flex gap-12 mt-8">
                <div>
                  <p className="text-3xl font-black text-mist-50">1M+</p>
                  <p className="text-[10px] text-mist-500 mt-1">deaths prevented<br/>from counterfeits</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-mist-50">30%</p>
                  <p className="text-[10px] text-mist-500 mt-1">medicine wasted<br/>globally each year</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-400">&lt;3s</p>
                  <p className="text-[10px] text-mist-500 mt-1">average<br/>verify time</p>
                </div>
              </div>
            </div>

            {/* ── Right: Premium Login Card ── */}
            <div className="lg:col-span-5 relative">
              {/* Ambient glow orbs */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-500/8 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-brand-600/6 rounded-full blur-[60px] pointer-events-none" />

              <div className="relative rounded-3xl overflow-hidden">
                {/* Frosted glass card */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-3xl" />
                <div className="relative bg-panel/70 backdrop-blur-3xl border border-edge/30 rounded-3xl shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_25px_60px_-12px_rgba(0,0,0,0.5)]">
                  
                  {/* ── Top Section: Icon + Title ── */}
                  <div className="relative px-8 pt-8 pb-6 text-center">
                    {/* Animated ring behind shield */}
                    <div className="relative inline-block mb-5">
                      <div className="absolute inset-0 rounded-full border-2 border-brand-400/20 animate-[spin_12s_linear_inset]" />
                      <div className="absolute -inset-2 rounded-full border border-brand-500/10 animate-[spin_18s_linear_inset_reverse]" />
                      <div className="relative grid size-16 place-items-center rounded-full bg-gradient-to-br from-brand-500/20 to-brand-600/10 border border-brand-400/25 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                        <Icon name="shield" size={26} className="text-brand-400" />
                      </div>
                    </div>
                    <h2 className="text-2xl font-black text-mist-50 tracking-tight">Welcome Back</h2>
                    <p className="text-[11px] text-mist-400 mt-1.5">Authenticate to access your control center</p>
                    {/* Decorative line */}
                    <div className="mt-5 mx-auto w-16 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
                  </div>

                  <div className="px-8 pb-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                      
                      {/* Role selector — vertical stacked cards with gradient left border */}
                      <div>
                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-mist-500 mb-3">Operating Role</label>
                        <div className="grid grid-cols-2 gap-2">
                          {ACCOUNTS.map((a) => {
                            const rd = ROLE_DATA[a.id];
                            const isActive = selectedRole === a.id;
                            return (
                              <label key={a.id} className="cursor-pointer group/role">
                                <input type="radio" name="role" value={a.id} checked={isActive} onChange={() => setSelectedRole(a.id)} className="sr-only" />
                                <div className={cx(
                                  'relative flex items-center gap-2.5 pl-3 pr-3 py-2.5 rounded-xl border transition-all duration-200',
                                  isActive
                                    ? 'border-brand-500/30 bg-brand-500/[0.07]'
                                    : 'border-edge/40 bg-panel2/30 hover:border-edge/70 hover:bg-panel2/50',
                                )}>
                                  {/* Left accent bar */}
                                  <div className={cx(
                                    'absolute left-0 top-2 bottom-2 w-[2px] rounded-full transition-all duration-200',
                                    isActive ? 'bg-brand-400 opacity-100' : 'bg-transparent opacity-0',
                                  )} />
                                  <div className={cx(
                                    'grid size-8 shrink-0 place-items-center rounded-lg transition-all duration-200',
                                    isActive ? 'bg-brand-500/20' : 'bg-panel border border-edge/50',
                                  )}>
                                    <Icon name={rd?.icon || 'badge'} size={14} style={{ color: isActive ? rd?.color : undefined }} className={isActive ? '' : 'text-mist-500'} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className={cx('text-[11px] font-semibold truncate', isActive ? 'text-mist-50' : 'text-mist-400')}>{a.role}</p>
                                    <p className="text-[9px] text-mist-600 truncate">{rd?.desc}</p>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Inputs — modern filled style */}
                      <div className="space-y-3.5">
                        <div className="relative group">
                          <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-mist-500 mb-1.5">Terminal ID</label>
                          <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/0 via-brand-500/5 to-brand-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="relative flex items-center bg-panel2/80 border border-edge/50 rounded-xl px-3.5 py-3 focus-within:border-brand-500/40 focus-within:bg-panel2 transition-all duration-200">
                              <Icon name="computer" size={15} className="text-mist-500 group-focus-within:text-brand-400 transition-colors mr-3 shrink-0" />
                              <input 
                                className="w-full bg-transparent text-[12px] text-mist-100 placeholder-mist-600 focus:outline-none font-mono" 
                                placeholder="e.g. 882-QX-990" 
                                type="text" 
                                value={terminalId} 
                                onChange={(e) => setTerminalId(e.target.value)} 
                              />
                              {terminalId && (
                                <div className="shrink-0 ml-2">
                                  <Icon name="check-circle" size={14} className="text-brand-400" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="relative group">
                          <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-mist-500 mb-1.5">Security Passkey</label>
                          <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-brand-500/0 via-brand-500/5 to-brand-500/0 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            <div className="relative flex items-center bg-panel2/80 border border-edge/50 rounded-xl px-3.5 py-3 focus-within:border-brand-500/40 focus-within:bg-panel2 transition-all duration-200">
                              <Icon name="key" size={15} className="text-mist-500 group-focus-within:text-brand-400 transition-colors mr-3 shrink-0" />
                              <input 
                                className="w-full bg-transparent text-[12px] text-mist-100 placeholder-mist-600 focus:outline-none" 
                                type="password" 
                                placeholder="••••••••" 
                                value={passkey} 
                                onChange={(e) => setPasskey(e.target.value)} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Submit — premium gradient button with shimmer */}
                      <button type="submit" disabled={!!busy}
                        className="w-full relative overflow-hidden rounded-xl py-3.5 text-[12px] font-bold text-void bg-gradient-to-r from-brand-500 to-brand-400 hover:from-brand-400 hover:to-brand-300 transition-all duration-300 disabled:opacity-30 shadow-[0_4px_24px_rgba(59,130,246,0.25)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.35)] hover:-translate-y-0.5 active:translate-y-0">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {busy ? (
                            <>
                              <div className="size-3.5 animate-spin rounded-full border-2 border-void/30 border-t-void" />
                              Initializing...
                            </>
                          ) : (
                            <>
                              <Icon name="login" size={15} />
                              Initialize Session
                            </>
                          )}
                        </span>
                      </button>

                      {error && (
                        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3.5 py-2.5">
                          <Icon name="error" size={14} className="text-rose-400 shrink-0" />
                          <p className="text-[11px] text-rose-300">{error}</p>
                        </div>
                      )}

                      {/* Bottom status bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-edge/30">
                        <div className="flex items-center gap-1.5">
                          <div className="size-1.5 bg-blue-400 rounded-full animate-live" />
                          <p className="text-[9px] font-medium text-mist-500">Systems Operational</p>
                        </div>
                        <p className="text-[9px] text-mist-600">Directive 44.A</p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 border-t border-edge/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[10px] text-mist-500">&copy; 2024 PharmSecure. All rights reserved.</span>
          <div className="flex gap-5 text-[10px] text-mist-500">
            <a href="#" className="hover:text-brand-400 transition-colors">Compliance</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-400 transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
