-- ============================================
-- NOTIFICHE ASSENZA - Logica lato database
-- Crea una vista per clienti assenti
-- e una tabella per tracciare le notifiche inviate
-- ============================================

-- Tabella per tracciare le notifiche inviate (evitare duplicati)
CREATE TABLE IF NOT EXISTS public.absence_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('day2', 'day5', 'coach_alert')),
  sent_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sent_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, notification_type, sent_date)
);

ALTER TABLE public.absence_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notifications"
  ON public.absence_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'collaborator')
    )
  );

-- Vista: clienti assenti con giorni dall'ultimo check-in
CREATE OR REPLACE VIEW public.absent_clients AS
SELECT
  p.id AS user_id,
  p.full_name,
  p.email,
  MAX(dc.date) AS last_checkin_date,
  CURRENT_DATE - MAX(dc.date) AS days_absent,
  CASE
    WHEN MAX(dc.date) IS NULL THEN 999
    WHEN CURRENT_DATE - MAX(dc.date) >= 5 THEN 5
    WHEN CURRENT_DATE - MAX(dc.date) >= 2 THEN 2
    ELSE 0
  END AS alert_level
FROM public.profiles p
LEFT JOIN public.daily_checkins dc ON dc.user_id = p.id
INNER JOIN public.user_roles ur ON ur.user_id = p.id AND ur.role = 'client'
GROUP BY p.id, p.full_name, p.email
HAVING CURRENT_DATE - MAX(dc.date) >= 2 OR MAX(dc.date) IS NULL
ORDER BY days_absent DESC;

-- Funzione che il cron job chiamera' per generare le notifiche
-- (Da chiamare via Edge Function o pg_cron se disponibile)
CREATE OR REPLACE FUNCTION public.check_absent_clients()
RETURNS TABLE(user_id UUID, full_name TEXT, email TEXT, days_absent INTEGER, alert_level INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.user_id,
    ac.full_name,
    ac.email,
    ac.days_absent::INTEGER,
    ac.alert_level::INTEGER
  FROM public.absent_clients ac
  WHERE ac.alert_level > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
