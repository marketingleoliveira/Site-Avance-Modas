import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const announcements = [
  "FRETE GRÁTIS ACIMA DE R$299",
  "GRADE ABERTA - QUALQUER QUANTIDADE",
  "ATÉ 6X SEM JUROS",
];

const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-foreground text-background py-2 overflow-hidden">
      <div className="container flex items-center justify-center gap-4">
        <button 
          onClick={() => setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length)}
          className="p-0.5 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase">
          {announcements[currentIndex]}
        </span>
        <button 
          onClick={() => setCurrentIndex((prev) => (prev + 1) % announcements.length)}
          className="p-0.5 hover:opacity-70 transition-opacity"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
