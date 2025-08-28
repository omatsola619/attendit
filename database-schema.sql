-- Database Schema for Personal Poster Forge
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT NOT NULL,
  banner_width INTEGER NOT NULL,
  banner_height INTEGER NOT NULL,
  placeholder_x INTEGER NOT NULL,
  placeholder_y INTEGER NOT NULL,
  placeholder_width INTEGER NOT NULL,
  placeholder_height INTEGER NOT NULL,
  placeholder_shape TEXT DEFAULT 'rectangle' CHECK (placeholder_shape IN ('rectangle', 'circle')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create campaign_participants table to track who participated
CREATE TABLE IF NOT EXISTS campaign_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  photo_url TEXT,
  photo_position_x INTEGER,
  photo_position_y INTEGER,
  photo_scale DECIMAL(3,2) DEFAULT 1.0,
  photo_rotation INTEGER DEFAULT 0,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_share_token ON campaigns(share_token);
CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign_id ON campaign_participants(campaign_id);

-- Enable Row Level Security on campaigns table
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns table
CREATE POLICY "Users can view their own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" ON campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Public campaigns can be viewed by anyone (for attendee pages)
CREATE POLICY "Public campaigns can be viewed by anyone" ON campaigns
  FOR SELECT USING (status = 'active');

-- Create policies for campaign_participants table
CREATE POLICY "Anyone can view participants for public campaigns" ON campaign_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_participants.campaign_id 
      AND campaigns.status = 'active'
    )
  );

CREATE POLICY "Anyone can insert participants for public campaigns" ON campaign_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_participants.campaign_id 
      AND campaigns.status = 'active'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TRIGGER AS $$
BEGIN
  NEW.share_token = gen_random_uuid()::text;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically generate share token
CREATE TRIGGER generate_campaign_share_token 
  BEFORE INSERT ON campaigns 
  FOR EACH ROW EXECUTE FUNCTION generate_share_token();

-- Create storage bucket for campaign banners
-- Note: This needs to be run in the Supabase dashboard under Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-banners', 'campaign-banners', true);

-- Create storage policies for campaign banners
-- CREATE POLICY "Public campaign banners can be viewed by anyone" ON storage.objects
--   FOR SELECT USING (bucket_id = 'campaign-banners');

-- CREATE POLICY "Authenticated users can upload campaign banners" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'campaign-banners' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can update their own campaign banners" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'campaign-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own campaign banners" ON storage.objects
--   FOR DELETE USING (bucket_id = 'campaign-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
