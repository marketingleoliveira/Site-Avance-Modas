import { useState, useCallback, MouseEvent, ReactNode } from "react";

interface RippleButtonProps {
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  className?: string;
  as?: "button" | "span";
  disabled?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export const RippleButton = ({ 
  children, 
  onClick, 
  className = "", 
  as = "button",
  disabled = false
}: RippleButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (disabled) return;
    
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
    
    onClick?.(e);
  }, [onClick, disabled]);

  const Component = as;

  return (
    <Component
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      disabled={as === "button" ? disabled : undefined}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-foreground/20 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
          }}
        />
      ))}
    </Component>
  );
};

export default RippleButton;
