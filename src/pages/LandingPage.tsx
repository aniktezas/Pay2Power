import { Link } from 'react-router-dom';
import {
  Zap, QrCode, Cpu, TrendingUp, AlertTriangle, Clock, Activity,
  Shield, Smartphone, Building2, Home, ShoppingBag, Wifi,
  ChevronRight, Check, ArrowRight
} from 'lucide-react';
import { PublicNavbar } from '../components/layout/Navbar';

function HeroDevice() {
  return (
    <div className="relative mt-8 lg:mt-0">
      <div className="absolute inset-0 blur-3xl bg-sky-500/15 rounded-full scale-75" />
      <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <Cpu size={20} className="text-sky-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">Room 101 Socket</p>
              <p className="text-xs font-mono text-slate-500">SP-SW-00001</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">POWER ON</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { label: 'Voltage', value: '230.1', unit: 'V', color: 'text-amber-400' },
            { label: 'Current', value: '0.320', unit: 'A', color: 'text-blue-400' },
            { label: 'Power', value: '73.6', unit: 'W', color: 'text-sky-400' },
            { label: 'Energy', value: '0.421', unit: 'kWh', color: 'text-emerald-400' },
          ].map(r => (
            <div key={r.label} className="bg-slate-900 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">{r.label}</p>
              <p className={`text-lg font-mono font-bold ${r.color}`}>
                {r.value}<span className="text-xs text-slate-500 ml-1">{r.unit}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1"><Clock size={11} /> Time remaining</span>
              <span className="text-sky-400 font-mono font-semibold">02:31:14</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-2/5 bg-sky-500 rounded-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 flex items-center gap-1"><Zap size={11} /> Energy remaining</span>
              <span className="text-emerald-400 font-mono font-semibold">1.579 kWh</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-1/5 bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
          <span className="text-xs text-slate-500">Session: ₹20 paid</span>
          <span className="text-xs text-sky-400">Both limits tracked</span>
        </div>
      </div>
      {/* Floating AI alert */}
      <div className="absolute -right-2 lg:-right-6 top-4 bg-slate-800 rounded-xl border border-amber-500/30 p-3 shadow-xl max-w-44">
        <div className="flex items-center gap-1.5 mb-1">
          <AlertTriangle size={12} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-400">AI Alert</span>
        </div>
        <p className="text-xs text-slate-300">Abnormal load on SP-SW-002</p>
        <p className="text-xs text-slate-500 mt-1">Score: 0.91 · HIGH</p>
      </div>
      {/* Floating QR */}
      <div className="absolute -left-2 lg:-left-6 bottom-8 bg-slate-800 rounded-xl border border-slate-700 p-3 shadow-xl">
        <QrCode size={32} className="text-sky-400" />
        <p className="text-xs text-slate-400 mt-1 text-center">Scan to pay</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4 group-hover:bg-sky-500/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <PublicNavbar />

      {/* HERO */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.1)_0%,_transparent_60%)]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.3 }} />
        <div className="relative max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/5 text-sky-400 text-xs font-medium mb-6">
                <Zap size={12} fill="currentColor" /> IoT Prepaid Electricity Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-100 leading-[1.1] tracking-tight mb-6">
                Turn Any Electrical Point Into a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-400">
                  Smart Prepaid Power Point.
                </span>
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
                SmartPay Switch combines IoT energy metering, hybrid prepaid control, real-time monitoring and intelligent consumption analytics.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link to="/register">
                  <button className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2">
                    Get Started <ArrowRight size={16} />
                  </button>
                </Link>
                <Link to="/owner/dashboard">
                  <button className="px-6 py-3 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-xl transition-all flex items-center gap-2">
                    View Demo <Activity size={16} />
                  </button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {['Hybrid time + energy billing', 'Real-time monitoring', 'AI anomaly detection', 'QR device access'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <Check size={14} className="text-emerald-400" />{f}
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <HeroDevice />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sky-400 text-sm font-semibold uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">How SmartPay Works</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">From installation to electricity — four simple steps.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: <Cpu size={24} />, title: 'Attach', description: 'Retrofit the SmartPay device to any existing electrical switch or socket. No rewiring required.' },
              { step: '02', icon: <QrCode size={24} />, title: 'Scan', description: "Each device has a unique QR code. Consumers scan it with any smartphone to identify the device and see pricing." },
              { step: '03', icon: <Zap size={24} />, title: 'Pay', description: '₹10 gives you 2 hours OR 1 kWh of electricity — whichever comes first. Purchase any amount you need.' },
              { step: '04', icon: <Activity size={24} />, title: 'Use', description: 'Electricity flows. SmartPay tracks both time and energy simultaneously. Stops automatically at the first limit.' },
            ].map((step, i) => (
              <div key={step.step} className="relative">
                {i < 3 && (
                  <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 z-10">
                    <ChevronRight size={20} className="text-slate-600" />
                  </div>
                )}
                <div className="p-6 rounded-xl bg-slate-800/50 border border-slate-700/50 h-full">
                  <div className="text-xs font-mono text-sky-500 font-bold mb-4">{step.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-base font-semibold text-slate-100 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HYBRID BILLING */}
      <section className="py-20 px-4 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sky-400 text-sm font-semibold uppercase tracking-wider mb-3">Smart Billing</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-6">
                Hybrid Prepaid — <span className="text-sky-400">Time AND Energy</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Traditional prepaid electricity is either time-based or energy-based. SmartPay tracks both simultaneously.
                You get electricity until the <strong className="text-slate-200">first limit is reached</strong> — ensuring fair billing for everyone.
              </p>
              <div className="space-y-3">
                {[
                  'Perfect for shared spaces — pay exactly for what you use',
                  'Owners get guaranteed revenue protection',
                  'Consumers never overpay beyond their purchased limit',
                  'Both limits displayed live on dashboard and consumer screen',
                ].map(p => (
                  <div key={p} className="flex items-start gap-3">
                    <Check size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{p}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8">
                <div className="text-center mb-8">
                  <p className="text-slate-400 text-sm mb-2">Standard Rate</p>
                  <p className="text-5xl font-bold text-slate-100">₹10</p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-slate-900">
                    <Clock size={20} className="text-sky-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-slate-100">2 hrs</p>
                    <p className="text-xs text-slate-500 mt-1">Max time</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-600">OR</p>
                      <p className="text-xs text-slate-700">first reached</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900">
                    <Zap size={20} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-xl font-bold text-slate-100">1 kWh</p>
                    <p className="text-xs text-slate-500 mt-1">Max energy</p>
                  </div>
                </div>
                <div className="mt-6 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <p className="text-xs text-amber-400 text-center">
                    ⚡ Electricity stops automatically when the first limit is reached
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <p className="text-xs font-semibold text-emerald-400 mb-2">Scenario A</p>
                  <p className="text-xs text-slate-300">2 kWh consumed in 3 hours</p>
                  <p className="text-xs text-emerald-400 mt-1">→ Energy limit reached · Power OFF</p>
                </div>
                <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20">
                  <p className="text-xs font-semibold text-sky-400 mb-2">Scenario B</p>
                  <p className="text-xs text-slate-300">1.2 kWh after 4 hours</p>
                  <p className="text-xs text-sky-400 mt-1">→ Time limit reached · Power OFF</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sky-400 text-sm font-semibold uppercase tracking-wider mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">Everything you need</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard icon={<Zap size={20} />} title="Hybrid Prepaid Billing" description="Dual time + energy tracking with automatic cutoff at whichever limit is reached first." />
            <FeatureCard icon={<Activity size={20} />} title="Real-Time Monitoring" description="Live voltage, current, power, and energy readings updated every 2 seconds." />
            <FeatureCard icon={<QrCode size={20} />} title="QR Device Identity" description="Every device gets a unique QR code. Consumers scan to access the purchase page instantly." />
            <FeatureCard icon={<Shield size={20} />} title="Automatic Cutoff" description="Server-side and device-side enforcement ensures electricity always stops at the purchased limit." />
            <FeatureCard icon={<TrendingUp size={20} />} title="Energy Analytics" description="Daily, weekly, and monthly energy consumption charts and revenue reports for owners." />
            <FeatureCard icon={<AlertTriangle size={20} />} title="AI Anomaly Detection" description="Intelligent monitoring detects abnormal consumption patterns and alerts the owner immediately." />
            <FeatureCard icon={<Cpu size={20} />} title="Transaction Tracking" description="Complete audit trail of all purchases, sessions, and payments." />
            <FeatureCard icon={<Wifi size={20} />} title="Cloud IoT Ready" description="Architecture prepared for ESP32 → MQTT → FastAPI → Supabase → React real-time pipeline." />
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="py-20 px-4 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sky-400 text-sm font-semibold uppercase tracking-wider mb-3">Applications</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">Built for every shared space</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Building2 size={22} />, title: 'Hostels & PGs', desc: 'Charge residents fairly per usage without disputes over electricity bills.' },
              { icon: <Home size={22} />, title: 'Rental Properties', desc: 'Let tenants pay their own electricity bills simply with QR-based access.' },
              { icon: <ShoppingBag size={22} />, title: 'Shops & Outlets', desc: 'Meter individual stalls or vendor spaces with precise prepaid control.' },
              { icon: <Wifi size={22} />, title: 'Shared Workspaces', desc: 'Usage-based power billing for co-working desks and shared equipment.' },
              { icon: <Zap size={22} />, title: 'Pay-Per-Use Appliances', desc: 'Washing machines, dryers, EV chargers — any appliance, any location.' },
              { icon: <Activity size={22} />, title: 'EV Charging', desc: 'Fair energy metering for electric vehicle charging points and stations.' },
              { icon: <Smartphone size={22} />, title: 'Campus Facilities', desc: 'Student labs, canteens, workshops — controlled and metered access.' },
              { icon: <Shield size={22} />, title: 'Event Venues', desc: 'Temporary stall power points and event electricity made simple.' },
            ].map(uc => (
              <div key={uc.title} className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-400 mb-3">
                  {uc.icon}
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1.5">{uc.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mx-auto mb-6">
            <Zap size={32} className="text-sky-400" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
            Build smarter power access with SmartPay.
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            IoT-powered, cloud-connected, AI-monitored prepaid electricity management.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <button className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center gap-2">
                Get Started Free <ArrowRight size={18} />
              </button>
            </Link>
            <Link to="/owner/dashboard">
              <button className="px-8 py-4 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-xl transition-all">
                Explore Demo
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-500 flex items-center justify-center">
              <Zap size={12} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-100 text-sm">SmartPay<span className="text-sky-400">Switch</span></span>
          </div>
          <p className="text-xs text-slate-500">SmartPay Switch — IoT Prepaid Electricity Platform — College Project 2026</p>
          <div className="flex gap-4">
            <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300">Sign In</Link>
            <Link to="/register" className="text-xs text-slate-500 hover:text-slate-300">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
