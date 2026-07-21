-- =========================================================================
-- Motor de priorização de tópicos.
--
-- prioridade = importância × (1 − retenção_estimada) × urgência_de_prova
--
-- importância = manual_importance (campo editável em topics, base 1)
--             + soma dos pesos das provas futuras ligadas ao tópico
--               (usa o peso de exam_topics quando existe; senão cai para
--               o peso de exam_subjects da matéria do tópico naquela prova)
--
-- urgência    = 1 quando não há prova futura ligada ao tópico (neutro,
--               não penaliza nem favorece)
--             = 1 + urgency_boost * e^(-dias_restantes / k) quando há,
--               crescendo suavemente até 1+urgency_boost no dia da prova
--               e tendendo a 1 (neutro) conforme a prova fica distante —
--               assim provas distantes não derrubam o tópico abaixo do
--               nível "sem prova".
-- =========================================================================

alter table topics
  add column manual_importance numeric(4, 2) not null default 1 check (manual_importance > 0);

create function get_topic_priorities(
  p_user_id uuid default auth.uid(),
  p_urgency_k numeric default 7,
  p_urgency_boost numeric default 2
) returns table (
  topic_id uuid,
  topic_name text,
  subject_id uuid,
  subject_name text,
  manual_importance numeric,
  exam_weight_component numeric,
  importance numeric,
  estimated_retention numeric,
  forgetting numeric,
  nearest_exam_id uuid,
  nearest_exam_name text,
  days_to_nearest_exam integer,
  urgency numeric,
  priority numeric
)
language sql
stable
as $$
  with user_topics as (
    select t.id as topic_id, t.name as topic_name, t.subject_id, s.name as subject_name,
           t.manual_importance, t.user_id
    from topics t
    join subjects s on s.id = t.subject_id
    where t.user_id = p_user_id
  ),
  exam_links as (
    select
      ut.topic_id,
      e.id as exam_id,
      e.name as exam_name,
      e.exam_date,
      coalesce(et.weight, es.weight) as weight
    from user_topics ut
    join exams e on e.user_id = ut.user_id and e.exam_date >= current_date
    left join exam_topics et on et.exam_id = e.id and et.topic_id = ut.topic_id
    left join exam_subjects es on es.exam_id = e.id and es.subject_id = ut.subject_id
    where et.id is not null or es.id is not null
  ),
  exam_agg as (
    select
      topic_id,
      sum(weight) as exam_weight_component,
      (array_agg(exam_id order by exam_date asc))[1] as nearest_exam_id,
      (array_agg(exam_name order by exam_date asc))[1] as nearest_exam_name,
      (array_agg(exam_date order by exam_date asc))[1] as nearest_exam_date
    from exam_links
    group by topic_id
  )
  select
    ut.topic_id,
    ut.topic_name,
    ut.subject_id,
    ut.subject_name,
    ut.manual_importance,
    coalesce(ea.exam_weight_component, 0) as exam_weight_component,
    ut.manual_importance + coalesce(ea.exam_weight_component, 0) as importance,
    coalesce(tr.estimated_retention, 0) as estimated_retention,
    1 - coalesce(tr.estimated_retention, 0) as forgetting,
    ea.nearest_exam_id,
    ea.nearest_exam_name,
    (ea.nearest_exam_date - current_date) as days_to_nearest_exam,
    case
      when ea.nearest_exam_date is null then 1
      else 1 + p_urgency_boost * exp(- (ea.nearest_exam_date - current_date)::numeric / p_urgency_k)
    end as urgency,
    (ut.manual_importance + coalesce(ea.exam_weight_component, 0))
      * (1 - coalesce(tr.estimated_retention, 0))
      * case
          when ea.nearest_exam_date is null then 1
          else 1 + p_urgency_boost * exp(- (ea.nearest_exam_date - current_date)::numeric / p_urgency_k)
        end as priority
  from user_topics ut
  left join exam_agg ea on ea.topic_id = ut.topic_id
  left join topic_retention tr on tr.topic_id = ut.topic_id
  order by priority desc;
$$;
