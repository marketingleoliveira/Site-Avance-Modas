import badgeUV from "@/assets/badge-uv50.png";
import badge4Way from "@/assets/badge-4way-stretch.png";
import badgeZero from "@/assets/badge-zero-transparencia.png";
import badgeAloe from "@/assets/badge-aloe-vera.png";

const features = [
  { src: badgeUV, alt: "Proteção UV 50+" },
  { src: badge4Way, alt: "4 Way Stretch" },
  { src: badgeZero, alt: "Zero Transparência" },
  { src: badgeAloe, alt: "Aloe Vera Hidratante" },
];

const ProductFeatureBadges = () => {
  return (
    <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center sm:justify-start sm:gap-6 py-3 border-b border-border">
      {features.map(({ src, alt }) => (
        <img
          key={alt}
          src={src}
          alt={alt}
          loading="lazy"
          className="object-contain w-12 h-12 sm:w-[60px] sm:h-[60px] mx-auto sm:mx-0"
        />
      ))}
    </div>
  );
};

export default ProductFeatureBadges;
