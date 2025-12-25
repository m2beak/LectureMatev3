import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoId: string;
  onTimeUpdate?: (time: number) => void;
  className?: string;
}

export interface VideoPlayerRef {
  getCurrentTime: () => number;
  seekTo: (time: number) => void;
  play: () => void;
  pause: () => void;
}

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, onTimeUpdate, className }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [showControls, setShowControls] = useState(false);
    const playerRef = useRef<any>(null);

    useEffect(() => {
      // Load YouTube IFrame API
      if (!window.YT) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(script);
      }

      const initPlayer = () => {
        if (window.YT && window.YT.Player) {
          playerRef.current = new window.YT.Player(`youtube-player-${videoId}`, {
            videoId,
            playerVars: {
              autoplay: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              controls: 0,
            },
            events: {
              onReady: (event: any) => {
                setDuration(event.target.getDuration());
              },
              onStateChange: (event: any) => {
                setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
              },
            },
          });
        }
      };

      if (window.YT && window.YT.Player) {
        initPlayer();
      } else {
        (window as any).onYouTubeIframeAPIReady = initPlayer;
      }

      return () => {
        if (playerRef.current) {
          playerRef.current.destroy();
        }
      };
    }, [videoId]);

    useEffect(() => {
      const interval = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
          onTimeUpdate?.(time);
        }
      }, 500);

      return () => clearInterval(interval);
    }, [onTimeUpdate]);

    useImperativeHandle(ref, () => ({
      getCurrentTime: () => playerRef.current?.getCurrentTime() || 0,
      seekTo: (time: number) => {
        playerRef.current?.seekTo(time, true);
        setCurrentTime(time);
      },
      play: () => playerRef.current?.playVideo(),
      pause: () => playerRef.current?.pauseVideo(),
    }));

    const togglePlay = () => {
      if (isPlaying) {
        playerRef.current?.pauseVideo();
      } else {
        playerRef.current?.playVideo();
      }
    };

    const toggleMute = () => {
      if (isMuted) {
        playerRef.current?.unMute();
        playerRef.current?.setVolume(volume);
      } else {
        playerRef.current?.mute();
      }
      setIsMuted(!isMuted);
    };

    const handleVolumeChange = (value: number[]) => {
      const newVolume = value[0];
      setVolume(newVolume);
      playerRef.current?.setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
        playerRef.current?.unMute();
      }
    };

    const handleSeek = (value: number[]) => {
      const time = value[0];
      playerRef.current?.seekTo(time, true);
      setCurrentTime(time);
    };

    const skip = (seconds: number) => {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      playerRef.current?.seekTo(newTime, true);
      setCurrentTime(newTime);
    };

    return (
      <div
        className={cn("relative rounded-xl overflow-hidden bg-card shadow-xl", className)}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="aspect-video">
          <div id={`youtube-player-${videoId}`} className="w-full h-full" />
        </div>

        {/* Custom Controls Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="glass"
              size="icon-lg"
              className="rounded-full w-16 h-16"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
            {/* Progress Bar */}
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon-sm" onClick={() => skip(-10)}>
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => skip(10)}>
                  <SkipForward className="w-4 h-4" />
                </Button>

                <span className="text-xs font-mono text-foreground/80 ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 group">
                  <Button variant="ghost" size="icon-sm" onClick={toggleMute}>
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="w-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    const elem = document.querySelector(`#youtube-player-${videoId}`) as HTMLElement;
                    elem?.requestFullscreen();
                  }}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

// Extend Window interface for YT
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
