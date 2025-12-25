import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCloudNotes } from "@/hooks/useCloudNotes";
import { Header } from "@/components/layout/Header";
import { NotesList } from "@/components/notes/NotesList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { AddVideoDialog } from "@/components/notes/AddVideoDialog";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { FlashcardStudy } from "@/components/study/FlashcardStudy";
import { FolderSidebar } from "@/components/folders/FolderSidebar";
import { StudyAnalytics } from "@/components/analytics/StudyAnalytics";
import { PremiumBanner } from "@/components/premium/PremiumBanner";
import { VideoNote } from "@/types/note";
import {
  BookOpen,
  Clock,
  Tag,
  Play,
  Youtube,
  Zap,
  Shield,
  Brain,
  LogIn,
  Crown,
  Loader2,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isPremium, signOut, profile } = useAuth();
  const {
    notes,
    allNotes,
    folders,
    currentNote,
    setCurrentNote,
    createNote,
    updateNote,
    removeNote,
    createFolder,
    deleteFolder,
    addTimestamp,
    removeTimestamp,
    searchQuery,
    setSearchQuery,
    selectedFolder,
    setSelectedFolder,
    isLoading,
  } = useCloudNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [activeTab, setActiveTab] = useState("notes");

  const handleSelectNote = (note: VideoNote) => {
    setCurrentNote(note);
    setIsEditing(true);
  };

  const handleAddVideo = async (videoId: string, title: string, url: string) => {
    const existingNote = allNotes.find((n) => n.videoId === videoId);
    if (existingNote) {
      setCurrentNote(existingNote);
      setIsEditing(true);
      return;
    }

    const newNote = await createNote(videoId, title, url);
    if (newNote) {
      setIsEditing(true);
    }
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setIsStudyMode(false);
    setCurrentNote(null);
  };

  const handleStudyFlashcards = () => {
    setIsStudyMode(true);
  };

  const totalTimestamps = allNotes.reduce(
    (acc, note) => acc + note.timestamps.length,
    0
  );

  const totalTags = new Set(allNotes.flatMap((note) => note.tags)).size;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {user && (
        <FolderSidebar
          folders={folders}
          selectedFolder={selectedFolder}
          onSelectFolder={setSelectedFolder}
          onCreateFolder={createFolder}
          onDeleteFolder={deleteFolder}
        />
      )}
      
      <div className="flex-1 flex flex-col">
        <Header />
        <Toaster />

        <main className="flex-1 container mx-auto px-4 py-8">
          {!isEditing ? (
            <div className="space-y-8 animate-fade-in">
              {/* Hero Section */}
              <section className="text-center py-12 relative">
                <div className="absolute inset-0 gradient-bg opacity-5 blur-3xl" />
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {isPremium && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 text-sm font-medium">
                        <Crown className="w-4 h-4" />
                        Premium
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    Welcome to{" "}
                    <span className="gradient-text">LecturerMate</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    Take smart notes while watching YouTube videos. Add timestamps,
                    AI flashcards, and sync across devices.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    {user ? (
                      <AddVideoDialog onAddVideo={handleAddVideo} />
                    ) : (
                      <Button onClick={() => navigate('/auth')} size="lg">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In to Get Started
                      </Button>
                    )}
                  </div>
                  {user && (
                    <p className="text-sm text-muted-foreground mt-4">
                      {profile?.aiCallsToday || 0}/5 AI calls used today
                      {!isPremium && " • Upgrade for unlimited"}
                    </p>
                  )}
                </div>
              </section>

              {user ? (
                <>
                  {/* Tabs for Notes / Analytics */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                      <TabsTrigger value="notes">My Notes</TabsTrigger>
                      <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="notes" className="space-y-8 mt-8">
                      {/* Stats Section */}
                      {allNotes.length > 0 && (
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <StatsCard
                            title="Total Notes"
                            value={allNotes.length}
                            icon={BookOpen}
                            description="Video notes created"
                            iconClassName="bg-primary/10 text-primary"
                          />
                          <StatsCard
                            title="Timestamps"
                            value={totalTimestamps}
                            icon={Clock}
                            description="Saved moments"
                            iconClassName="bg-accent/20 text-accent-foreground"
                          />
                          <StatsCard
                            title="Unique Tags"
                            value={totalTags}
                            icon={Tag}
                            description="Categories used"
                            iconClassName="bg-green-500/20 text-green-600"
                          />
                          <StatsCard
                            title="Folders"
                            value={folders.length}
                            icon={Play}
                            description="Organized collections"
                            iconClassName="bg-purple-500/20 text-purple-600"
                          />
                        </section>
                      )}

                      {/* Premium Banner */}
                      {!isPremium && allNotes.length > 2 && (
                        <PremiumBanner variant="compact" />
                      )}

                      {/* Notes List */}
                      <section>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold">
                            {selectedFolder 
                              ? folders.find(f => f.id === selectedFolder)?.name || 'Notes'
                              : 'All Notes'}
                          </h2>
                          {allNotes.length > 0 && (
                            <AddVideoDialog onAddVideo={handleAddVideo} />
                          )}
                        </div>
                        {isLoading ? (
                          <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        ) : (
                          <NotesList
                            notes={notes}
                            currentNote={currentNote}
                            onSelectNote={handleSelectNote}
                            onDeleteNote={removeNote}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                          />
                        )}
                      </section>
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-8">
                      <StudyAnalytics />
                      {!isPremium && (
                        <div className="mt-8">
                          <PremiumBanner />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </>
              ) : (
                /* Features Section for non-logged-in users */
                <section className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8">
                  <FeatureCard
                    icon={Youtube}
                    title="YouTube Integration"
                    description="Paste any YouTube video URL and start taking notes instantly."
                  />
                  <FeatureCard
                    icon={Clock}
                    title="Timestamp Notes"
                    description="Add timestamps to jump to specific moments in your videos."
                  />
                  <FeatureCard
                    icon={Brain}
                    title="AI Flashcards"
                    description="Generate study flashcards from your notes with AI assistance."
                  />
                  <FeatureCard
                    icon={Zap}
                    title="AI Explanations"
                    description="Get instant AI explanations for any text you select."
                  />
                  <FeatureCard
                    icon={BookOpen}
                    title="Cloud Sync"
                    description="Access your notes from any device with cloud synchronization."
                  />
                  <FeatureCard
                    icon={Tag}
                    title="Folder Organization"
                    description="Organize notes into folders for easy management."
                  />
                  <FeatureCard
                    icon={Shield}
                    title="Export Options"
                    description="Export to Markdown, JSON, or Anki flashcards."
                  />
                  <FeatureCard
                    icon={Crown}
                    title="Premium Features"
                    description="Unlimited AI, analytics, and collaboration tools."
                  />
                </section>
              )}
            </div>
          ) : currentNote ? (
            isStudyMode ? (
              <FlashcardStudy
                note={currentNote}
                onClose={() => setIsStudyMode(false)}
              />
            ) : (
              <NoteEditor
                note={currentNote}
                onUpdate={updateNote}
                onClose={handleCloseEditor}
                onAddTimestamp={addTimestamp}
                onRemoveTimestamp={removeTimestamp}
                onStudyFlashcards={handleStudyFlashcards}
              />
            )
          ) : null}
        </main>
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-primary-foreground" />
    </div>
    <h3 className="font-semibold text-lg mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;
