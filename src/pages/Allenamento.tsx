import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Search, Play, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useExerciseVideos, ExerciseVideo } from '@/hooks/useExerciseVideos';
import VideoPlayerModal from '@/components/VideoPlayerModal';
import BottomDock from '@/components/BottomDock';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const Allenamento = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    groupedByCategory,
    loading,
    searchQuery,
    setSearchQuery,
    extractVideoId,
  } = useExerciseVideos();

  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleVideoClick = (video: ExerciseVideo) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary/20 via-background to-background pt-12 pb-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/20">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Allenamento</h1>
              <p className="text-sm text-muted-foreground">
                Archivio esercizi video
              </p>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Search Bar */}
      <div className="px-4 -mt-2 mb-4">
        <div className="max-w-lg mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cerca esercizio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4">
        <div className="max-w-lg mx-auto space-y-2">
          {loading ? (
            // Loading skeleton
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-elegant rounded-xl p-4">
                  <Skeleton className="h-6 w-32 mb-3" />
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : groupedByCategory.length === 0 ? (
            <div className="card-elegant rounded-xl p-8 text-center">
              <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Nessun esercizio trovato'
                  : 'Nessun video disponibile'}
              </p>
            </div>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={groupedByCategory.map((g) => g.category)}
              className="space-y-2"
            >
              {groupedByCategory.map((group) => (
                <AccordionItem
                  key={group.category}
                  value={group.category}
                  className="card-elegant rounded-xl border-0 overflow-hidden"
                >
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{group.displayName}</span>
                      <Badge variant="secondary" className="ml-2">
                        {group.videos.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-2">
                      {group.videos.map((video) => (
                        <motion.button
                          key={video.id}
                          onClick={() => handleVideoClick(video)}
                          className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 rounded-lg bg-background shrink-0">
                              <Play className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium truncate">
                              {video.title}
                            </span>
                          </div>
                          <Badge
                            className={`shrink-0 ml-2 ${
                              video.trainer === 'maso'
                                ? 'bg-blue-500 hover:bg-blue-600'
                                : 'bg-purple-500 hover:bg-purple-600'
                            } text-white`}
                          >
                            {video.trainer === 'maso' ? 'Maso' : 'Martina'}
                          </Badge>
                        </motion.button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          isOpen={!!selectedVideo}
          onClose={handleCloseModal}
          videoId={extractVideoId(selectedVideo.video_url)}
          title={selectedVideo.title}
          trainer={selectedVideo.trainer as 'maso' | 'martina'}
          videoType={selectedVideo.video_type as 'shorts' | 'standard'}
        />
      )}

      <BottomDock />
    </div>
  );
};

export default Allenamento;
