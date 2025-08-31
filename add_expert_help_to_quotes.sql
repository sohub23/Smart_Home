-- Add need_expert_help column to existing quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS need_expert_help BOOLEAN DEFAULT FALSE;