import { useEffect } from "react";
import { Instagram, ExternalLink } from "lucide-react";
import { useInstagramSettings } from "@/hooks/useSiteSettings";

const InstagramSection = () => {
  const { settings, loading } = useInstagramSettings();

  useEffect(() => {
    if (!settings?.curator_feed_id || !settings.show_section) return;

    // Load Curator.io embed script
    const existingScript = document.getElementById('curator-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'curator-script';
    script.src = `https://cdn.curator.io/published/${settings.curator_feed_id}.js`;
    script.async = true;
    script.charset = 'UTF-8';
    document.body.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('curator-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [settings?.curator_feed_id, settings?.show_section]);

  if (loading) {
    return (
      <section className="py-12 bg-background">
        <div className="container">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  if (!settings?.show_section) {
    return null;
  }

  return (
    <section className="py-12 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8">
          <a 
            href={`https://instagram.com/${settings.username}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-accent transition-colors group"
          >
            <Instagram className="w-5 h-5" />
            <span>@{settings.username}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <p className="text-xs text-muted-foreground mt-1">
            {settings.subtitle_text}
          </p>
        </div>

        {/* Curator.io Instagram Feed */}
        {settings.curator_feed_id && (
          <div id={`curator-feed-${settings.curator_feed_id}`} className="min-h-[300px]">
            <a 
              href="https://curator.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="crt-logo crt-tag hidden"
            >
              Powered by Curator.io
            </a>
          </div>
        )}

        {/* Call to action */}
        <div className="text-center mt-6">
          <a 
            href={`https://instagram.com/${settings.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
          >
            <Instagram className="w-4 h-4" />
            {settings.button_text}
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
