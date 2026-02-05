import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Lock, Unlock } from 'lucide-react';
import './DockNav.css';
import { NAVIGATION_CLUSTERS, getClusterByHref } from '@/config/navigationClusters';
import { useNavigationStore } from '@/store/navigationStore';
import { ClusterType } from '@/types/navigation';

interface DockItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  clusterId?: ClusterType;
}

function DockIcon({ item, mouseX }: { item: DockItem; mouseX: any }) {
  const ref = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const setActiveCluster = useNavigationStore((state) => state.setActiveCluster);
  const setIsInCluster = useNavigationStore((state) => state.setIsInCluster);

  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const isActive = location.pathname === item.href;

  const handleClick = () => {
    if (item.clusterId) {
      const cluster = NAVIGATION_CLUSTERS[item.clusterId];
      if (!cluster.isPermanent) {
        // Navigate to cluster screen
        setActiveCluster(item.clusterId);
        setIsInCluster(true);
        navigate(`/cluster/${item.clusterId}`);
      } else {
        // Direct navigation for permanent items
        navigate(item.href);
      }
    } else {
      navigate(item.href);
    }
  };

  return (
    <motion.button
      ref={ref}
      style={{ width, height: width }}
      className={`dock-item ${isActive ? 'dock-item-active' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="dock-icon" style={{ color: isActive ? '#BEFF00' : '#BF5AF2' }}>
        {item.icon}
      </div>
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="dock-label"
        >
          {item.label}
        </motion.div>
      )}
    </motion.button>
  );
}

export default function DockNav() {
  const mouseX = useMotionValue(Infinity);
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const activeCluster = useNavigationStore((state) => state.activeCluster);
  const isInCluster = useNavigationStore((state) => state.isInCluster);

  // Determine which items to show
  const [dockItems, setDockItems] = useState<DockItem[]>([]);

  useEffect(() => {
    // Check if we're on a cluster screen or a page within a cluster
    const currentCluster = getClusterByHref(location.pathname);

    if (activeCluster && NAVIGATION_CLUSTERS[activeCluster]) {
      // Show cluster sub-items
      const cluster = NAVIGATION_CLUSTERS[activeCluster];
      const items: DockItem[] = cluster.items.map(item => {
        const IconComponent = (LucideIcons as any)[item.icon];
        return {
          icon: IconComponent ? <IconComponent size={24} /> : null,
          label: item.label,
          href: item.href,
        };
      });
      setDockItems(items);
    } else if (currentCluster && !currentCluster.isPermanent) {
      // We're on a page that belongs to a cluster, show that cluster's items
      const items: DockItem[] = currentCluster.items.map(item => {
        const IconComponent = (LucideIcons as any)[item.icon];
        return {
          icon: IconComponent ? <IconComponent size={24} /> : null,
          label: item.label,
          href: item.href,
        };
      });
      setDockItems(items);
    } else {
      // Show top-level cluster navigation
      const topLevelItems: DockItem[] = [
        {
          icon: <LucideIcons.Home size={24} />,
          label: 'Dashboard',
          href: '/dashboard',
        },
        {
          icon: <LucideIcons.GraduationCap size={24} />,
          label: 'Learning Tools',
          href: '/cluster/learning-tools',
          clusterId: 'learning-tools',
        },
        {
          icon: <LucideIcons.Hand size={24} />,
          label: 'Sign Language',
          href: '/sign-language',
          clusterId: 'sign-language',
        },
        {
          icon: <LucideIcons.Sparkles size={24} />,
          label: 'Visualization',
          href: '/cluster/visualization-tools',
          clusterId: 'visualization-tools',
        },
        {
          icon: <LucideIcons.Heart size={24} />,
          label: 'Support',
          href: '/cluster/supportive-tools',
          clusterId: 'supportive-tools',
        },
        {
          icon: <LucideIcons.Sparkles size={24} />,
          label: 'Unified OS',
          href: '/unified-os',
          clusterId: 'unified-os',
        },
        {
          icon: <LucideIcons.Settings size={24} />,
          label: 'Settings',
          href: '/settings',
        },
      ];
      setDockItems(topLevelItems);
    }
  }, [location.pathname, activeCluster]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  };

  const toggleDock = () => {
    setIsVisible(!isVisible);
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsVisible(true);
    }
  };


  return (
    <>
      {/* Floating toggle button - always visible at bottom center */}
      <motion.button
        onClick={toggleDock}
        className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-[101] w-12 h-12 rounded-full bg-gradient-to-br from-gold to-pink border-2 border-black flex items-center justify-center shadow-[0_0_20px_rgba(201,180,88,0.5)] hover:shadow-[0_0_30px_rgba(201,180,88,0.8)] transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: isVisible ? -88 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        title="Toggle Dock"
      >
        <motion.div
          animate={{ rotate: isVisible ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-black font-bold text-xl"
        >
          ▲
        </motion.div>
      </motion.button>

      <motion.div
        className="dock-outer"
        initial={{ y: 100 }}
        animate={{ y: isVisible || isPinned ? 0 : 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="dock-panel relative"
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Lock button on dock */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              togglePin();
            }}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-gold to-pink border-2 border-black flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-transform z-10"
            whileHover={{ rotate: isPinned ? 0 : 15 }}
            whileTap={{ scale: 0.9 }}
            title={isPinned ? 'Unlock to allow hiding' : 'Lock to keep visible'}
          >
            {isPinned ? (
              <Lock size={14} className="text-black" />
            ) : (
              <Unlock size={14} className="text-black" />
            )}
          </motion.button>

          {dockItems.map((item) => (
            <DockIcon key={item.href} item={item} mouseX={mouseX} />
          ))}
        </motion.div>
      </motion.div>
    </>
  );
}
