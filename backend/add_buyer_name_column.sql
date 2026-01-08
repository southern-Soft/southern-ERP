-- Migration: Add buyer_name column to sample_primary_info table
-- Run this SQL script directly in the merchandiser database if the migration script doesn't work

-- Check if column exists and add it if it doesn't
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'sample_primary_info' 
        AND column_name = 'buyer_name'
    ) THEN
        ALTER TABLE sample_primary_info 
        ADD COLUMN buyer_name VARCHAR;
        
        RAISE NOTICE 'Column buyer_name added successfully';
    ELSE
        RAISE NOTICE 'Column buyer_name already exists';
    END IF;
END $$;

