import { useEffect, useState } from "react";
import { Users } from "lucide-react";

const getTargetRange = () => {
  const now = new Date();
  // Use Brazil time (UTC-3) to determine business hours
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const h = brt.getUTCHours();
  const m = brt.getUTCMinutes();
  const totalMin = h * 60 + m;
  const commercialStart = 8 * 60; // 08:00
  const commercialEnd = 20 * 60; // 20:00 (inclusive)
  if (totalMin >= commercialStart && totalMin <= commercialEnd) {
    return { min: 23, max: 87 };
  }
  return { min: 2, max: 8 };
};

const randomInRange = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const OnlineUsersCounter = () => {
  const [count, setCount] = useState(() => {
    const { min, max } = getTargetRange();
    return randomInRange(min, max);
  });

  useEffect(() => {
    const tick = () => {
      const { min, max } = getTargetRange();
      setCount((prev) => {
        // Re-clamp if range changed
        if (prev < min || prev > max) return randomInRange(min, max);
        // Random small drift
        const delta = randomInRange(-3, 3);
        let next = prev + delta;
        if (next < min) next = min + randomInRange(0, 2);
        if (next > max) next = max - randomInRange(0, 2);
        return next;
      });
    };
    const interval = setInterval(tick, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container px-4 sm:px-6 pt-6 sm:pt-8">
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-secondary/60 border border-border/60 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <Users className="w-4 h-4 text-foreground/70" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide text-foreground">
            <span className="tabular-nums">{count}</span>{" "}
            <span className="font-normal text-muted-foreground">
              pessoas online agora
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default OnlineUsersCounter;