import { useState } from 'react';
import { Folder } from '@/types/note';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderIcon, FolderPlus, Trash2, Home, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolder: string | null;
  onSelectFolder: (id: string | null) => void;
  onCreateFolder: (name: string, color?: string) => Promise<Folder | null>;
  onDeleteFolder: (id: string) => Promise<void>;
}

const FOLDER_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

export const FolderSidebar = ({
  folders,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
}: FolderSidebarProps) => {
  const { isPremium } = useAuth();
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await onCreateFolder(newFolderName.trim(), newFolderColor);
    setNewFolderName('');
    setNewFolderColor(FOLDER_COLORS[0]);
    setIsOpen(false);
  };

  const maxFolders = isPremium ? Infinity : 3;
  const canCreateFolder = folders.length < maxFolders;

  return (
    <div className="w-64 border-r border-border glass-panel flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
          Folders
        </h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              disabled={!canCreateFolder}
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
              {!canCreateFolder && <Crown className="w-3 h-3 ml-auto text-amber-500" />}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Color</p>
                <div className="flex flex-wrap gap-2">
                  {FOLDER_COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-lg transition-all',
                        newFolderColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewFolderColor(color)}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateFolder} className="w-full">
                Create Folder
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {!canCreateFolder && (
          <p className="text-xs text-muted-foreground mt-2">
            Free tier limited to {maxFolders} folders
          </p>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <button
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              !selectedFolder
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted text-muted-foreground'
            )}
            onClick={() => onSelectFolder(null)}
          >
            <Home className="w-4 h-4" />
            All Notes
          </button>

          {folders.map((folder) => (
            <div
              key={folder.id}
              className={cn(
                'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer',
                selectedFolder === folder.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted text-muted-foreground'
              )}
              onClick={() => onSelectFolder(folder.id)}
            >
              <FolderIcon
                className="w-4 h-4"
                style={{ color: folder.color }}
              />
              <span className="flex-1 truncate">{folder.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFolder(folder.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
