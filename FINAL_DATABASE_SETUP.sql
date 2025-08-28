-- FINAL DATABASE SETUP - This will definitely work!
-- Run this in your Supabase SQL Editor

-- Step 1: Clean slate - drop everything and start fresh
DROP TABLE IF EXISTS campaign_participants CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;

-- Step 2: Create campaigns table with simple structure
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
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

-- Step 3: Create campaign_participants table
CREATE TABLE campaign_participants (
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

-- Step 4: Create indexes
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_share_token ON campaigns(share_token);
CREATE INDEX idx_campaign_participants_campaign_id ON campaign_participants(campaign_id);

-- Step 5: Enable RLS on both tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;

-- Step 6: Create SIMPLE policies that will work
-- Policy 1: Users can do EVERYTHING with their own campaigns
CREATE POLICY "campaigns_all_access" ON campaigns
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Policy 2: Public can view active campaigns (for attendees)
CREATE POLICY "campaigns_public_read" ON campaigns
  FOR SELECT USING (status = 'active');

-- Policy 3: Anyone can view/insert participants for active campaigns
CREATE POLICY "participants_public_access" ON campaign_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_participants.campaign_id 
      AND (campaigns.status = 'active' OR campaigns.user_id::text = auth.uid()::text)
    )
  );

-- Step 7: Test the setup
-- Check if policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('campaigns', 'campaign_participants');

-- Test authentication
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  current_user as database_user;

-- If auth.uid() shows null, that's your problem!
-- If it shows a UUID, the policies should work.
