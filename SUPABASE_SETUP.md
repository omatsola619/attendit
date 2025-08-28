# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for your Personal Poster Forge application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js and npm installed on your machine

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "personal-poster-forge")
5. Enter a database password (save this securely)
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root:
   ```bash
   touch .env
   ```

2. Add your Supabase credentials to the `.env` file:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Important**: Add `.env` to your `.gitignore` file to keep your credentials secure

## Step 4: Configure Authentication Settings

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure the following:

   **Site URL**: `http://localhost:5173` (for development)
   
   **Redirect URLs**: 
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/login`
   - `http://localhost:5173/signup`

3. **Email Templates** (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize the confirmation and reset password emails

## Step 5: Enable Email Confirmation (Recommended)

1. In **Authentication** → **Settings**
2. Enable "Enable email confirmations"
3. This ensures users verify their email before accessing the app

## Step 6: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try to sign up with a new account
3. Check your email for the confirmation link
4. Try logging in with the confirmed account

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Make sure your `.env` file exists and has the correct variable names
   - Restart your development server after creating the `.env` file

2. **Authentication not working**
   - Check that your Supabase URL and key are correct
   - Verify your redirect URLs are properly configured
   - Check the browser console for any error messages

3. **Email confirmation not working**
   - Check your Supabase email settings
   - Verify the email template configuration
   - Check spam/junk folders

### Environment Variables

Make sure your `.env` file has these exact variable names:
- `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
- `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)

The `VITE_` prefix is required for Vite to expose these variables to your frontend code.

## Security Notes

- Never commit your `.env` file to version control
- The `anon` key is safe to use in the frontend (it's designed for this purpose)
- For production, update the Site URL and Redirect URLs to your actual domain
- Consider enabling additional security features like 2FA in your Supabase dashboard

## Next Steps

Once authentication is working, you can:
1. Add user profile management
2. Implement role-based access control
3. Add social authentication providers (Google, GitHub, etc.)
4. Set up database policies for user data
5. Add password reset functionality

## Support

If you encounter issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the [Supabase community forum](https://github.com/supabase/supabase/discussions)
3. Check your browser's developer console for error messages
