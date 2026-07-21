-- =========================================================================
-- Study App - Initial Schema
-- Matérias, tópicos, provas (N:N com peso), sessões de estudo, quiz results
-- e estado de memória por tópico para cálculo de retenção estimada
-- (curva de esquecimento exponencial: R = e^(-t/S)).
-- Multiusuário via Supabase Auth (auth.users) + Row Level Security.
-- =========================================================================

-- -------------------------------------------------------------------------
-- Extensions
-- -------------------------------------------------------------------------

create extension if not exists pgcrypto;

-- -------------------------------------------------------------------------
-- Enums
-- -------------------------------------------------------------------------

create type activity_type as enum ('leitura', 'resumo', 'esquema', 'questao');

-- -------------------------------------------------------------------------
-- Matérias
-- -------------------------------------------------------------------------

create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create index subjects_user_id_idx on subjects (user_id);

-- -------------------------------------------------------------------------
-- Tópicos (dentro de uma matéria)
-- -------------------------------------------------------------------------

create table topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, name)
);

create index topics_user_id_idx on topics (user_id);
create index topics_subject_id_idx on topics (subject_id);

-- -------------------------------------------------------------------------
-- Provas: podem abranger múltiplas matérias e/ou tópicos, cada vínculo
-- com seu próprio peso de importância dentro da prova.
-- -------------------------------------------------------------------------

create table exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  exam_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exams_user_id_idx on exams (user_id);
create index exams_exam_date_idx on exams (exam_date);

create table exam_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_id uuid not null references exams (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  weight numeric(5, 2) not null default 1 check (weight > 0),
  unique (exam_id, subject_id)
);

create index exam_subjects_exam_id_idx on exam_subjects (exam_id);
create index exam_subjects_subject_id_idx on exam_subjects (subject_id);

create table exam_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  exam_id uuid not null references exams (id) on delete cascade,
  topic_id uuid not null references topics (id) on delete cascade,
  weight numeric(5, 2) not null default 1 check (weight > 0),
  unique (exam_id, topic_id)
);

create index exam_topics_exam_id_idx on exam_topics (exam_id);
create index exam_topics_topic_id_idx on exam_topics (topic_id);

-- -------------------------------------------------------------------------
-- Sessões de estudo (sempre vinculadas a um tópico)
-- -------------------------------------------------------------------------

create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  topic_id uuid not null references topics (id) on delete cascade,
  activity_type activity_type not null,
  duration_minutes integer not null check (duration_minutes > 0),
  performed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index study_sessions_user_id_idx on study_sessions (user_id);
create index study_sessions_topic_id_idx on study_sessions (topic_id);
create index study_sessions_performed_at_idx on study_sessions (performed_at);

-- -------------------------------------------------------------------------
-- Resultados de quiz (matéria obrigatória, tópico opcional)
-- -------------------------------------------------------------------------

create table quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid not null references subjects (id) on delete cascade,
  topic_id uuid references topics (id) on delete cascade,
  correct_percentage numeric(5, 2) not null check (correct_percentage >= 0 and correct_percentage <= 100),
  questions_count integer not null check (questions_count > 0),
  performed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index quiz_results_user_id_idx on quiz_results (user_id);
create index quiz_results_subject_id_idx on quiz_results (subject_id);
create index quiz_results_topic_id_idx on quiz_results (topic_id);
create index quiz_results_performed_at_idx on quiz_results (performed_at);

-- -------------------------------------------------------------------------
-- Estado de memória por tópico: estabilidade (S, em dias) e última
-- exposição. A retenção não fica armazenada — é derivada sob demanda
-- (view/RPC) a partir desses dois valores + "agora": R = e^(-t/S).
-- -------------------------------------------------------------------------

