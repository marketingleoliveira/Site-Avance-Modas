import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { uploadSiteImage } from "@/lib/site-settings";
import { toast } from "sonner";
import { Plus, Trash2, Play, Upload, GripVertical } from "lucide-react";

export interface VideoItem {
  id: string;
  video_url: string;
  thumbnail_url: string;
  title: string;
}

export interface VideosSettings {
  videos: VideoItem[];
}

interface VideosEditorProps {
  settings: VideosSettings | null;
  onChange: (settings: VideosSettings) => void;
}

const createEmptyVideo = (): VideoItem => ({
  id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  video_url: "",
  thumbnail_url: "",
  title: "",
});

const VideosEditor = ({ settings, onChange }: VideosEditorProps) => {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const videos = settings?.videos || [];

  const updateVideos = (newVideos: VideoItem[]) => {
    onChange({ ...settings, videos: newVideos });
  };

  const addVideo = () => {
    if (videos.length >= 4) {
      toast.error("Máximo de 4 vídeos permitidos");
      return;
    }
    updateVideos([...videos, createEmptyVideo()]);
  };

  const removeVideo = (index: number) => {
    const newVideos = videos.filter((_, i) => i !== index);
    updateVideos(newVideos);
  };

  const updateVideo = (index: number, field: keyof VideoItem, value: string) => {
    const newVideos = [...videos];
    newVideos[index] = { ...newVideos[index], [field]: value };
    updateVideos(newVideos);
  };

  const handleThumbnailUpload = async (file: File, index: number) => {
    setUploadingIndex(index);
    const path = `videos/thumbnail-${Date.now()}.${file.name.split('.').pop()}`;
    const url = await uploadSiteImage(file, path);
    setUploadingIndex(null);

    if (url) {
      updateVideo(index, 'thumbnail_url', url);
      toast.success("Thumbnail enviada com sucesso!");
    } else {
      toast.error("Erro ao enviar thumbnail");
    }
  };

  const moveVideo = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= videos.length) return;
    const newVideos = [...videos];
    const [removed] = newVideos.splice(fromIndex, 1);
    newVideos.splice(toIndex, 0, removed);
    updateVideos(newVideos);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vídeos das Modelos</h3>
          <p className="text-sm text-muted-foreground">
            Adicione até 4 vídeos em formato de stories (9:16) para a seção "Veja Nossos Looks"
          </p>
        </div>
        <Button
          onClick={addVideo}
          variant="outline"
          size="sm"
          disabled={videos.length >= 4}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Vídeo
        </Button>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Play className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Nenhum vídeo adicionado ainda.
              <br />
              Clique em "Adicionar Vídeo" para começar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {videos.map((video, index) => (
            <Card key={video.id} className="overflow-hidden">
              <CardContent className="p-3 space-y-3">
                {/* Thumbnail Preview */}
                <div className="relative aspect-[9/16] bg-muted rounded-lg overflow-hidden group">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title || `Vídeo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                      <Upload className="w-5 h-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleThumbnailUpload(file, index);
                        }}
                        disabled={uploadingIndex === index}
                      />
                    </label>
                    <button
                      onClick={() => removeVideo(index)}
                      className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Upload Loading */}
                  {uploadingIndex === index && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {/* Position Badge */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 rounded text-white text-xs font-medium">
                    #{index + 1}
                  </div>

                  {/* Move Buttons */}
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {index > 0 && (
                      <button
                        onClick={() => moveVideo(index, index - 1)}
                        className="p-1 rounded bg-black/60 hover:bg-black/80 text-white text-xs"
                        title="Mover para esquerda"
                      >
                        ←
                      </button>
                    )}
                    {index < videos.length - 1 && (
                      <button
                        onClick={() => moveVideo(index, index + 1)}
                        className="p-1 rounded bg-black/60 hover:bg-black/80 text-white text-xs"
                        title="Mover para direita"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>

                {/* Video Title */}
                <div className="space-y-1">
                  <Label className="text-xs">Título</Label>
                  <Input
                    value={video.title}
                    onChange={(e) => updateVideo(index, 'title', e.target.value)}
                    placeholder="Ex: Look Fitness"
                    className="h-8 text-sm"
                  />
                </div>

                {/* Video URL */}
                <div className="space-y-1">
                  <Label className="text-xs">URL do Vídeo</Label>
                  <Input
                    value={video.video_url}
                    onChange={(e) => updateVideo(index, 'video_url', e.target.value)}
                    placeholder="https://..."
                    className="h-8 text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Section */}
      {videos.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-sm font-medium mb-3">Preview da Seção</h4>
          <div className="bg-secondary/30 rounded-xl p-6">
            <div className="text-center mb-4">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Inspire-se
              </span>
              <h2 className="text-lg font-bold mt-1">Veja Nossos Looks</h2>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((i) => {
                const video = videos[i];
                return (
                  <div
                    key={i}
                    className="aspect-[9/16] bg-muted rounded-lg overflow-hidden"
                  >
                    {video?.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title || `Vídeo ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosEditor;
