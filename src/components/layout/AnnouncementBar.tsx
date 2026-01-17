import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAnnouncementSettings } from "@/hooks/useSiteSettings";

const AnnouncementBar = () => {
  const { settings, loading } = useAnnouncementSettings();
  const [currentIndex, setCurrentIndex] = useState(0);

  const messages = settings?.messages || [];
  const interval = settings?.interval || 4000;
  const enabled = settings?.enabled ?? true;

  useEffect(() => {
    if (!enabled || messages.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval, enabled]);

  if (loading || !enabled || messages.length === 0) {
    return null;
  }

  return (
    <div className="bg-foreground text-background py-2 overflow-hidden">
      <div className="container flex items-center justify-center gap-4">
        <button 
          onClick={() => setCurrentIndex((prev) => (prev - 1 + messages.length) % messages.length)}
          className="p-0.5 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase">
          {messages[currentIndex]}
        </span>
        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % messages.length)}
          className="p-0.5 hover:opacity-70 transition-opacity"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
