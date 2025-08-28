# Supabase Storage Setup Guide

This guide will help you set up Supabase storage for campaign banner images.

## Step 1: Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter the following details:
   - **Name**: `campaign-banners`
   - **Public bucket**: ✅ Check this (so attendees can view campaign banners)
   - **File size limit**: `10MB` (or your preferred limit)
   - **Allowed MIME types**: `image/*` (or specific types like `image/jpeg,image/png,image/gif`)

## Step 2: Configure Storage Policies

After creating the bucket, you need to set up Row Level Security (RLS) policies. Go to **Storage** → **Policies** and add these policies:

### Policy 1: Public Read Access
- **Policy name**: `Public campaign banners can be viewed by anyone`
- **Target roles**: `public`
- **Policy definition**: `SELECT`
- **Using expression**: `bucket_id = 'campaign-banners'`

### Policy 2: Authenticated Upload
- **Policy name**: `Authenticated users can upload campaign banners`
- **Target roles**: `authenticated`
- **Policy definition**: `INSERT`
- **Using expression**: `bucket_id = 'campaign-banners'`

### Policy 3: Owner Update
- **Policy name**: `Users can update their own campaign banners`
- **Target roles**: `authenticated`
- **Policy definition**: `UPDATE`
- **Using expression**: `bucket_id = 'campaign-banners' AND auth.uid()::text = (storage.foldername(name))[1]`

### Policy 4: Owner Delete
- **Policy name**: `Users can delete their own campaign banners`
- **Target roles**: `authenticated`
- **Policy definition**: `DELETE`
- **Using expression**: `bucket_id = 'campaign-banners' AND auth.uid()::text = (storage.foldername(name))[1]`

## Step 3: Alternative: Use SQL to Create Policies

If you prefer to use SQL, you can run this in the SQL Editor:

```sql
-- Create storage bucket (if not already created via UI)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('campaign-banners', 'campaign-banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);

-- Create storage policies
CREATE POLICY "Public campaign banners can be viewed by anyone" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaign-banners');

CREATE POLICY "Authenticated users can upload campaign banners" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'campaign-banners' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own campaign banners" ON storage.objects
  FOR UPDATE USING (bucket_id = 'campaign-banners' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own campaign banners" ON storage.objects
  FOR DELETE USING (bucket_id = 'campaign-banners' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 4: Test Storage Setup

1. Go to **Storage** → **campaign-banners**
2. Try uploading a test image
3. Verify the image is publicly accessible
4. Check that the policies are working correctly

## File Naming Convention

The application uses this naming convention for uploaded files:
- Format: `{campaign-id}-{timestamp}.{extension}`
- Example: `abc123-def456-1703123456789.jpg`

## Security Considerations

- **Public bucket**: Campaign banners are publicly viewable (required for attendees)
- **File size limits**: Set appropriate limits to prevent abuse
- **MIME type restrictions**: Only allow image files
- **User isolation**: Users can only modify their own files
- **Automatic cleanup**: Consider implementing cleanup for deleted campaigns

## Troubleshooting

### Common Issues

1. **"Bucket not found" error**
   - Make sure the bucket name is exactly `campaign-banners`
   - Check that the bucket was created successfully

2. **"Policy violation" error**
   - Verify all storage policies are correctly configured
   - Check that the user is authenticated when uploading

3. **"File too large" error**
   - Increase the file size limit in bucket settings
   - Check the file size limit in your application code

4. **"Access denied" error**
   - Verify the bucket is marked as public
   - Check that the read policy allows public access

### Testing Storage

You can test your storage setup with this simple test:

```javascript
// Test upload (run in browser console on your app)
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('campaign-banners')
  .upload('test-file.jpg', file);

console.log('Upload result:', { data, error });
```

## Next Steps

Once storage is working:
1. Test campaign creation with image uploads
2. Verify images are accessible on attendee pages
3. Test image deletion when campaigns are removed
4. Monitor storage usage and implement cleanup if needed
