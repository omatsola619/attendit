# Personal Poster Forge

A collaborative poster creation platform that allows event organizers to create campaigns with photo placeholders, enabling attendees to create personalized posters by adding their photos.

## 🎯 What is Personal Poster Forge?

Personal Poster Forge is a web application that solves the common problem of creating personalized event posters. Here's how it works:

1. **Event Organizers** create campaigns by uploading banner designs and setting photo placeholder positions
2. **Attendees** visit campaign links, upload their photos, and position them in designated areas
3. **Everyone** can download personalized posters ready for social media sharing

Perfect for:
- Team events and company gatherings
- Conferences and workshops
- Sports teams and clubs
- Community events and celebrations
- Personal branding and social media

## ✨ Features

- **Drag & Drop Interface**: Easy photo positioning and resizing
- **Real-time Preview**: See exactly how your poster will look
- **Mobile Responsive**: Works perfectly on all devices
- **High-Quality Downloads**: Print-ready poster exports
- **Campaign Analytics**: Track views, downloads, and engagement
- **User Authentication**: Secure user accounts and campaign management
- **Smart Image Handling**: Automatic dimension detection and placeholder positioning
- **Shape Options**: Choose between rectangular or circular photo placeholders
- **Interactive Controls**: Drag to position, numeric inputs for precision

## 🚀 Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account for authentication and storage

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd personal-poster-forge

# Step 3: Install dependencies
npm install

# Step 4: Set up Supabase authentication
# Follow the setup guide in SUPABASE_SETUP.md

# Step 5: Set up database schema
# Run the SQL commands in database-schema.sql in your Supabase SQL Editor

# Step 6: Set up storage buckets
# Follow the setup guide in STORAGE_SETUP.md

# Step 7: Start the development server
npm run dev
```

### Setup Steps

1. **Authentication Setup**: Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to configure user authentication
2. **Database Setup**: Run the SQL schema in [database-schema.sql](./database-schema.sql) in your Supabase SQL Editor
3. **Storage Setup**: Follow [STORAGE_SETUP.md](./STORAGE_SETUP.md) to configure file storage for campaign banners
4. **Environment Variables**: Create a `.env` file with your Supabase credentials

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL with Row Level Security
- **Storage**: Supabase Storage for campaign banners
- **State Management**: React Query for data fetching
- **Routing**: React Router for navigation
- **Form Handling**: React Hook Form with Zod validation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ProtectedRoute.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx # Authentication context
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
│   ├── supabase.ts     # Supabase client setup
│   └── campaigns.ts    # Campaign service functions
├── pages/               # Application pages
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard and campaign management
│   └── Index.tsx       # Landing page
└── App.tsx             # Main application component
```

## 🗄️ Database Schema

The application uses two main tables:

- **`campaigns`**: Stores campaign information, banner URLs, and placeholder settings
- **`campaign_participants`**: Tracks user participation and photo uploads

Key features:
- Row Level Security (RLS) for data isolation
- Automatic timestamp management
- Unique share tokens for public access
- Support for different placeholder shapes (rectangle/circle)

## 🔐 Authentication & Security

- **Protected Routes**: Dashboard and campaign management require authentication
- **User Sessions**: Persistent login state with automatic session management
- **Route Guards**: Unauthenticated users are redirected to login
- **Secure API**: All authenticated requests use Supabase's secure client
- **Row Level Security**: Database-level security policies
- **File Access Control**: Users can only modify their own campaign files

## 🎨 Campaign Creation Features

### For Campaign Creators
- **Smart Image Upload**: Automatic dimension detection
- **Interactive Preview**: Real-time placeholder positioning
- **Shape Options**: Rectangle or circular photo areas
- **Precise Controls**: Numeric inputs for exact positioning
- **Drag & Drop**: Intuitive placeholder movement
- **Auto-centering**: Smart initial placeholder placement

### For Attendees
- **Easy Photo Upload**: Simple file selection
- **Interactive Positioning**: Drag photos to exact locations
- **Photo Adjustments**: Scale, rotate, and fine-tune
- **Instant Preview**: See changes in real-time
- **Download Ready**: High-quality poster exports

## 🚀 Deployment

### Development
```sh
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Production
1. Build the application: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Update Supabase redirect URLs to your production domain
4. Ensure storage bucket policies are correctly configured

## 📊 Monitoring & Analytics

- **Campaign Views**: Track how many people visit campaign pages
- **Download Counts**: Monitor poster generation activity
- **User Participation**: See who's creating personalized posters
- **Storage Usage**: Monitor file uploads and storage consumption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter issues:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review the setup guides:
   - [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for authentication
   - [STORAGE_SETUP.md](./STORAGE_SETUP.md) for file storage
   - [database-schema.sql](./database-schema.sql) for database setup
3. Check your browser's developer console for error messages
4. Verify your environment variables and Supabase configuration

## 🚨 Quick Troubleshooting

### Getting "400 Bad Request" when creating campaigns?
**This means your storage bucket isn't set up yet!** 
Follow the [QUICK_STORAGE_SETUP.md](./QUICK_STORAGE_SETUP.md) guide to fix this in 2 minutes.

### Common Issues & Solutions

- **"Missing Supabase environment variables"**: Check your `.env` file has the correct variable names
- **"400 Bad Request" on image upload**: Storage bucket `campaign-banners` doesn't exist - follow the quick setup guide
- **"Policy violation" errors**: Storage policies aren't configured correctly
- **Authentication not working**: Check redirect URLs in Supabase Auth settings

## 🔄 Recent Updates

- ✅ **Complete Authentication System**: Supabase-based user management
- ✅ **Campaign Creation**: Full CRUD operations with image uploads
- ✅ **Smart Image Handling**: Automatic dimension detection and scaling
- ✅ **Interactive Placeholders**: Drag & drop positioning with shape options
- ✅ **Database Integration**: PostgreSQL with Row Level Security
- ✅ **File Storage**: Supabase Storage for campaign banners
- ✅ **Route Protection**: Secure access to dashboard features

---

**Built with ❤️ using modern web technologies**
