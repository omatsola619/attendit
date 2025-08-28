# 🚨 QUICK FIX: Storage Bucket Setup

**The 400 error you're seeing means the storage bucket `campaign-banners` doesn't exist yet.**

## 🔧 Fix This in 2 Minutes:

### Step 1: Go to Supabase Dashboard
1. Open [supabase.com](https://supabase.com) and sign in
2. Select your project (`xxhxmlounowaczactenx`)
3. Click **Storage** in the left sidebar

### Step 2: Create the Bucket
1. Click **Create a new bucket**
2. Enter these exact details:
   - **Name**: `campaign-banners` (exactly this, no spaces)
   - **Public bucket**: ✅ **CHECK THIS BOX** (very important!)
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `image/*`
3. Click **Create bucket**

### Step 3: Add Storage Policies
1. Click on your new `campaign-banners` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Add these 4 policies:

#### Policy 1: Public Read Access
- **Policy name**: `Public campaign banners can be viewed by anyone`
- **Target roles**: `public`
- **Policy definition**: `SELECT`
- **Using expression**: `bucket_id = 'campaign-banners'`

#### Policy 2: Authenticated Upload
- **Policy name**: `Authenticated users can upload campaign banners`
- **Target roles**: `authenticated`
- **Policy definition**: `INSERT`
- **Using expression**: `bucket_id = 'campaign-banners'`

#### Policy 3: Owner Update
- **Policy name**: `Users can update their own campaign banners`
- **Target roles**: `authenticated`
- **Policy definition**: `UPDATE`
- **Using expression**: `bucket_id = 'campaign-banners' AND auth.uid()::text = (storage.foldername(name))[1]`

#### Policy 4: Owner Delete
- **Policy name**: `Users can delete their own campaign banners`
- **Target roles**: `authenticated`
- **Policy definition**: `DELETE`
- **Using expression**: `bucket_id = 'campaign-banners' AND auth.uid()::text = (storage.foldername(name))[1]`

## ✅ Test It
1. Go back to your app
2. Try creating a campaign again
3. The 400 error should be gone!

## 🆘 Still Having Issues?

If you still get errors after setting up the bucket:

1. **Check bucket name**: Must be exactly `campaign-banners`
2. **Check public setting**: Must be marked as public
3. **Check policies**: All 4 policies must be added
4. **Restart your app**: Sometimes changes take a moment to propagate

## 🔍 What This Fixes

- ✅ **400 Bad Request errors** when uploading images
- ✅ **Campaign creation** will work properly
- ✅ **Image storage** will be functional
- ✅ **Public access** to campaign banners for attendees

---

**After setting this up, you should be able to create campaigns with image uploads!** 🎉
