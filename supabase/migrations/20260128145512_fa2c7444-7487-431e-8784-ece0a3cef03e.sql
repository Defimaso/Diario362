-- Create exercise_videos table
CREATE TABLE public.exercise_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  trainer TEXT NOT NULL,
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'shorts',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercise_videos ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view exercises
CREATE POLICY "Authenticated users can view exercises"
ON public.exercise_videos FOR SELECT
TO authenticated
USING (true);

-- Policy: Admins can manage exercises
CREATE POLICY "Admins can manage exercises"
ON public.exercise_videos FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_super_admin(auth.uid()));

-- Insert Martina's exercises (from document)
INSERT INTO public.exercise_videos (title, category, trainer, video_url, video_type, sort_order) VALUES
-- Kettlebell
('Stacchi Kettlebell', 'kettlebell', 'martina', 'https://youtube.com/shorts/bvQKH6HM_ks', 'shorts', 1),
('Sumo Deadlift High Pull', 'kettlebell', 'martina', 'https://youtube.com/shorts/UH-V1LnXfKM', 'shorts', 2),
('Goblet Squat Kettlebell', 'kettlebell', 'martina', 'https://youtube.com/shorts/qbdQ_0tSy2c', 'shorts', 3),
('One Leg Deadlift Kettlebell', 'kettlebell', 'martina', 'https://youtube.com/shorts/U09Q-qJXjhU', 'shorts', 4),

-- Manubri
('Curl Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/RvNqCLQlP-I', 'shorts', 1),
('Thruster Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/BXw99ij2AZI', 'shorts', 2),
('Russian Twist', 'manubri', 'martina', 'https://youtube.com/shorts/R1Z5nGSgKdc', 'shorts', 3),
('Push Jerk Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/pGNWqmJ8HGE', 'shorts', 4),
('French Press Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/wFsceTpXd5c', 'shorts', 5),
('Affondi Posteriori Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/rLZLqS0Xqng', 'shorts', 6),
('Rematore Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/lDYfQe8_c6I', 'shorts', 7),
('Renegade Row', 'manubri', 'martina', 'https://youtube.com/shorts/7XYOKbJOa50', 'shorts', 8),
('Stacchi Rumeni Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/M-ue6r1gMcU', 'shorts', 9),
('Alzate Laterali Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/kAmDh4QVvoA', 'shorts', 10),
('Rematore su Panca', 'manubri', 'martina', 'https://youtube.com/shorts/xLwSJ5qO-Fw', 'shorts', 11),
('Spinte Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/FGBDJHJZo-c', 'shorts', 12),
('Hammer Curl', 'manubri', 'martina', 'https://youtube.com/shorts/Hkwy2pjFNV8', 'shorts', 13),
('Hip Thrust One Leg Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/0oDLT2Hm_5M', 'shorts', 14),
('Reverse Fly Manubri', 'manubri', 'martina', 'https://youtube.com/shorts/xBCwCOL1oxA', 'shorts', 15),

-- Corpo Libero
('Sit Up Butterfly', 'corpo_libero', 'martina', 'https://youtube.com/shorts/sGGSN6ozpSw', 'shorts', 1),
('Reverse Lunge', 'corpo_libero', 'martina', 'https://youtube.com/shorts/TiQVmSLgA5E', 'shorts', 2),
('Sit Up', 'corpo_libero', 'martina', 'https://youtube.com/shorts/MK3cGrP4MMQ', 'shorts', 3),
('Plank Up and Down', 'corpo_libero', 'martina', 'https://youtube.com/shorts/ZuXg-lkVm9w', 'shorts', 4),
('Dips', 'corpo_libero', 'martina', 'https://youtube.com/shorts/9A_gW0FDqb8', 'shorts', 5),
('V-Pushups', 'corpo_libero', 'martina', 'https://youtube.com/shorts/xsHXn_AAmSI', 'shorts', 6),
('Affondi in Camminata', 'corpo_libero', 'martina', 'https://youtube.com/shorts/hqL0MO5EMVI', 'shorts', 7),
('Crunch Inverso', 'corpo_libero', 'martina', 'https://youtube.com/shorts/FIkp41-Y-Hg', 'shorts', 8),
('Crunch', 'corpo_libero', 'martina', 'https://youtube.com/shorts/4Zr2SgZO5m0', 'shorts', 9),
('Trazioni', 'corpo_libero', 'martina', 'https://youtube.com/shorts/xTGg-DP4E2U', 'shorts', 10),
('Pushups', 'corpo_libero', 'martina', 'https://youtube.com/shorts/2rWTrDa4sPE', 'shorts', 11),
('Step Ups', 'corpo_libero', 'martina', 'https://youtube.com/shorts/nzDhzw2F1Xg', 'shorts', 12),
('Ponte Glutei', 'corpo_libero', 'martina', 'https://youtube.com/shorts/p4aX5oeGMx8', 'shorts', 13),
('Plank', 'corpo_libero', 'martina', 'https://youtube.com/shorts/1YMRxHyKqhg', 'shorts', 14),
('Squat Jump', 'corpo_libero', 'martina', 'https://youtube.com/shorts/Qr2KPuDBKOA', 'shorts', 15),
('Burpees', 'corpo_libero', 'martina', 'https://youtube.com/shorts/kU3m8P3qleM', 'shorts', 16),
('Hollow Hold', 'corpo_libero', 'martina', 'https://youtube.com/shorts/_j5L2C1X0fI', 'shorts', 17),
('V-Sit Up', 'corpo_libero', 'martina', 'https://youtube.com/shorts/jFCmh_TP1sQ', 'shorts', 18),
('Air Squat', 'corpo_libero', 'martina', 'https://youtube.com/shorts/v_c0-DBNNCA', 'shorts', 19),
('Side Plank', 'corpo_libero', 'martina', 'https://youtube.com/shorts/cFl1cBcg3tk', 'shorts', 20),
('Mountain Climbers', 'corpo_libero', 'martina', 'https://youtube.com/shorts/wcl4bpMDBr0', 'shorts', 21),

