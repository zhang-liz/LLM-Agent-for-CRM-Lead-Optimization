import { BarChart3, Bell, Search, Settings, Users, TrendingUp } from 'lucide-react';

interface NavbarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Navbar({ activeView, onViewChange }: NavbarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-[4.25rem] max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        {/* Brand */}
        <div className="flex min-w-0 flex-shrink-0 items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-teal-200/80 bg-gradient-to-br from-teal-50 to-cyan-100 shadow-sm"
            aria-hidden
          >
            <TrendingUp className="h-5 w-5 text-teal-700" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-tight tracking-tight text-slate-900">
              LeadLoop
            </p>
            <p className="truncate text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Intelligence console
            </p>
          </div>
        </div>

        {/* Center nav — desktop */}
        <nav
          className="hidden md:flex md:flex-1 md:justify-center"
          aria-label="Primary"
        >
          <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/90 bg-slate-50/90 p-1 shadow-sm">
            {navItems.map((item) => {
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-white text-slate-900 shadow-md shadow-slate-900/5 ring-1 ring-slate-200/80'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  <item.icon className="h-4 w-4 opacity-80" strokeWidth={1.75} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile nav */}
        <div className="flex md:hidden gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={`rounded-xl p-2.5 ${
                activeView === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
              aria-current={activeView === item.id ? 'page' : undefined}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.75} />
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <div className="relative hidden sm:block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              strokeWidth={2}
            />
            <input
              type="search"
              placeholder="Search…"
              className="h-10 w-44 rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-teal-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/25 lg:w-52"
              readOnly
              aria-label="Search (demo)"
            />
          </div>
          <button
            type="button"
            className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-400 ring-2 ring-white" />
          </button>
          <div className="hidden items-center gap-3 border-l border-slate-200 pl-3 sm:flex">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-800">Sales Team</div>
              <div className="text-xs text-slate-500">Admin</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 text-sm font-bold text-white shadow-md ring-2 ring-white">
              ST
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
