-- Fix function search_path security warnings
-- This prevents search path injection attacks by explicitly setting search_path

ALTER FUNCTION public.get_writing_stats_summary SET search_path = public;
ALTER FUNCTION public.match_canon_entities SET search_path = public;
ALTER FUNCTION public.has_story_access SET search_path = public;
ALTER FUNCTION public.update_collaborator_updated_at SET search_path = public;
ALTER FUNCTION public.get_story_comment_count SET search_path = public;
ALTER FUNCTION public.get_story_role SET search_path = public;
ALTER FUNCTION public.update_comment_timestamp SET search_path = public;
ALTER FUNCTION public.update_template_updated_at SET search_path = public;
ALTER FUNCTION public.reorder_chapters_after_delete SET search_path = public;
ALTER FUNCTION public.increment_template_use_count SET search_path = public;
ALTER FUNCTION public.get_next_revision_number SET search_path = public;
ALTER FUNCTION public.set_revision_number SET search_path = public;
ALTER FUNCTION public.update_updated_at_column SET search_path = public;
ALTER FUNCTION public.update_daily_stats_timestamp SET search_path = public;
ALTER FUNCTION public.is_admin_check SET search_path = public;
ALTER FUNCTION public.update_writing_streak SET search_path = public;
ALTER FUNCTION public.check_achievements SET search_path = public;
ALTER FUNCTION public.handle_new_user SET search_path = public;

-- NOTE: Not addressed (would affect functionality):
-- - extension_in_public: Moving vector extension could break pgvector queries
-- - auth_leaked_password_protection: Enable via Supabase Dashboard > Authentication > Settings
