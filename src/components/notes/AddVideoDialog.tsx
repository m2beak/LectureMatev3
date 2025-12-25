import { useState } from "react";
import { parseYoutubeUrl } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Youtube, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddVideoDialogProps {
  onAddVideo: (videoId: string, title: string, url: string) => void;
}

export const AddVideoDialog = ({ onAddVideo }: AddVideoDialogProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a YouTube video URL.",
        variant: "destructive",
      });
      return;
    }

    const { videoId } = parseYoutubeUrl(url);

    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Try to get video title from oEmbed API
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      let title = "Untitled Video";
      if (response.ok) {
        const data = await response.json();
        title = data.title || title;
      }

      onAddVideo(videoId, title, url);
      setUrl("");
      setIsOpen(false);
      toast({
        title: "Video added",
        description: "You can now start taking notes!",
      });
    } catch (error) {
      // Even if title fetch fails, add the video
      onAddVideo(videoId, "Untitled Video", url);
      setUrl("");
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" size="lg" className="gap-2">
          <Plus className="w-5 h-5" />
          Add Video
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-destructive" />
            Add YouTube Video
          </DialogTitle>
          <DialogDescription>
            Paste a YouTube video URL to start taking notes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="font-mono text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Video
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
