import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, Settings, LogOut, GraduationCap } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  programName: string;
  onLogout: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Översikt' },
  { to: '/kurser', icon: BookOpen, label: 'Kurser' },
  { to: '/kalender', icon: Calendar, label: 'Kalender' },
  { to: '/installningar', icon: Settings, label: 'Inställningar' },
];

export default function AppLayout({ children, programName, onLogout }: AppLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container flex items-center justify-between h-14 gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-heading font-bold text-lg text-foreground hidden sm:inline">BTH Studieplanerare</span>
            <span className="font-heading font-bold text-lg text-foreground sm:hidden">BTH</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[200px]">{programName}</span>
            <button onClick={onLogout} className="text-muted-foreground hover:text-foreground transition-colors" title="Logga ut">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Mobil navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden z-40">
        <div className="flex justify-around py-2">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-md text-xs transition-colors ${
                  active ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop navigation */}
      <nav className="hidden md:flex fixed top-14 left-0 right-0 bg-card border-b z-30">
        <div className="container flex gap-1 py-1">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                  active ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="hidden md:block h-12" />
    </div>
  );
}
