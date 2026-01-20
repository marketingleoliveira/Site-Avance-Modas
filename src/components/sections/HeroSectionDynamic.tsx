import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useHeroSettings } from "@/hooks/useSiteSettings";
import heroFallback from "@/assets/hero-model.jpg";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroSlide } from "@/lib/site-settings";

interface HeroSectionDynamicProps {
  type: 'ATACADO' | 'VAREJO';
}

const HeroSectionDynamic = ({ type }: HeroSectionDynamicProps) => {
  const { settings, loading } = useHeroSettings(type);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Convert legacy single slide to slides array
  const slides: HeroSlide[] = settings?.slides?.length 
    ? settings.slides 
    : [{
        id: 'default',
        image_url: settings?.image_url || heroFallback,
        title: settings?.title || '',
        subtitle: settings?.subtitle || '',
        promo_text: settings?.promo_text || 'ATÉ 30% OFF',
        promo_subtitle: settings?.promo_subtitle || type,
        button_text: settings?.button_text || 'VER COLEÇÃO',
        button_link: settings?.button_link || '#',
      }];

  const autoplayInterval = settings?.autoplay_interval || 5000;
  const shouldAutoplay = settings?.autoplay !== false && slides.length > 1;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Autoplay
  useEffect(() => {
    if (!shouldAutoplay || !isAutoPlaying) return;

    const interval = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(interval);
  }, [shouldAutoplay, isAutoPlaying, autoplayInterval, nextSlide]);

  if (loading) {
    return (
      <section className="relative h-[300px] bg-secondary animate-pulse" />
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative h-[300px] overflow-hidden group">
      {/* Slides Container */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-in-out",
              index === currentSlide 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-105"
            )}
          >
            <img 
              src={slide.image_url || heroFallback}
              alt={slide.promo_subtitle || `Slide ${index + 1}`}
              className="w-full h-full object-cover object-top"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="container px-4 sm:px-6 relative h-full flex items-center">
        <div className="max-w-lg space-y-3 sm:space-y-4 lg:space-y-6 text-white">
          {/* Badge */}
          <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-semibold tracking-widest uppercase rounded-full animate-fade-in">
            {type === 'ATACADO' ? 'Atacado' : 'Varejo'}
          </span>

          {/* Main Text */}
          <div className="space-y-1 sm:space-y-2">
            <p 
              key={`promo-${currentSlide}`}
              className="text-accent font-bold text-lg sm:text-xl lg:text-3xl animate-fade-in"
            >
              {currentSlideData.promo_text}
            </p>
            <h1 
              key={`subtitle-${currentSlide}`}
              className="text-2xl sm:text-3xl lg:text-6xl font-black tracking-tight leading-none animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              {currentSlideData.promo_subtitle}
            </h1>
            {currentSlideData.title && (
              <h2 
                key={`title-${currentSlide}`}
                className="text-sm sm:text-lg lg:text-2xl font-medium text-white/90 animate-fade-in"
                style={{ animationDelay: '200ms' }}
              >
                {currentSlideData.title}
              </h2>
            )}
          </div>

          {/* CTA Button */}
          <Button 
            size="lg"
            className="bg-white text-black hover:bg-white/90 font-semibold tracking-wide group/btn animate-fade-in h-9 sm:h-10 lg:h-11 text-xs sm:text-sm px-4 sm:px-6"
            style={{ animationDelay: '300ms' }}
            asChild={!!currentSlideData.button_link && currentSlideData.button_link !== '#'}
          >
            {currentSlideData.button_link && currentSlideData.button_link !== '#' ? (
              <a href={currentSlideData.button_link}>
                {currentSlideData.button_text}
                <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>
            ) : (
              <>
                {currentSlideData.button_text}
                <ArrowRight className="ml-1.5 sm:ml-2 w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 hover:scale-110"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 hover:scale-110"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "transition-all duration-300 rounded-full",
                index === currentSlide 
                  ? "w-6 sm:w-8 h-1.5 sm:h-2 bg-white" 
                  : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {slides.length > 1 && shouldAutoplay && isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            key={currentSlide}
            className="h-full bg-white animate-progress"
            style={{ 
              animationDuration: `${autoplayInterval}ms`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress linear forwards;
        }
      `}</style>
    </section>
  );
};

export default HeroSectionDynamic;