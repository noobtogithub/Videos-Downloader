import { useState } from 'react';
import { Download, Video, Music, Pause, Play, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface DownloadItem {
  id: string;
  url: string;
  title: string;
  format: string;
  quality: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'paused' | 'error';
  thumbnail?: string;
}

export const VideoDownloader = () => {
  const [url, setUrl] = useState('');
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [selectedFormat, setSelectedFormat] = useState('mp4');
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const { toast } = useToast();

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload = () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(url)) {
      toast({
        title: "Error", 
        description: "Please enter a valid URL format",
        variant: "destructive",
      });
      return;
    }

    const newDownload: DownloadItem = {
      id: Date.now().toString(),
      url,
      title: `Video from ${new URL(url).hostname}`,
      format: selectedFormat,
      quality: selectedQuality,
      progress: 0,
      status: 'pending',
    };

    setDownloads(prev => [newDownload, ...prev]);
    setUrl('');

    // Simulate download progress
    setTimeout(() => {
      setDownloads(prev => 
        prev.map(item => 
          item.id === newDownload.id 
            ? { ...item, status: 'downloading' as const }
            : item
        )
      );

      const progressInterval = setInterval(() => {
        setDownloads(prev => {
          const updated = prev.map(item => {
            if (item.id === newDownload.id && item.status === 'downloading') {
              const newProgress = Math.min(item.progress + Math.random() * 15, 100);
              return {
                ...item,
                progress: newProgress,
                status: newProgress >= 100 ? 'completed' as const : 'downloading' as const
              };
            }
            return item;
          });
          
          const current = updated.find(item => item.id === newDownload.id);
          if (current?.status === 'completed') {
            clearInterval(progressInterval);
            toast({
              title: "Download Complete",
              description: `${current.title} has been downloaded successfully`,
            });
          }
          
          return updated;
        });
      }, 500);
    }, 1000);

    toast({
      title: "Download Started",
      description: "Your video download has been added to the queue",
    });
  };

  const toggleDownload = (id: string) => {
    setDownloads(prev => 
      prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              status: item.status === 'downloading' ? 'paused' : 'downloading' 
            }
          : item
      )
    );
  };

  const getStatusColor = (status: DownloadItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'downloading': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Mobile Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
            Video Downloader
          </h1>
          <p className="text-sm text-muted-foreground">
            Download videos from any URL
          </p>
          <div className="mt-3 p-3 rounded-lg border border-yellow-600/20 bg-yellow-600/10">
            <p className="text-xs text-yellow-200">
              ⚠️ Ensure you have permission to download content
            </p>
          </div>
        </div>

        {/* Mobile-Optimized Download Form */}
        <Card className="backdrop-blur-glass bg-glass-bg border-glass-border shadow-glow mb-6 p-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Paste video URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-base py-4 backdrop-blur-sm bg-black/20 border-glass-border"
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Format</label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger className="backdrop-blur-sm bg-black/20 border-glass-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mp4">
                        <div className="flex items-center gap-2">
                          <Video size={16} />
                          MP4 Video
                        </div>
                      </SelectItem>
                      <SelectItem value="mp3">
                        <div className="flex items-center gap-2">
                          <Music size={16} />
                          MP3 Audio
                        </div>
                      </SelectItem>
                      <SelectItem value="webm">
                        <div className="flex items-center gap-2">
                          <Video size={16} />
                          WebM Video
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium">Quality</label>
                  <Select value={selectedQuality} onValueChange={setSelectedQuality}>
                    <SelectTrigger className="backdrop-blur-sm bg-black/20 border-glass-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="720p">720p HD</SelectItem>
                      <SelectItem value="480p">480p SD</SelectItem>
                      <SelectItem value="360p">360p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleDownload}
              className="w-full py-4 text-base bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={!url.trim()}
            >
              <Download className="mr-2" size={18} />
              Start Download
            </Button>
          </div>
        </Card>

        {/* Mobile Downloads List */}
        {downloads.length > 0 && (
          <Card className="backdrop-blur-glass bg-glass-bg border-glass-border shadow-glow">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <History size={18} />
                <h2 className="text-lg font-semibold">Downloads</h2>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {downloads.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {downloads.map((download) => (
                  <div 
                    key={download.id}
                    className="p-3 rounded-lg backdrop-blur-sm bg-black/20 border border-glass-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm leading-tight truncate">{download.title}</h3>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {download.url}
                        </p>
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {download.format.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {download.quality}
                          </Badge>
                          <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(download.status)}`} />
                          <span className="text-xs capitalize">{download.status}</span>
                        </div>
                      </div>

                      {(download.status === 'downloading' || download.status === 'paused') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDownload(download.id)}
                          className="ml-2 h-8 w-8"
                        >
                          {download.status === 'downloading' ? 
                            <Pause size={14} /> : <Play size={14} />
                          }
                        </Button>
                      )}
                    </div>

                    {download.status === 'downloading' && (
                      <div className="space-y-1">
                        <Progress value={download.progress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground text-right">
                          {Math.round(download.progress)}%
                        </p>
                      </div>
                    )}

                    {download.status === 'completed' && (
                      <div className="text-xs text-green-400 font-medium">
                        ✓ Download completed
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};