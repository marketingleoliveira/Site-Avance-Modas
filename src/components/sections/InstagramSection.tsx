import { useEffect, useRef } from "react";
import { Instagram, ExternalLink } from "lucide-react";

const INSTAGRAM_USERNAME = "avancemodasoficial";

// Curator.io Feed ID - Get this from your Curator.io dashboard
// Create a free account at https://curator.io and add your Instagram feed
const CURATOR_FEED_ID = "YOUR_CURATOR_FEED_ID"; // Replace with your actual Feed ID

const InstagramSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Curator.io script if not already loaded
    if (!document.getElementById('curator-script')) {
      const script = document.createElement('script');
      script.id = 'curator-script';
      script.src = 'https://cdn.curator.io/published/a8e8f8e8-YOUR-FEED-ID.js'; // This will be auto-loaded by Curator
      script.async = true;
      document.body.appendChild(script);
    }

    // Initialize Curator feed
    const initCurator = () => {
      if (window.Curator && containerRef.current) {
        // Curator will auto-initialize based on the data attributes
      }
    };

    // Check if Curator is already loaded
    if (window.Curator) {
      initCurator();
    } else {
      // Wait for script to load
      const checkCurator = setInterval(() => {
        if (window.Curator) {
          initCurator();
          clearInterval(checkCurator);
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkCurator), 10000);
    }
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

        {/* Curator.io Instagram Feed Container */}
        <div 
          ref={containerRef}
          id="curator-feed"
          data-feed-id={CURATOR_FEED_ID}
          className="min-h-[200px]"
        >
          {/* Fallback while feed loads or if Feed ID not configured */}
          {CURATOR_FEED_ID === "YOUR_CURATOR_FEED_ID" ? (
            <div className="text-center py-8">
              <a 
                href={`https://instagram.com/${INSTAGRAM_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="grid grid-cols-3 md:grid-cols-6 gap-1 group max-w-4xl mx-auto">
                  {[...Array(6)].map((_, index) => (
                    <div 
                      key={index}
                      className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-sm"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Instagram className="w-8 h-8 text-white/30" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Instagram className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  ))}
                </div>
              </a>
              <p className="text-xs text-muted-foreground mt-4">
                Configure o Feed ID do Curator.io para exibir fotos reais
              </p>
            </div>
          ) : (
            <div 
              className="curator-feed" 
              dangerouslySetInnerHTML={{
                __html: `<div data-crt-feed="${CURATOR_FEED_ID}"></div>`
              }}
            />
          )}
        </div>

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

// Extend Window interface for Curator
declare global {
  interface Window {
    Curator?: {
      Feed: new (options: Record<string, unknown>) => unknown;
    };
  }
}

export default InstagramSection;
