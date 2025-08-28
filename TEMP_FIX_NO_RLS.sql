-- TEMPORARY FIX: Disable RLS temporarily to test if the issue is with policies
-- ⚠️ WARNING: This makes the tables public! Only use for testing!

-- Disable RLS temporarily (ONLY FOR TESTING)
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_participants DISABLE ROW LEVEL SECURITY;

-- Test campaign creation now
-- If it works, the issue was with RLS policies
-- If it still fails, the issue is with authentication or app code

-- REMEMBER TO RE-ENABLE RLS AFTER TESTING:
-- ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE campaign_participants ENABLE ROW LEVEL SECURITY;
