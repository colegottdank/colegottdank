# How to Get Brain Rot Videos

## The Secret: YouTube Channels

People don't find these on Pixabay. They download from **YouTube channels** that post "No Copyright Gameplay."

### Best YouTube Channels:

1. **"Subway Surfers" Official Channel** 
   - Posts FREE gameplay marked "FREE TO USE - NO COPYRIGHT"
   - Search: `site:youtube.com "subway surfers" "free to use" "no copyright"`

2. **"No Copyright Gameplay"** (various channels)
   - Channels literally named "No Copyright Gameplay"
   - Just search that phrase on YouTube

3. **"Background Gameplay"**
   - Family Guy clips, Minecraft parkour
   - All marked Creative Commons

4. **"Queen Games"**
   - High quality Subway Surfers

---

## How to Download

### Option 1: yt-dlp (Command Line)

```bash
# Install
pip install yt-dlp

# Download a video
python3 -m yt_dlp -f "best[height<=720]" \
  "https://www.youtube.com/watch?v=QPW3XwBoQlw" \
  -o "subway-surfers.mp4"
```

### Option 2: Online Downloaders

1. **y2mate.is** or **yt1s.com**
   - Paste YouTube URL
   - Download 720p MP4

2. **SaveFrom.net**
   - Add "ss" before youtube.com
   - Example: `ssyoutube.com/watch?v=...`

### Option 3: Screen Record Your Phone

1. Download Subway Surfers app
2. Screen record yourself playing
3. Crop to 9:16 (vertical)
4. Done - you own it completely

---

## What to Search on YouTube

**Exact search phrases that work:**
- `"subway surfers gameplay" "no copyright"`
- `"minecraft parkour" "free to use"`
- `"family guy funny moments" "creative commons"`
- `"background gameplay" "copyright free"`
- `"skibidi toilet" "gameplay"` (yeah...)

---

## You Already Have One!

I downloaded a real Subway Surfers video for you:
- File: `/public/videos/subway-surfers.mp4` (17MB)
- It's playing in your portfolio right now

---

## Quick Fix: Use GIFs Instead

If videos are too annoying, use GIFs from:
- **Giphy.com** - Search "subway surfers"
- **Tenor.com** - Search "gameplay"

Convert GIF to MP4:
```bash
ffmpeg -i gameplay.gif gameplay.mp4
```

---

## TL;DR

**Pixabay won't have these.** 

YouTube channels dedicated to "No Copyright Gameplay" are the source. Download with yt-dlp or online downloaders.

Or just **screen record Subway Surfers on your phone** - easiest and you know it's legit.
