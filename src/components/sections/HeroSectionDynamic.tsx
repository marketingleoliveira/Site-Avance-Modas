import { useState, useEffect, useCallback } from "react";
import { useHeroSettings } from "@/hooks/useSiteSettings";
import heroFallback from "@/assets/hero-model.jpg";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroSlide } from "@/lib/site-settings";

interface HeroSectionDynamicProps {
  type: 'ATACADO' | 'VAREJO';
}

const HeroSectionDynamic = ({ type }: HeroSectionDynamicProps) => {
  const { settings, loading } = useHeroSettings(type);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides: HeroSlide[] = settings?.slides?.length 
    ? settings.slides 
    : [{
        id: 'default',
        image_url: settings?.image_url || heroFallback,
        title: settings?.title || '',
        subtitle: settings?.subtitle || '',
        promo_text: settings?.promo_text || 'Nova Coleção',
        promo_subtitle: settings?.promo_subtitle || type,
        button_text: settings?.button_text || 'APROVEITE AGORA',
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
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!shouldAutoplay || !isAutoPlaying) return;
    const interval = setInterval(nextSlide, autoplayInterval);
    return () => clearInterval(interval);
  }, [shouldAutoplay, isAutoPlaying, autoplayInterval, nextSlide]);

  if (loading) {
    return <section className="relative w-full bg-secondary animate-pulse" style={{ aspectRatio: '1900/800' }} />;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative w-full overflow-hidden group" style={{ aspectRatio: '1900/800' }}>
      {/* Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-in-out",
              index === currentSlide 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-105"
            )}
          >
            <img
              src={slide.image_url || heroFallback}
              srcSet={`${slide.image_url || heroFallback} 1x, ${slide.image_url || heroFallback} 2x`}
              alt={slide.promo_subtitle || `Slide ${index + 1}`}
              className="w-full h-full object-cover object-top image-rendering-auto"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              {...(index === 0 ? { fetchpriority: "high" as const } : {})}
            />
          </div>
        ))}
      </div>

      {/* Content - Right aligned like Vestem */}
      <div className="container px-4 sm:px-6 relative h-full flex items-center justify-end">
        <div className="text-right max-w-lg space-y-4 sm:space-y-6 text-white pr-4 sm:pr-8 lg:pr-0">
          {/* Script-style title */}
          <h1 
            key={`promo-${currentSlide}`}
            className="font-serif text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-light italic animate-fade-in leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {currentSlideData.promo_text}
          </h1>

          {/* Subtitle */}
          <p 
            key={`subtitle-${currentSlide}`}
            className="text-xs sm:text-sm lg:text-base tracking-[0.2em] sm:tracking-[0.3em] uppercase text-white/90 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            {currentSlideData.promo_subtitle}
          </p>

          {/* CTA Button - Outlined like Vestem */}
          {currentSlideData.button_enabled !== false && currentSlideData.button_text && (
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              {currentSlideData.button_link && currentSlideData.button_link !== '#' ? (
                <a 
                  href={currentSlideData.button_link}
                  className="inline-block px-8 sm:px-10 py-3 sm:py-3.5 bg-background text-foreground font-semibold tracking-[0.2em] text-[10px] sm:text-xs uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                >
                  {currentSlideData.button_text}
                </a>
              ) : (
                <button 
                  className="inline-block px-8 sm:px-10 py-3 sm:py-3.5 bg-background text-foreground font-semibold tracking-[0.2em] text-[10px] sm:text-xs uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                >
                  {currentSlideData.button_text}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows - Edge aligned like Vestem */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 sm:p-4 text-white/70 hover:text-white transition-colors"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-3 sm:p-4 text-white/70 hover:text-white transition-colors"
            aria-label="Próximo slide"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        </>
      )}

      {/* Dots - Bottom center like Vestem */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "rounded-full transition-all duration-300",
                index === currentSlide 
                  ? "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white" 
                  : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSectionDynamic;
