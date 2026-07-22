-- =========================================================================
-- Ícone da matéria: glifo escolhido manualmente uma vez por matéria (não por
-- tópico), usado no redesign visual iOS nativo. Chave estável referenciando
-- um ícone lucide-react no frontend (ex.: 'stethoscope', 'brain').
-- =========================================================================

alter table subjects
  add column icon text not null default 'stethoscope';
