-- Create unique index on video_url to prevent duplicate videos
CREATE UNIQUE INDEX IF NOT EXISTS exercise_videos_video_url_unique 
ON exercise_videos(video_url);