import heroImage from "@/assets/hero-model.jpg";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative h-[50vh] sm:h-[60vh] lg:h-[85vh] overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/lovable-uploads/ed06370d-6a7a-4b82-87c6-835ea02c4d21.jpg"
          alt="Modelo fitness usando roupas Avance" 
          className="w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/40 via-black/10 to-transparent" />
      </div>

      {/* Content - Right aligned */}
      <div className="container px-4 sm:px-6 relative h-full flex items-center justify-end">
        <div className="text-right max-w-lg space-y-4 sm:space-y-6 text-white pr-4 sm:pr-8 lg:pr-0">
          <h1 
            className="font-serif text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-light italic leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Moda Fitness
          </h1>
          <p className="text-xs sm:text-sm lg:text-base tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white/90">
            Peças que te acompanham do treino para o dia todo
          </p>
          <div>
            <a 
              href="/categoria/lancamentos"
              className="inline-block px-8 sm:px-10 py-3 sm:py-3.5 bg-background text-foreground font-semibold tracking-[0.2em] text-[10px] sm:text-xs uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              APROVEITE AGORA
            </a>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button className="absolute left-0 top-1/2 -translate-y-1/2 p-3 sm:p-4 text-white/70 hover:text-white transition-colors">
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>
      <button className="absolute right-0 top-1/2 -translate-y-1/2 p-3 sm:p-4 text-white/70 hover:text-white transition-colors">
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
        <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-white" />
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/50" />
        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white/50" />
      </div>
    </section>
  );
};

export default HeroSection;
