CREATE TABLE public.readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  metric text NOT NULL,
  value numeric NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.readings TO authenticated;
GRANT ALL ON public.readings TO service_role;

ALTER TABLE public.readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own readings" ON public.readings
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users add own readings" ON public.readings
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own readings" ON public.readings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own readings" ON public.readings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX readings_user_recorded_idx ON public.readings (user_id, recorded_at DESC);

ALTER TABLE public.readings ADD CONSTRAINT readings_metric_check CHECK (metric IN ('hr','temp','spo2','sys','dia','glucose','sleep','mood','iop','hydration','radiation'));