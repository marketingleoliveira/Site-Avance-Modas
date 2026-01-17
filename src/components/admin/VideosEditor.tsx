import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { uploadSiteImage } from "@/lib/site-settings";
import { toast } from "sonner";
import { Plus, Trash2, Play, Upload, Video, Image as ImageIcon } from "lucide-react";

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

const uploadVideo = async (file: File, path: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('site-images')
    .upload(path, file, { upsert: true });

  if (error) {
    console.error('Error uploading video:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('site-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
};

const VideosEditor = ({ settings, onChange }: VideosEditorProps) => {
  const [uploadingThumbnail, setUploadingThumbnail] = useState<number | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState<number | null>(null);

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
    setUploadingThumbnail(index);
    const path = `videos/thumbnail-${Date.now()}.${file.name.split('.').pop()}`;
    const url = await uploadSiteImage(file, path);
    setUploadingThumbnail(null);

    if (url) {
      updateVideo(index, 'thumbnail_url', url);
      toast.success("Thumbnail enviada!");
    } else {
      toast.error("Erro ao enviar thumbnail");
    }
  };

  const handleVideoUpload = async (file: File, index: number) => {
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Vídeo muito grande. Máximo: 50MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error("Arquivo inválido. Envie um vídeo.");
      return;
    }

    setUploadingVideo(index);
    const path = `videos/video-${Date.now()}.${file.name.split('.').pop()}`;
    const url = await uploadVideo(file, path);
    setUploadingVideo(null);

    if (url) {
      updateVideo(index, 'video_url', url);
      toast.success("Vídeo enviado com sucesso!");
    } else {
      toast.error("Erro ao enviar vídeo");
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
                  ) : video.video_url ? (
                    <video
                      src={video.video_url}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}

                  {/* Video indicator */}
                  {video.video_url && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/80 rounded text-white text-[10px] font-medium flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      OK
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => removeVideo(index)}
                      className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Upload Loading */}
                  {(uploadingThumbnail === index || uploadingVideo === index) && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-white text-xs">
                        {uploadingVideo === index ? "Enviando vídeo..." : "Enviando thumbnail..."}
                      </span>
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

                {/* Upload Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Video Upload */}
                  <label className="cursor-pointer">
                    <div className={`flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                      video.video_url 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}>
                      <Video className="w-3 h-3" />
                      {video.video_url ? 'Alterar' : 'Vídeo'}
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoUpload(file, index);
                      }}
                      disabled={uploadingVideo === index}
                    />
                  </label>

                  {/* Thumbnail Upload */}
                  <label className="cursor-pointer">
                    <div className={`flex items-center justify-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-colors ${
                      video.thumbnail_url 
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}>
                      <ImageIcon className="w-3 h-3" />
                      Capa
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleThumbnailUpload(file, index);
                      }}
                      disabled={uploadingThumbnail === index}
                    />
                  </label>
                </div>

                {/* Or URL */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Ou cole URL do vídeo</Label>
                  <Input
                    value={video.video_url}
                    onChange={(e) => updateVideo(index, 'video_url', e.target.value)}
                    placeholder="https://..."
                    className="h-8 text-xs"
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
                    ) : video?.video_url ? (
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover"
                        muted
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

      {/* Help Text */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Dicas:</strong>
        </p>
        <ul className="text-xs text-blue-700 dark:text-blue-400 mt-1 space-y-1 list-disc list-inside">
          <li>Vídeos em formato vertical (9:16) ficam melhores</li>
          <li>Tamanho máximo: 50MB por vídeo</li>
          <li>A capa (thumbnail) é exibida antes do hover</li>
          <li>No site, o vídeo toca automaticamente ao passar o mouse</li>
        </ul>
      </div>
    </div>
  );
};

export default VideosEditor;
