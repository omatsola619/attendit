// Quick Storage Setup Script for Supabase
// Run this script to create the storage bucket and policies

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // You'll need to add this to your .env

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure you have:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY (add this to your .env file)')
  console.error('\nTo get the service role key:')
  console.error('1. Go to your Supabase dashboard')
  console.error('2. Settings → API')
  console.error('3. Copy the "service_role" key (not the anon key)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    console.log('🚀 Setting up Supabase storage...')
    
    // Create storage bucket
    console.log('📦 Creating storage bucket...')
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('campaign-banners', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    })
    
    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Storage bucket already exists')
      } else {
        throw bucketError
      }
    } else {
      console.log('✅ Storage bucket created successfully')
    }
    
    console.log('🔒 Setting up storage policies...')
    
    // Note: Storage policies need to be set up manually in the Supabase dashboard
    // because the JavaScript client doesn't support policy creation
    
    console.log('\n📋 Next steps:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to Storage → Policies')
    console.log('3. Add these policies for the "campaign-banners" bucket:')
    console.log('\n   Policy 1: Public Read Access')
    console.log('   - Name: "Public campaign banners can be viewed by anyone"')
    console.log('   - Target roles: public')
    console.log('   - Policy definition: SELECT')
    console.log('   - Using expression: bucket_id = \'campaign-banners\'')
    console.log('\n   Policy 2: Authenticated Upload')
    console.log('   - Name: "Authenticated users can upload campaign banners"')
    console.log('   - Target roles: authenticated')
    console.log('   - Policy definition: INSERT')
    console.log('   - Using expression: bucket_id = \'campaign-banners\'')
    console.log('\n   Policy 3: Owner Update')
    console.log('   - Name: "Users can update their own campaign banners"')
    console.log('   - Target roles: authenticated')
    console.log('   - Policy definition: UPDATE')
    console.log('   - Using expression: bucket_id = \'campaign-banners\' AND auth.uid()::text = (storage.foldername(name))[1]')
    console.log('\n   Policy 4: Owner Delete')
    console.log('   - Name: "Users can delete their own campaign banners"')
    console.log('   - Target roles: authenticated')
    console.log('   - Policy definition: DELETE')
    console.log('   - Using expression: bucket_id = \'campaign-banners\' AND auth.uid()::text = (storage.foldername(name))[1]')
    
    console.log('\n🎉 Storage setup complete!')
    console.log('After adding the policies, you should be able to create campaigns.')
    
  } catch (error) {
    console.error('❌ Error setting up storage:', error.message)
    console.error('\n💡 Alternative: Set up storage manually in the Supabase dashboard')
    console.error('1. Go to Storage → Create bucket')
    console.error('2. Name: campaign-banners')
    console.error('3. Check "Public bucket"')
    console.error('4. Set file size limit to 10MB')
    console.error('5. Add the policies listed above')
  }
}

setupStorage()
