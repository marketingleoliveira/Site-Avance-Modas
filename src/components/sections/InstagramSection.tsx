import { useState, useEffect } from "react";
import { Instagram, ExternalLink } from "lucide-react";

const INSTAGRAM_USERNAME = "avancemodasoficial";

// We'll use a placeholder approach since Instagram API requires business account
// The images will be managed through the admin panel or show placeholder
const InstagramSection = () => {
  const [posts, setPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Since Instagram Basic Display API is being deprecated and Graph API requires
    // business verification, we'll show a styled placeholder that links to Instagram
    // In production, you'd use an Instagram feed service like Curator.io, Elfsight, etc.
    setLoading(false);
  }, []);

  return (
    <section className="py-12 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <a 
            href={`https://instagram.com/${INSTAGRAM_USERNAME}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent transition-colors group"
          >
            <Instagram className="w-5 h-5" />
            <span>@{INSTAGRAM_USERNAME}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <p className="text-xs text-muted-foreground mt-1">
            Siga-nos no Instagram
          </p>
        </div>

        {/* Instagram Grid - Links to Profile */}
        <a 
          href={`https://instagram.com/${INSTAGRAM_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="grid grid-cols-3 md:grid-cols-6 gap-1 group">
            {[...Array(6)].map((_, index) => (
              <div 
                key={index}
                className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400"
              >
                {/* Gradient overlay with Instagram icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white/30">
                    <Instagram className="w-8 h-8" />
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </a>

        {/* Call to action */}
        <div className="text-center mt-6">
          <a 
            href={`https://instagram.com/${INSTAGRAM_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            <Instagram className="w-4 h-4" />
            Ver nosso Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
