import { Instagram } from "lucide-react";
import shortsImg from "@/assets/product-shorts.jpg";
import leggingImg from "@/assets/product-legging.jpg";
import topImg from "@/assets/product-top.jpg";
import conjuntoImg from "@/assets/product-conjunto.jpg";
import heroImg from "@/assets/hero-model.jpg";

const instagramPosts = [
  { image: heroImg, link: "#" },
  { image: shortsImg, link: "#" },
  { image: leggingImg, link: "#" },
  { image: topImg, link: "#" },
  { image: conjuntoImg, link: "#" },
  { image: heroImg, link: "#" },
];

const InstagramSection = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container">
        <div className="text-center mb-8">
          <a 
            href="https://instagram.com/avancemodas" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent transition-colors"
          >
            <Instagram className="w-4 h-4" />
            @avancemodas
          </a>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
          {instagramPosts.map((post, index) => (
            <a 
              key={index}
              href={post.link}
              className="relative aspect-square overflow-hidden group"
            >
              <img 
                src={post.image} 
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-white" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
