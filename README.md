# Lamumu Image Gallery

A modern, cloud-powered image gallery built with **Vite**, **JavaScript**, and **Supabase**.

## 🚀 Features

- 🖼️ **Cloud Storage**: Images stored securely in Supabase
- ❤️ **Like System**: Persistent likes stored in database
- ⬆️ **Easy Upload**: Click to upload or drag & drop (5MB limit)
- 🗑️ **Delete Images**: Remove images from gallery
- ⬇️ **Download**: Download images directly
- 📱 **Responsive**: Works on all devices
- 🔒 **Secure**: Environment-based configuration
- ⚡ **Fast**: Powered by Vite for lightning-fast development
- 📦 **Modern**: ES6 modules, npm packages, and modern JavaScript

## 🛠️ Tech Stack

- **Frontend**: Vite + Vanilla JavaScript (ES6 modules)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: CSS3 with Flexbox
- **Build Tool**: Vite
- **Package Manager**: npm

## 🏃‍♂️ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd lamumu-aakam
npm install
```

- ⬇️ **Download**: Download images directly
- 📱 **Responsive**: Works on all devices
- 🔒 **Secure**: Environment-based configuration

## Setup Instructions

### 1. Clone/Download the Project

```bash
git clone <your-repo-url>
cd lamumu-aakam
```

### 2. Supabase Setup

1. Create a [Supabase](https://supabase.com) account and new project
2. Go to SQL Editor and run this schema:

```sql
-- Create images table
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  alt_text TEXT,
  likes INTEGER DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_size INTEGER,
  mime_type TEXT
);

-- Enable Row Level Security
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view images" ON images FOR SELECT USING (true);
CREATE POLICY "Anyone can upload images" ON images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update likes" ON images FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete images" ON images FOR DELETE USING (true);
```

3. Create Storage Bucket:
   - Go to Storage in Supabase Dashboard
   - Create bucket named `photos`
   - Make it **Public** (recommended) or keep Private
   - Set up storage policies if needed

### 3. Environment Configuration

1. Copy the environment template:

```bash
cp .env.example .env
```

2. Edit `.env` file with your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ Important**: Never commit the `.env` file to version control!

### 4. Run the Application

Since this is a frontend-only application, you can run it with any local server:

**Option 1: Python HTTP Server**

```bash
python -m http.server 8000
```

**Option 2: Node.js HTTP Server**

```bash
npx http-server
```

**Option 3: VS Code Live Server Extension**

- Install Live Server extension
- Right-click `index.html` → "Open with Live Server"

### 5. Access Your Gallery

Open your browser and navigate to:

- `http://localhost:8000` (or your server's address)

## Configuration

You can modify settings in `config.js`:

```javascript
const CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB limit
  allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  storageBucket: "photos", // Your Supabase bucket name
};
```

## File Structure

```
lamumu-aakam/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet
├── script.js           # Main JavaScript functionality
├── config.js           # Configuration and Supabase client
├── env-loader.js       # Environment variable loader
├── .env                # Environment variables (not in git)
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Security Notes

- The `.env` file is excluded from git via `.gitignore`
- Only the anon (public) key is used - never expose service role keys
- Consider making your Supabase storage bucket public for better performance
- Row Level Security (RLS) policies control database access

## Deployment

### Deploy to Netlify/Vercel:

1. Push your code to GitHub (without `.env` file)
2. Connect your repository to Netlify/Vercel
3. Add environment variables in your hosting platform:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Static Hosting:

1. Build your project (if needed)
2. Upload files to your hosting provider
3. Configure environment variables on your server
4. Ensure your server can serve the `.env` file (or use build-time env injection)

## Troubleshooting

### Images not loading?

- Check browser console for errors
- Verify Supabase credentials in `.env`
- Ensure storage bucket policies allow public access

### Upload not working?

- Check file size (max 5MB)
- Verify file type is supported
- Check browser console for errors
- Ensure storage bucket exists and has proper policies

### Database errors?

- Verify the `images` table exists
- Check RLS policies are set correctly
- Ensure your Supabase URL and key are correct

## License

MIT License - feel free to use and modify as needed.

## Credits

Developed by [Goodyyy](https://x.com/ciriyeck_goody) for the LAMUMU community.
