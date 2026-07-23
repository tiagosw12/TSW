-- =========================================================================
-- Ícone explícito por matéria (escolhido no IconPicker), usado por Home,
-- Calendário e pela nova aba Matérias em vez de só adivinhar pelo nome.
-- =========================================================================

alter table subjects add column icon text null;

-- As duas RPCs de prioridade precisam devolver subject_icon para os cards
-- resolverem o ícone real sem uma segunda consulta. Postgres não deixa
-- CREATE OR REPLACE mudar o formato de retorno de uma função de tabela,
-- então precisa dropar e recriar.

drop function if exists get_topic_priorities(uuid, numeric, numeric);

create function get_topic_priorities(
  p_user_id uuid default auth.uid(),
  p_urgency_k numeric default 7,
  p_urgency_boost numeric default 2
) returns table (
  topic_id uuid,
  topic_name text,
  subject_id uuid,
  subject_name text,
  subject_icon text,
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
    select t.id as topic_id, t.name as topic_name, t.subject_id, s.name as subject_name, s.icon as subject_icon,
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
    ut.subject_icon,
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

drop function if exists get_topic_priorities_by_date_range(date, date, uuid, numeric, numeric);

create function get_topic_priorities_by_date_range(
  p_start_date date,
  p_end_date date,
  p_user_id uuid default auth.uid(),
  p_urgency_k numeric default 7,
  p_urgency_boost numeric default 2
) returns table (
  day date,
  day_rank integer,
  topic_id uuid,
  topic_name text,
  subject_id uuid,
  subject_name text,
  subject_icon text,
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
  with days as (
    select generate_series(p_start_date, p_end_date, interval '1 day')::date as day
  ),
  user_topics as (
    select t.id as topic_id, t.name as topic_name, t.subject_id, s.name as subject_name, s.icon as subject_icon,
           t.manual_importance, t.user_id
    from topics t
    join subjects s on s.id = t.subject_id
    where t.user_id = p_user_id
  ),
  exam_links as (
    select
      d.day,
      ut.topic_id,
      e.id as exam_id,
      e.name as exam_name,
      e.exam_date,
      coalesce(et.weight, es.weight) as weight
    from days d
    cross join user_topics ut
    join exams e on e.user_id = ut.user_id and e.exam_date >= d.day
    left join exam_topics et on et.exam_id = e.id and et.topic_id = ut.topic_id
    left join exam_subjects es on es.exam_id = e.id and es.subject_id = ut.subject_id
    where et.id is not null or es.id is not null
  ),
  exam_agg as (
    select
      day,
      topic_id,
      sum(weight) as exam_weight_component,
      (array_agg(exam_id order by exam_date asc))[1] as nearest_exam_id,
      (array_agg(exam_name order by exam_date asc))[1] as nearest_exam_name,
      (array_agg(exam_date order by exam_date asc))[1] as nearest_exam_date
    from exam_links
    group by day, topic_id
  ),
  scored as (
    select
      d.day,
      ut.topic_id,
      ut.topic_name,
      ut.subject_id,
      ut.subject_name,
      ut.subject_icon,
      ut.manual_importance,
      coalesce(ea.exam_weight_component, 0) as exam_weight_component,
      ut.manual_importance + coalesce(ea.exam_weight_component, 0) as importance,
      coalesce(
        exp(
          - (extract(epoch from (d.day::timestamptz - tms.last_reviewed_at)) / 86400) / tms.stability_days
        ),
        0
      ) as estimated_retention,
      ea.nearest_exam_id,
      ea.nearest_exam_name,
      (ea.nearest_exam_date - d.day) as days_to_nearest_exam,
      case
        when ea.nearest_exam_date is null then 1
        else 1 + p_urgency_boost * exp(- (ea.nearest_exam_date - d.day)::numeric / p_urgency_k)
      end as urgency
    from days d
    cross join user_topics ut
    left join topic_memory_state tms on tms.topic_id = ut.topic_id
    left join exam_agg ea on ea.day = d.day and ea.topic_id = ut.topic_id
  ),
  ranked as (
    select
      *,
      importance * (1 - estimated_retention) * urgency as priority,
      row_number() over (
        partition by day
        order by importance * (1 - estimated_retention) * urgency desc, topic_name
      ) as day_rank
    from scored
  )
  select
    day, day_rank, topic_id, topic_name, subject_id, subject_name, subject_icon, manual_importance,
    exam_weight_component, importance, estimated_retention, 1 - estimated_retention as forgetting,
    nearest_exam_id, nearest_exam_name, days_to_nearest_exam, urgency, priority
  from ranked
  where day_rank <= 3
  order by day, day_rank;
$$;
