import { Play } from "lucide-react";

interface VideoItem {
  id: string;
  video_url: string;
  thumbnail_url?: string;
  title?: string;
}

interface ModelVideosSectionProps {
  videos?: VideoItem[];
}

// Placeholder videos for demonstration
const placeholderVideos: VideoItem[] = [
  { id: '1', video_url: '', thumbnail_url: '', title: 'Look 1' },
  { id: '2', video_url: '', thumbnail_url: '', title: 'Look 2' },
  { id: '3', video_url: '', thumbnail_url: '', title: 'Look 3' },
  { id: '4', video_url: '', thumbnail_url: '', title: 'Look 4' },
];

const ModelVideosSection = ({ videos = placeholderVideos }: ModelVideosSectionProps) => {
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
            <div
              key={video.id || index}
              className="relative aspect-[9/16] bg-muted rounded-xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.title || `Vídeo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

              {/* Play Button Overlay */}
              {video.thumbnail_url && (
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <Play className="w-6 h-6 text-foreground fill-foreground ml-1" />
                  </div>
                </div>
              )}

              {/* Video Title */}
              {video.title && video.thumbnail_url && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-white text-sm font-medium truncate">
                    {video.title}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModelVideosSection;
