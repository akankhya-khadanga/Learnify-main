import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
  Home,
  BookOpen,
  BrainCircuit,
  Map,
  Users,
  BarChart3,
  Settings,
  StickyNote,
  Glasses,
  Calendar,
  X,
  Trophy,
  Target,
  Heart,
  Award,
  Gamepad2,
  Hand
} from 'lucide-react';
import './StaggeredMenu.css';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface StaggeredMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: Home, color: '#BEFF00' },
  { path: '/courses', label: 'Courses', icon: BookOpen, color: '#BF5AF2' },
  { path: '/ai-bot', label: 'AI Tutor', icon: BrainCircuit, color: '#BEFF00' },
  { path: '/roadmap', label: 'Roadmap', icon: Map, color: '#BF5AF2' },
  { path: '/notes', label: 'Notes', icon: StickyNote, color: '#BEFF00' },
  { path: '/study-planner', label: 'Calendar', icon: Calendar, color: '#BF5AF2' },
  { path: '/performance-tiers', label: 'Performance', icon: Trophy, color: '#BEFF00' },
  { path: '/smart-opportunities', label: 'Opportunities', icon: Target, color: '#BF5AF2' },
  { path: '/wellness', label: 'Wellness', icon: Heart, color: '#BEFF00' },
  { path: '/schemes', label: 'Schemes', icon: Award, color: '#BF5AF2' },
  { path: '/sign-language', label: 'Sign Language', icon: Hand, color: '#BEFF00' },
  { path: '/game-hub', label: 'Game Center', icon: Gamepad2, color: '#BF5AF2' },
  { path: '/focus-room', label: 'Focus Room', icon: Glasses, color: '#BEFF00' },
  { path: '/study-vr', label: 'VR Study', icon: Glasses, color: '#BF5AF2' },
  { path: '/community', label: 'Community', icon: Users, color: '#BEFF00' },
  { path: '/analytics', label: 'Analytics', icon: BarChart3, color: '#BEFF00' },
  { path: '/settings', label: 'Settings', icon: Settings, color: '#BF5AF2' },
];

export default function StaggeredMenu({ isOpen, onClose }: StaggeredMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const particlesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  // Generate particles
  useEffect(() => {
    const generatedParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
    }));
    setParticles(generatedParticles);
  }, []);

  // GSAP animation for menu open/close
  useEffect(() => {
    if (!menuRef.current || !overlayRef.current) return;

    const tl = gsap.timeline();

    if (isOpen) {
      // Open animation
      tl.set(menuRef.current, { display: 'flex' })
        .to(overlayRef.current, {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.out',
        })
        .to(
          menuRef.current,
          {
            x: 0,
            duration: 0.5,
            ease: 'power3.out',
          },
          '-=0.2'
        )
        .to(
          itemsRef.current,
          {
            x: 0,
            opacity: 1,
            stagger: 0.05,
            duration: 0.4,
            ease: 'back.out(1.5)',
          },
          '-=0.3'
        );
    } else {
      // Close animation
      tl.to(itemsRef.current, {
        x: -50,
        opacity: 0,
        stagger: 0.03,
        duration: 0.3,
        ease: 'power2.in',
      })
        .to(
          menuRef.current,
          {
            x: '-100%',
            duration: 0.4,
            ease: 'power3.in',
          },
          '-=0.2'
        )
        .to(
          overlayRef.current,
          {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
          },
          '-=0.3'
        )
        .set(menuRef.current, { display: 'none' });
    }

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="staggered-menu-overlay"
        onClick={onClose}
        style={{ opacity: 0, display: isOpen ? 'block' : 'none' }}
      />

      {/* Menu Panel */}
      <div
        ref={menuRef}
        className="staggered-menu-panel"
        style={{ transform: 'translateX(-100%)', display: 'none' }}
      >
        {/* Particles Background */}
        <div ref={particlesRef} className="staggered-menu-particles">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="staggered-menu-close"
          aria-label="Close menu"
        >
          <X size={32} />
        </button>

        {/* Logo */}
        <div className="staggered-menu-logo">
          <span className="logo-part-gold">Learn</span>
          <span className="logo-part-pink">ify</span>
        </div>

        {/* Menu Items */}
        <nav className="staggered-menu-nav">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={item.path}
                ref={(el) => (itemsRef.current[index] = el)}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation(item.path);
                }}
                className="staggered-menu-item"
                style={{
                  transform: 'translateX(-50px)',
                  opacity: 0,
                  '--item-color': item.color,
                } as React.CSSProperties}
              >
                <Icon className="menu-item-icon" />
                <span className="menu-item-label">{item.label}</span>
                <div className="menu-item-glow" />
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="staggered-menu-footer">
          <p className="footer-text">© 2024 Learnify. Elevate Your Learning.</p>
          <div className="footer-social">
            <a href="#" className="social-link" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="Discord">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
