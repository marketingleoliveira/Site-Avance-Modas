import { useState, useRef } from "react";
import { Play, X } from "lucide-react";
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
  const [isHovering, setIsHovering] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current && video.video_url) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleClick = () => {
    if (video.video_url) {
      setSelectedVideo(video);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative aspect-[9/16] bg-muted rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        {/* Thumbnail Image (shown when not hovering or no video) */}
        {video.thumbnail_url && (!isHovering || !video.video_url) && (
          <img
            src={video.thumbnail_url}
            alt={video.title || `Vídeo ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Video (plays on hover) */}
        {video.video_url && (
          <video
            ref={videoRef}
            src={video.video_url}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovering ? 'opacity-100' : 'opacity-0'
            }`}
            muted
            loop
            playsInline
          />
        )}

        {/* Fallback if no thumbnail or video */}
        {!video.thumbnail_url && !video.video_url && (
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

        {/* Play Button Overlay (shown when not hovering on videos with thumbnail) */}
        {video.thumbnail_url && video.video_url && !isHovering && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
            </div>
          </div>
        )}

        {/* Video Title */}
        {video.title && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white text-sm font-medium truncate">
              {video.title}
            </p>
          </div>
        )}

        {/* Sound indicator when playing */}
        {isHovering && video.video_url && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 rounded-full flex items-center gap-1">
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-0.5 bg-white animate-pulse" style={{ height: '40%' }} />
              <div className="w-0.5 bg-white animate-pulse" style={{ height: '80%', animationDelay: '0.1s' }} />
              <div className="w-0.5 bg-white animate-pulse" style={{ height: '60%', animationDelay: '0.2s' }} />
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
