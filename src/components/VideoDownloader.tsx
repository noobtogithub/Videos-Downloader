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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Video Downloader
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Download videos from any URL with multiple format and quality options
          </p>
          <div className="mt-4 p-4 rounded-lg border border-yellow-600/20 bg-yellow-600/10">
            <p className="text-sm text-yellow-200">
              ⚠️ Please ensure you have permission to download content and comply with platform terms of service
            </p>
          </div>
        </div>

        {/* Download Form */}
        <Card className="backdrop-blur-glass bg-glass-bg border-glass-border shadow-glow mb-8 p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <Input
                placeholder="Paste video URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-lg py-6 backdrop-blur-sm bg-black/20 border-glass-border"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quality</label>
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
              className="w-full py-6 text-lg bg-gradient-primary hover:shadow-glow transition-all duration-300"
              disabled={!url.trim()}
            >
              <Download className="mr-2" size={20} />
              Start Download
            </Button>
          </div>
        </Card>

        {/* Downloads List */}
        {downloads.length > 0 && (
          <Card className="backdrop-blur-glass bg-glass-bg border-glass-border shadow-glow">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <History size={20} />
                <h2 className="text-xl font-semibold">Downloads</h2>
                <Badge variant="secondary" className="ml-auto">
                  {downloads.length}
                </Badge>
              </div>

              <div className="space-y-4">
                {downloads.map((download) => (
                  <div 
                    key={download.id}
                    className="p-4 rounded-lg backdrop-blur-sm bg-black/20 border border-glass-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{download.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {download.url}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {download.format.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {download.quality}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(download.status)}`} />
                          <span className="text-xs capitalize">{download.status}</span>
                        </div>
                      </div>

                      {(download.status === 'downloading' || download.status === 'paused') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDownload(download.id)}
                          className="ml-4"
                        >
                          {download.status === 'downloading' ? 
                            <Pause size={16} /> : <Play size={16} />
                          }
                        </Button>
                      )}
                    </div>

                    {download.status === 'downloading' && (
                      <div className="space-y-2">
                        <Progress value={download.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right">
                          {Math.round(download.progress)}%
                        </p>
                      </div>
                    )}

                    {download.status === 'completed' && (
                      <div className="text-sm text-green-400 font-medium">
                        ✓ Download completed successfully
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