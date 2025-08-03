-- Supabase Books Table Setup for TEKNE Transformation Journal
-- Run this in your Supabase SQL editor

-- Create books table
CREATE TABLE IF NOT EXISTS books (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('business_financial', 'spiritual_development', 'personal_development', 'diverse_learning')),
  priority TEXT NOT NULL CHECK (priority IN ('essential', 'high', 'medium', 'low')),
  status TEXT NOT NULL CHECK (status IN ('to_read', 'reading', 'completed')),
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own books
CREATE POLICY "Users can view their own books" ON books
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own books
CREATE POLICY "Users can insert their own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own books
CREATE POLICY "Users can update their own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own books
CREATE POLICY "Users can delete their own books" ON books
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_books_updated_at 
  BEFORE UPDATE ON books 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
SELECT 
  COUNT(*) as total_books,
  COUNT(DISTINCT user_id) as unique_users
FROM books; 