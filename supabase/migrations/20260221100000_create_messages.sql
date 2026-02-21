-- Tabella messaggi tra utenti e coach
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) > 0),
  read_at timestamptz DEFAULT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indici per query veloci
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at DESC);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Ogni utente può leggere i messaggi in cui è sender o receiver
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'users_can_read_own_messages'
  ) THEN
    CREATE POLICY "users_can_read_own_messages"
      ON public.messages FOR SELECT
      USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
  END IF;
END $$;

-- Ogni utente può inviare messaggi come sender
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'users_can_insert_messages'
  ) THEN
    CREATE POLICY "users_can_insert_messages"
      ON public.messages FOR INSERT
      WITH CHECK (auth.uid() = sender_id);
  END IF;
END $$;

-- Solo il receiver può aggiornare read_at (mark as read)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'receiver_can_mark_read'
  ) THEN
    CREATE POLICY "receiver_can_mark_read"
      ON public.messages FOR UPDATE
      USING (auth.uid() = receiver_id)
      WITH CHECK (auth.uid() = receiver_id);
  END IF;
END $$;

-- Realtime abilitato (IF NOT EXISTS via DO block)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
