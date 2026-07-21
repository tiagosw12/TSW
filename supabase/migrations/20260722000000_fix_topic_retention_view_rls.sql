-- The topic_retention view (from 20260721000000_init_schema.sql) was created
-- without security_invoker, so Postgres checked row security against the
-- view owner's privileges instead of the querying user's — confirmed by
-- testing as a non-superuser, non-bypassrls role: the view returned every
-- user's topics, while the underlying tables and get_topic_priorities()
-- correctly filtered to the caller's own rows. security_invoker = on makes
-- the view enforce RLS using the actual caller, matching every other
-- object in this schema.
alter view topic_retention set (security_invoker = on);
