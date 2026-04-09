import { useState, useRef, useEffect } from "react";
import { Play, ShoppingBag } from "lucide-react";
import { useVideosSettings } from "@/hooks/useSiteSettings";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface VideoItem {
  id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
  product_handle?: string;
  product_title?: string;
  product_price?: string;
  product_original_price?: string;
  product_image?: string;
}

const VideoCard = ({ video, index }: { video: VideoItem; index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    if (videoRef.current && video.video_url) {
      videoRef.current.play().catch(() => {});
    }
  }, [video.video_url]);

  const handleClick = () => {
    if (video.video_url) {
      setSelectedVideo(video);
    }
  };

  const hasProduct = video.product_handle && video.product_title;

  return (
    <>
      <div
        onClick={handleClick}
        className="relative aspect-[9/16] bg-muted rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
      >
        {/* Video */}
        {video.video_url ? (
          <video
            ref={videoRef}
            src={video.video_url}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center mx-auto">
                <Play className="w-8 h-8 text-foreground/60" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">
                {video.title || `Vídeo ${index + 1}`}
              </p>
            </div>
          </div>
        )}

        {/* Bottom product info overlay */}
        {hasProduct && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-16 pb-3 px-3">
            <div className="flex items-center gap-2.5">
              {/* Small product thumbnail */}
              {video.product_image && (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 border-white/30 flex-shrink-0 bg-white/10">
                  <img 
                    src={video.product_image} 
                    alt={video.product_title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {/* Title & Price */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-[11px] sm:text-xs font-bold uppercase truncate leading-tight">
                  {video.product_title}
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-white text-sm sm:text-base font-black">
                    {video.product_price}
                  </span>
                </div>
                {video.product_original_price && (
                  <span className="text-red-400 text-[10px] sm:text-xs line-through font-medium">
                    {video.product_original_price}
                  </span>
                )}
              </div>
            </div>

            {/* Buy button */}
            <Link
              to={`/produto/${video.product_handle}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 bg-white text-black text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Comprar
            </Link>
          </div>
        )}

        {/* Title-only fallback (no product linked) */}
        {!hasProduct && video.title && video.video_url && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-sm font-medium truncate">
              {video.title}
            </p>
          </div>
        )}

        {/* Play button on hover */}
        {video.video_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
              <Play className="w-6 h-6 text-foreground fill-foreground ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-lg p-0 bg-black border-0 overflow-hidden">
          <div className="relative aspect-[9/16] w-full">
            {selectedVideo?.video_url && (
              <video
                src={selectedVideo.video_url}
                controls
                autoPlay
                loop
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ModelVideosSection = () => {
  const { settings, loading } = useVideosSettings();

  const videos = settings?.videos || [];

  if (!loading && videos.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-14 sm:py-20 bg-secondary/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="h-4 w-24 bg-muted rounded animate-pulse mx-auto mb-2" />
            <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[9/16] bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-14 sm:py-20 bg-secondary/30">
      <div className="container px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-[3px] bg-accent rounded-full" />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-accent">
              Inspire-se
            </span>
            <div className="w-8 h-[3px] bg-accent rounded-full" />
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground">
            Veja Nossos Looks
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Assista e inspire-se com nossos looks favoritos
          </p>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
          {videos.slice(0, 4).map((video, index) => (
            <VideoCard key={video.id || index} video={video as VideoItem} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModelVideosSection;
