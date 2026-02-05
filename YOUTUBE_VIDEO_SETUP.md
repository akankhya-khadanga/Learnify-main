# YouTube Video Integration Setup Guide

## 🎥 Feature Overview

The roadmap system now **automatically searches and displays YouTube video tutorials** for each milestone topic. Videos appear in the milestone detail drawer after the resources section.

## ✨ Features

- 🔍 **Auto-search**: Automatically finds relevant videos based on milestone title + skills
- 📺 **Inline player**: Shows 3 video thumbnails that expand to embedded player on click
- ⚡ **Smart caching**: Caches search results to avoid redundant API calls
- 🎨 **Neobrutalist design**: Matches your existing design system with bold borders and shadows
- 🚨 **Error handling**: Graceful fallback for API errors, quota limits, and network issues
- 📱 **Responsive**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Setup Instructions

### Step 1: Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **YouTube Data API v3**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your API key

### Step 2: Configure Environment

1. Create `.env.local` file in project root (if not exists)
2. Add your YouTube API key:

```env
VITE_YOUTUBE_API_KEY=YOUR_API_KEY_HERE
```

3. Restart your dev server:

```bash
npm run dev
```

### Step 3: Test It Out!

1. Navigate to **Roadmaps** page
2. Select any roadmap
3. Click on a milestone
4. Scroll to bottom of drawer → you'll see **"Video Tutorials"** section
5. Click any thumbnail to watch!

## 📊 API Quota Information

**YouTube Data API v3 Free Tier:**
- 10,000 units per day
- Each search = 100 units
- **≈ 100 searches per day** (plenty for typical use!)

**Our optimizations:**
- ✅ Results cached in memory
- ✅ Only searches when milestone is opened
- ✅ Max 3 videos per search (efficient)

## 🎨 How It Works

### 1. Smart Search Query
Combines milestone title + top 2 skills for better relevance:
```
Example: "Introduction to React" + ["Components", "JSX"]
Search: "Introduction to React Components JSX tutorial"
```

### 2. User Flow
```
1. User clicks milestone → Drawer opens
2. Hook searches YouTube (or loads from cache)
3. Shows 3 video thumbnails
4. User clicks thumbnail → Expands to embedded player
5. User can switch videos or collapse player
```

### 3. Component Architecture

```
Roadmap.tsx
  └─ Sheet (Milestone Drawer)
      └─ TopicVideoPlayer
          └─ useYouTubeSearch hook
```

## 🛠️ Technical Details

### Files Created

| File | Purpose |
|------|---------|
| `src/hooks/useYouTubeSearch.ts` | Custom hook for YouTube API integration |
| `src/components/roadmaps/TopicVideoPlayer.tsx` | Video player UI component |

### Files Modified

| File | Changes |
|------|---------|
| `src/pages/Roadmap.tsx` | Added `TopicVideoPlayer` to milestone drawer |
| `.env.example` | Updated YouTube API documentation |

## 🐛 Troubleshooting

### Videos not loading?

**Check:**
1. ✅ API key is correctly set in `.env.local`
2. ✅ YouTube Data API v3 is enabled in Google Cloud Console
3. ✅ Dev server was restarted after adding API key
4. ✅ Open browser console for error messages

### "API quota exceeded" error?

- You've hit the daily limit (10,000 units)
- Cached searches won't count against quota
- Wait 24 hours or upgrade to paid tier

### No videos found?

- Topic might be too specific or niche
- Try a different milestone
- Search query combines title + skills (may need adjustment)

## 🎯 Future Enhancements

Potential improvements for later:
- [ ] User preference: disable auto-search
- [ ] Filter videos by duration, date, or channel
- [ ] Save favorite videos to user profile
- [ ] Playlist creation from milestone videos
- [ ] Video progress tracking

## 📝 Code Example

You can manually trigger search from anywhere:

```tsx
import { useYouTubeSearch } from '@/hooks/useYouTubeSearch';

function MyComponent() {
  const { videos, loading, error, search } = useYouTubeSearch();

  useEffect(() => {
    search('React hooks tutorial');
  }, []);

  // videos is an array of YouTubeVideo objects
}
```

---

**Questions? Issues?** Open an issue or check the implementation plan in your artifacts folder!
