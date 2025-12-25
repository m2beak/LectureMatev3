import { useState } from 'react';
import { VideoNote } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Copy, Link, Mail, Crown, Globe, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface ShareNoteDialogProps {
  note: VideoNote;
  onUpdate: (note: VideoNote) => void;
}

export const ShareNoteDialog = ({ note, onUpdate }: ShareNoteDialogProps) => {
  const { isPremium } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = `${window.location.origin}/shared/${note.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'Share this link with others to view your note.',
    });
  };

  const handleTogglePublic = () => {
    onUpdate({ ...note, isPublic: !note.isPublic });
    toast({
      title: note.isPublic ? 'Note is now private' : 'Note is now public',
      description: note.isPublic 
        ? 'Only you can view this note.'
        : 'Anyone with the link can view this note.',
    });
  };

  const handleInvite = () => {
    if (!email.trim()) return;
    
    toast({
      title: 'Invitation sent!',
      description: `${email} will receive an email invitation.`,
    });
    setEmail('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Share Note
            {!isPremium && (
              <Badge variant="outline" className="ml-2">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Share your notes with others or make them public.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Public toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {note.isPublic ? (
                <Globe className="w-5 h-5 text-green-500" />
              ) : (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium text-sm">
                  {note.isPublic ? 'Public' : 'Private'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {note.isPublic 
                    ? 'Anyone with the link can view'
                    : 'Only you can access'}
                </p>
              </div>
            </div>
            <Switch
              checked={note.isPublic}
              onCheckedChange={handleTogglePublic}
            />
          </div>

          {/* Share link */}
          {note.isPublic && (
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="text-xs"
                />
                <Button size="icon" variant="outline" onClick={handleCopyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Collaboration (Premium) */}
          <div className={!isPremium ? 'opacity-50 pointer-events-none' : ''}>
            <div className="flex items-center justify-between mb-2">
              <Label>Invite Collaborators</Label>
              {!isPremium && (
                <Badge variant="outline" className="text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isPremium}
              />
              <Button onClick={handleInvite} disabled={!isPremium}>
                <Mail className="w-4 h-4 mr-2" />
                Invite
              </Button>
            </div>
            {!isPremium && (
              <p className="text-xs text-muted-foreground mt-2">
                Upgrade to Premium to invite collaborators
              </p>
            )}
          </div>

          {/* Quick share buttons */}
          <div className="space-y-2">
            <Label>Quick Share</Label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out my notes on "${note.videoTitle}"`)}`, '_blank');
                }}
              >
                Twitter
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                }}
              >
                LinkedIn
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  window.open(`mailto:?subject=${encodeURIComponent(`Notes: ${note.videoTitle}`)}&body=${encodeURIComponent(`Check out my notes: ${shareUrl}`)}`, '_blank');
                }}
              >
                Email
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
