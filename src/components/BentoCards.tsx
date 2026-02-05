import { useEffect, useRef, ReactNode } from 'react';
import './BentoCards.css';

interface BentoCardProps {
  label?: string;
  title: string;
  description: string;
  icon?: ReactNode;
  borderGlow?: boolean;
  className?: string;
}

export const BentoCard = ({ 
  label, 
  title, 
  description, 
  icon,
  borderGlow = true,
  className = ''
}: BentoCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!borderGlow || !cardRef.current) return;

    const card = cardRef.current;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      card.style.setProperty('--glow-x', `${x}%`);
      card.style.setProperty('--glow-y', `${y}%`);
      card.style.setProperty('--glow-intensity', '1');
    };

    const handleMouseLeave = () => {
      card.style.setProperty('--glow-intensity', '0');
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [borderGlow]);

  return (
    <div 
      ref={cardRef}
      className={`magic-bento-card ${borderGlow ? 'magic-bento-card--border-glow' : ''} ${className}`}
    >
      <div className="magic-bento-card__header">
        {label && <span className="magic-bento-card__label">{label}</span>}
        {icon && <div className="magic-bento-card__icon">{icon}</div>}
      </div>
      <div className="magic-bento-card__content">
        <h3 className="magic-bento-card__title">{title}</h3>
        <p className="magic-bento-card__description">{description}</p>
      </div>
    </div>
  );
};

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className = '' }: BentoGridProps) => {
  return (
    <div className={`bento-section ${className}`}>
      <div className="card-grid">
        {children}
      </div>
    </div>
  );
};

export default BentoGrid;
