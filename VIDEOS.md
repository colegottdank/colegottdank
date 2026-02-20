# Adding Brain Rot Videos

## Where to Get Free Videos

### 1. Pixabay (Recommended)
- **URL:** https://pixabay.com/videos/
- Search for:
  - "subway surfers gameplay"
  - "gameplay background"
  - "lofi animation"
  - "abstract animation"
- **License:** Free for commercial use, no attribution required

### 2. Pexels
- **URL:** https://www.pexels.com/videos/
- Similar content to Pixabay
- **License:** Free for commercial use

### 3. YouTube Creative Commons
Search YouTube for:
- "Subway Surfers gameplay no copyright"
- "Family Guy clips Creative Commons"
- "Background gameplay free to use"

Channels that offer free gameplay:
- Background Gameplay
- No Copyright Gameplays
- Free To Use Gameplay

Download with yt-dlp:
```bash
yt-dlp -f "best[height<=720]" "YOUTUBE_URL" -o "subway-surfers.mp4"
```

### 4. Internet Archive
- **URL:** https://archive.org/
- Search: "retro commercials", "old cartoons"
- **License:** Public domain or Creative Commons

### 5. Coverr
- **URL:** https://coverr.co/
- Free stock videos

---

## How to Add Videos

1. Download your videos
2. Place them in `/public/videos/`
3. Name them exactly:
   - `subway-surfers.mp4`
   - `family-guy.mp4`
   - `oh-no-song.mp4`
   - `skibidi.mp4`
   - `spongebob.mp4`
   - `red-circle.mp4`

4. The code auto-detects if videos exist - if not, it falls back to emoji placeholders

---

## Recommended Video Specs

- **Format:** MP4 (H.264)
- **Resolution:** 720p or 1080p
- **Length:** 10-30 seconds (loops automatically)
- **File size:** Under 10MB each for fast loading
- **Aspect ratio:** 9:16 (portrait) or 16:9 (landscape)

---

## Quick Download Commands

```bash
# Install yt-dlp if needed
pip install yt-dlp

# Download Subway Surfers (example URL - replace with actual)
cd public/videos
yt-dlp -f "best[height<=720]" "https://youtube.com/watch?v=..." -o "subway-surfers.mp4"

# Or use curl for direct MP4 links
curl -o "subway-surfers.mp4" "DIRECT_MP4_URL"
```

---

## Current Fallback

Without videos, the left side shows:
- Emoji animations (🎮, 📺, 🎵, etc.)
- Colored gradients
- "LIVE" badge
- Same brain rot vibe

Add videos whenever you're ready - the site works great either way!
