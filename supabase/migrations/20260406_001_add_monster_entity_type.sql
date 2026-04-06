-- Add 'monster' to the allowed canon entity types.
-- The type column is TEXT. If a CHECK constraint exists, update it to include 'monster'.
-- If no CHECK constraint, TEXT already accepts any value.

DO $$
DECLARE
  cname TEXT;
BEGIN
  -- Find any CHECK constraint on the type column
  SELECT tc.constraint_name INTO cname
  FROM information_schema.constraint_column_usage ccu
  JOIN information_schema.table_constraints tc
    ON tc.constraint_name = ccu.constraint_name
    AND tc.constraint_schema = ccu.constraint_schema
  WHERE ccu.table_name = 'canon_entities'
    AND ccu.column_name = 'type'
    AND tc.constraint_type = 'CHECK'
  LIMIT 1;

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.canon_entities DROP CONSTRAINT %I', cname);
    ALTER TABLE public.canon_entities ADD CONSTRAINT canon_entities_type_check
      CHECK (type = ANY(ARRAY['character', 'location', 'artifact', 'event', 'faction', 'concept', 'creature', 'monster']));
    RAISE NOTICE 'Updated CHECK constraint to include monster';
  ELSE
    RAISE NOTICE 'No CHECK constraint found on type column, monster value already accepted';
  END IF;
END $$;
