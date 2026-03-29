
CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  text text NOT NULL,
  choices text[] NOT NULL,
  correct_index integer NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to questions"
  ON public.questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX idx_questions_category ON public.questions(category);
CREATE INDEX idx_questions_difficulty ON public.questions(difficulty);
