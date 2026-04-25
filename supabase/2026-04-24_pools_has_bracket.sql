-- =============================================================================
-- 2026-04-24 — Pools: add `has_bracket` flag
-- -----------------------------------------------------------------------------
-- Adds the optional NHL Playoff Bracket module flag to pools. When true, pool
-- members will be prompted to predict the 15-series bracket (winner + games)
-- in addition to drafting a roster, and bracket bonus points feed the
-- standings alongside roster fantasy points.
--
-- Safe to run multiple times — guarded by IF NOT EXISTS.
-- =============================================================================

ALTER TABLE public.pools
  ADD COLUMN IF NOT EXISTS has_bracket boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.pools.has_bracket IS
  'When true, pool members predict the 15-series NHL playoff bracket for bonus points on top of roster fantasy points.';

-- Backfill existing rows (no-op if already false from DEFAULT, kept for clarity).
UPDATE public.pools SET has_bracket = false WHERE has_bracket IS NULL;
