-- world_cogs was added in 20260522_003_quest_narrative_foundation.sql without
-- explicit GRANTs. RLS is enforced via policies on the table, but PostgREST
-- roles still need table-level GRANTs — in particular `service_role` for the
-- admin client. Without this, server-side admin reads/writes fail with
-- 42501 "permission denied for table world_cogs".
GRANT SELECT ON world_cogs TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON world_cogs TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
