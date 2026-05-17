import { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface IntroAnimationProps {
  onDone: () => void;
}

export default function IntroAnimation({ onDone }: IntroAnimationProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      onDone();
      return;
    }
    const t1 = setTimeout(() => setLeaving(true), 800);
    const t2 = setTimeout(() => onDone(), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-300 ${leaving ? 'opacity-0' : 'opacity-100'}`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-3 animate-slide-up">
        <GraduationCap className="h-12 w-12 text-primary" />
        <span className="font-heading font-bold text-2xl text-foreground">BTH Studieplanerare</span>
      </div>
    </div>
  );
}
