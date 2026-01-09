import { useState, useEffect } from "react";

const announcements = [
  "FRETE GRÁTIS ACIMA DE R$299",
  "GRADE ABERTA - QUALQUER QUANTIDADE E TAMANHO",
  "PARCELAMOS EM ATÉ 6X SEM JUROS",
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
    <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden">
      <div className="container flex items-center justify-center gap-8">
        <span className="text-xs sm:text-sm font-medium tracking-widest animate-fade-in">
          {announcements[currentIndex]}
        </span>
      </div>
    </div>
  );
};

export default AnnouncementBar;
