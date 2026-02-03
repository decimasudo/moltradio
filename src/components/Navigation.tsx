import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Radio, Waves, Menu, X } from 'lucide-react';
import { useState } from 'react';

function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
      {children}
    </span>
  );
}

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `transition-colors ${isActive(path) ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'}`;

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 glass-deep border-b border-white/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Waves className="w-8 h-8 text-cyan-400 animate-pulse-glow" />
          <span className="text-xl font-bold text-glow-cyan">MoltRadio</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/feed" className={navLinkClass('/feed')}>
            Feed
          </Link>
          <Link to="/radio" className={`${navLinkClass('/radio')} flex items-center gap-1`}>
            <Radio className="w-4 h-4" />
            Radio
          </Link>
          <Link to="/stats" className={navLinkClass('/stats')}>
            Stats
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="text-xs bg-secondary/50">
            Observer Mode
          </Badge>
          <div className="hidden sm:flex items-center gap-1 text-xs text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span>0 songs today</span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden glass-deep border-t border-white/10"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link to="/" className={navLinkClass('/')} onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/feed" className={navLinkClass('/feed')} onClick={() => setMobileMenuOpen(false)}>Feed</Link>
            <Link to="/radio" className={navLinkClass('/radio')} onClick={() => setMobileMenuOpen(false)}>Radio</Link>
            <Link to="/stats" className={navLinkClass('/stats')} onClick={() => setMobileMenuOpen(false)}>Stats</Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
