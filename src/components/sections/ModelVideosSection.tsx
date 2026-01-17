import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";
import { useVideosSettings } from "@/hooks/useSiteSettings";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface VideoItem {
  id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
}

const VideoCard = ({ video, index }: { video: VideoItem; index: number }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current && video.video_url) {
      videoRef.current.play().catch(() => {});
    }
  }, [video.video_url]);

  const handleClick = () => {
    if (video.video_url) {
      setSelectedVideo(video);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className="relative aspect-[9/16] bg-muted rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Video (autoplay loop) */}
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
          /* Fallback if no video */
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

        {/* Video Title */}
        {video.title && video.video_url && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-white text-sm font-medium truncate">
              {video.title}
            </p>
          </div>
        )}

        {/* Click to expand indicator */}
        {video.video_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play className="w-5 h-5 text-foreground fill-foreground ml-0.5" />
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

  // Don't render if no videos configured
  if (!loading && videos.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-8">
            <div className="h-4 w-24 bg-muted rounded animate-pulse mx-auto mb-2" />
            <div className="h-8 w-48 bg-muted rounded animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[9/16] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Inspire-se
          </span>
          <h2 className="text-2xl lg:text-3xl font-bold mt-2">
            Veja Nossos Looks
          </h2>
        </div>

        {/* Videos Grid - 4 portrait videos with 9:16 aspect ratio */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {videos.slice(0, 4).map((video, index) => (
            <VideoCard key={video.id || index} video={video} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModelVideosSection;
