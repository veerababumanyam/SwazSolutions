-- Migration: Extend profiles table with modern vCard fields
-- Adds profession, avatar cropping, and SEO fields

-- Add profession field
ALTER TABLE profiles ADD COLUMN profession TEXT;

-- Add avatar cropping fields (for uncropped source and crop settings)
ALTER TABLE profiles ADD COLUMN avatar_source TEXT;
ALTER TABLE profiles ADD COLUMN avatar_crop TEXT;

-- Add SEO fields
ALTER TABLE profiles ADD COLUMN seo_title TEXT;
ALTER TABLE profiles ADD COLUMN seo_description TEXT;
ALTER TABLE profiles ADD COLUMN seo_keywords TEXT;
