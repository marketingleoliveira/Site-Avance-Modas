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
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Instagram className="w-8 h-8" />
            @avancemodas
          </h2>
          <p className="text-muted-foreground">
            Siga-nos no Instagram e faça parte da nossa comunidade fitness.
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {instagramPosts.map((post, index) => (
            <a 
              key={index}
              href={post.link}
              className="relative aspect-square overflow-hidden group"
            >
              <img 
                src={post.image} 
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-primary-foreground" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
