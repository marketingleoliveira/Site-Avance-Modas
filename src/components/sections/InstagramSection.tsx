import { useEffect } from "react";
import { Instagram, ExternalLink } from "lucide-react";

const INSTAGRAM_USERNAME = "avancemodasoficial";
const CURATOR_FEED_ID = "abf84bdb-32da-4a02-b55e-4116eef0cf19";

const InstagramSection = () => {
  useEffect(() => {
    // Load Curator.io embed script
    const existingScript = document.getElementById('curator-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'curator-script';
    script.src = `https://cdn.curator.io/published/${CURATOR_FEED_ID}.js`;
    script.async = true;
    script.charset = 'UTF-8';
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('curator-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
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

        {/* Curator.io Instagram Feed */}
        <div id={`curator-feed-${CURATOR_FEED_ID}`} className="min-h-[300px]">
          <a 
            href="https://curator.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="crt-logo crt-tag hidden"
          >
            Powered by Curator.io
          </a>
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

export default InstagramSection;