create table topic_memory_state (
  topic_id uuid primary key references topics (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  stability_days numeric(8, 2) not null default 1,
  last_reviewed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index topic_memory_state_user_id_idx on topic_memory_state (user_id);

-- -------------------------------------------------------------------------
-- Manutenção do estado de memória via trigger.
--
-- Heurística inicial (ajustável depois sem mudar o schema):
--   - cada evento de revisão (sessão de estudo ou quiz) traz um "sinal de
--     qualidade" de 0 a 1;
--   - sinal >= 0.6 aumenta a estabilidade (reforço), sinal menor reduz
--     (esquecimento/dificuldade), sempre com um piso mínimo de 1 dia;
--   - sessões de "questão" valem mais que "leitura" como prática de
--     recuperação ativa, alinhado à literatura de espaçamento.
-- -------------------------------------------------------------------------

create function fn_upsert_topic_memory_state(
  p_topic_id uuid,
  p_user_id uuid,
  p_quality numeric,
  p_reviewed_at timestamptz
) returns void as $$
declare
  v_current_stability numeric(8, 2);
  v_new_stability numeric(8, 2);
begin
  select stability_days into v_current_stability
  from topic_memory_state
  where topic_id = p_topic_id;

  if v_current_stability is null then
    v_current_stability := 1;
  end if;

  if p_quality >= 0.6 then
    v_new_stability := v_current_stability * (1 + p_quality);
  else
    v_new_stability := greatest(v_current_stability * 0.5, 1);
  end if;

  insert into topic_memory_state (topic_id, user_id, stability_days, last_reviewed_at, updated_at)
  values (p_topic_id, p_user_id, v_new_stability, p_reviewed_at, now())
  on conflict (topic_id) do update
    set stability_days = excluded.stability_days,
        last_reviewed_at = excluded.last_reviewed_at,
        updated_at = now()
    where topic_memory_state.last_reviewed_at <= excluded.last_reviewed_at;
end;
$$ language plpgsql security definer set search_path = public;

create function fn_study_session_memory_trigger() returns trigger as $$
declare
  v_quality numeric;
begin
  v_quality := case new.activity_type
    when 'questao' then 0.9
    when 'esquema' then 0.7
    when 'resumo' then 0.6
    when 'leitura' then 0.4
  end;

  perform fn_upsert_topic_memory_state(new.topic_id, new.user_id, v_quality, new.performed_at);
  return new;
end;
$$ language plpgsql;

create trigger study_sessions_after_insert
  after insert on study_sessions
  for each row execute function fn_study_session_memory_trigger();

create function fn_quiz_result_memory_trigger() returns trigger as $$
begin
  if new.topic_id is not null then
    perform fn_upsert_topic_memory_state(
      new.topic_id,
      new.user_id,
      new.correct_percentage / 100.0,
      new.performed_at
    );
  end if;
  return new;
end;
$$ language plpgsql;

create trigger quiz_results_after_insert
  after insert on quiz_results
  for each row execute function fn_quiz_result_memory_trigger();

-- -------------------------------------------------------------------------
-- View de retenção estimada por tópico (calculada sob demanda).
-- Tópicos sem nenhuma revisão registrada não aparecem aqui (retenção
-- indefinida até a primeira sessão/quiz).
-- -------------------------------------------------------------------------

create view topic_retention as
select
  t.id as topic_id,
  t.subject_id,
  t.user_id,
  tms.last_reviewed_at,
  tms.stability_days,
  extract(epoch from (now() - tms.last_reviewed_at)) / 86400 as days_since_review,
  exp(
    - (extract(epoch from (now() - tms.last_reviewed_at)) / 86400) / tms.stability_days
  ) as estimated_retention
from topics t
join topic_memory_state tms on tms.topic_id = t.id;

-- -------------------------------------------------------------------------
-- Row Level Security: cada usuário só acessa seus próprios dados.
-- -------------------------------------------------------------------------

alter table subjects enable row level security;
alter table topics enable row level security;
alter table exams enable row level security;
alter table exam_subjects enable row level security;
alter table exam_topics enable row level security;
alter table study_sessions enable row level security;
alter table quiz_results enable row level security;
alter table topic_memory_state enable row level security;

create policy "subjects_owner" on subjects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "topics_owner" on topics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exams_owner" on exams
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exam_subjects_owner" on exam_subjects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exam_topics_owner" on exam_topics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "study_sessions_owner" on study_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "quiz_results_owner" on quiz_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "topic_memory_state_owner" on topic_memory_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- topic_retention is a view: RLS of its underlying tables (topics,
-- topic_memory_state) already restricts rows per user automatically.
