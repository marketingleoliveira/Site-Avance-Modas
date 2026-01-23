import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCountdownBannerSettings } from "@/hooks/useSiteSettings";

const CountdownBanner = () => {
  const { settings, loading } = useCountdownBannerSettings();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  const calculateTimeLeft = useCallback(() => {
    if (!settings?.end_time) return;

    const endTime = new Date(settings.end_time).getTime();
    const now = new Date().getTime();
    const difference = endTime - now;

    if (difference <= 0) {
      setIsExpired(true);
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    setIsExpired(false);
    setTimeLeft({
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    });
  }, [settings?.end_time]);

  useEffect(() => {
    if (!settings?.enabled) return;

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, settings?.enabled]);

  if (loading) {
    return (
      <div className="bg-[#8B0000] h-12" />
    );
  }

  if (!settings?.enabled || isExpired) {
    return null;
  }

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="bg-[#8B0000] text-white py-2.5 px-4">
      <div className="container flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        {/* Promo text */}
        <span className="text-xs sm:text-sm font-bold tracking-wide uppercase text-center">
          {settings.promo_text || "PROMO - FRETE EXPRESSO POR 14,90 PARA TODO O BRASIL!"}
        </span>

        {/* Countdown */}
        <div className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-white/70 uppercase tracking-wider">Horas</span>
            <div className="bg-black text-white font-bold text-lg sm:text-xl px-2 py-0.5 rounded min-w-[36px] text-center">
              {formatNumber(timeLeft.hours)}
            </div>
          </div>
          <span className="text-white font-bold text-lg mt-3">:</span>
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-white/70 uppercase tracking-wider">Minutos</span>
            <div className="bg-black text-white font-bold text-lg sm:text-xl px-2 py-0.5 rounded min-w-[36px] text-center">
              {formatNumber(timeLeft.minutes)}
            </div>
          </div>
          <span className="text-white font-bold text-lg mt-3">:</span>
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-white/70 uppercase tracking-wider">Segundos</span>
            <div className="bg-black text-white font-bold text-lg sm:text-xl px-2 py-0.5 rounded min-w-[36px] text-center">
              {formatNumber(timeLeft.seconds)}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          size="sm"
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xs sm:text-sm uppercase tracking-wide px-4 py-1.5 h-auto rounded-sm"
          asChild
        >
          <Link to={settings.button_link || "/#produtos"}>
            {settings.button_text || "APROVEITAR AGORA"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default CountdownBanner;