-- Bilanciere
('Squat Bilanciere', 'bilanciere', 'martina', 'https://youtube.com/shorts/e_2BDLZlXpg', 'shorts', 1),
('Push Press Bilanciere', 'bilanciere', 'martina', 'https://youtube.com/shorts/4vHNuGEfKPU', 'shorts', 2),
('Rematore Bilanciere', 'bilanciere', 'martina', 'https://youtube.com/shorts/mWJYaT_PFOE', 'shorts', 3),
('Stacchi Rumeni Bilanciere', 'bilanciere', 'martina', 'https://youtube.com/shorts/jVGABXR8c_8', 'shorts', 4),
('Hip Thrust Bilanciere', 'bilanciere', 'martina', 'https://youtube.com/shorts/qVyRnH1Kc5g', 'shorts', 5),
('Press Bilanciere', 'bilanciere', 'martina', 'https://youtube.com/shorts/KkKMI6KaxfE', 'shorts', 6),
('Abduzioni con Disco', 'bilanciere', 'martina', 'https://youtube.com/shorts/qVyRnH1Kc5g', 'shorts', 7),
('Stacco da Terra', 'bilanciere', 'martina', 'https://youtube.com/shorts/rPNqLCFOJtM', 'shorts', 8),

-- Macchinari
('Shoulder Press Macchina', 'macchinari', 'martina', 'https://youtube.com/shorts/4xOggCPN_rk', 'shorts', 1),
('Leg Press', 'macchinari', 'martina', 'https://youtube.com/shorts/CCLW2p9pLwU', 'shorts', 2),
('Row Macchina', 'macchinari', 'martina', 'https://youtube.com/shorts/qJOmZGVPX1Q', 'shorts', 3),
('Hip Thrust Macchina', 'macchinari', 'martina', 'https://youtube.com/shorts/_YKKvFd1hf8', 'shorts', 4),
('Pulley', 'macchinari', 'martina', 'https://youtube.com/shorts/t2q_VDlbO-o', 'shorts', 5),
('Push Down Cavi', 'macchinari', 'martina', 'https://youtube.com/shorts/OuAgXpVg_E4', 'shorts', 6),
('Lat Machine', 'macchinari', 'martina', 'https://youtube.com/shorts/IpQFcQMGH64', 'shorts', 7),

-- Elastici
('Curl Bicipiti Elastico', 'elastici', 'martina', 'https://youtube.com/shorts/MKrcPYqKLm0', 'shorts', 1),
('Abduzioni Elastico', 'elastici', 'martina', 'https://youtube.com/shorts/oJYSo71jYcE', 'shorts', 2),
('Glute Bridge Elastico', 'elastici', 'martina', 'https://youtube.com/shorts/WKFVnz4rj6I', 'shorts', 3),

-- TRX
('Australian Pull Up TRX', 'trx', 'martina', 'https://youtube.com/shorts/JkwrOIuWFkE', 'shorts', 1),

-- Mobilita (standard format)
('Routine Completa Foam Roller', 'mobilita', 'martina', 'https://youtu.be/CmIWyGE1q9k', 'standard', 1),
('Mobilita a Corpo Libero', 'mobilita', 'martina', 'https://youtu.be/y3c44hq9N8E', 'standard', 2),
('Ciciling Spalla', 'mobilita', 'martina', 'https://youtube.com/shorts/xXhfkVQi1eg', 'shorts', 3),
('Windmill', 'mobilita', 'martina', 'https://youtube.com/shorts/wdCZ93xkDmY', 'shorts', 4),
('Halo Kettlebell', 'mobilita', 'martina', 'https://youtube.com/shorts/bJPy-FGHJ3A', 'shorts', 5),
('Cat Cow', 'mobilita', 'martina', 'https://youtube.com/shorts/n2xgEJWU5DY', 'shorts', 6),
('Squat Reach', 'mobilita', 'martina', 'https://youtube.com/shorts/OdA9djNaqPk', 'shorts', 7),
('Mobility Spalle', 'mobilita', 'martina', 'https://youtube.com/shorts/U7MRb2QdNtM', 'shorts', 8),
('Mobilita Anche', 'mobilita', 'martina', 'https://youtube.com/shorts/5u8G1Z-0TtU', 'shorts', 9);