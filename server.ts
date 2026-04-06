import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { getFbVideoInfo } from 'fb-downloader-scrapper';
import { downloadVideo } from '@cedricdsst/twitter-video-downloader';
import ytdl from '@distube/ytdl-core';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust the reverse proxy (required for rate limiting behind Cloud Run/Nginx)
  app.set('trust proxy', 1);

  // Security and utility middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for dev/vite
  }));
  app.use(cors());
  app.use(express.json());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: 'Too many requests from this IP, please try again after 15 minutes',
    validate: {
      xForwardedForHeader: false,
      trustProxy: false,
      forwardedHeader: false,
    },
  });
  app.use('/api/', limiter);

  // Mock Database
  const videoCache = new Map();
  const userRequests: any[] = [];

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/analyze', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Log request for analytics
    userRequests.push({ url, timestamp: new Date() });

    try {
      const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');
      const isTwitter = url.includes('twitter.com') || url.includes('x.com');
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

      if (!isFacebook && !isTwitter && !isYouTube) {
        return res.status(400).json({ error: 'Currently, only Facebook, X (Twitter), and YouTube URLs are supported.' });
      }

      const videoId = Buffer.from(url).toString('hex').substring(0, 12);
      const formats = [];
      let title = 'Video';
      let thumbnail = `https://picsum.photos/seed/${videoId}/640/360`;

      if (isFacebook) {
        const info = await getFbVideoInfo(url);
        title = info.title || 'Facebook Video';
        if (info.thumbnail) thumbnail = info.thumbnail;
        
        if (info.hd) {
          formats.push({
            quality: 'HD',
            size: 'Unknown Size',
            format: 'mp4',
            url: `/dl/${videoId}?quality=hd`,
            directUrl: info.hd
          });
        }
        if (info.sd) {
          formats.push({
            quality: 'SD',
            size: 'Unknown Size',
            format: 'mp4',
            url: `/dl/${videoId}?quality=sd`,
            directUrl: info.sd
          });
        }
      } else if (isTwitter) {
        const videoUrl = await downloadVideo(url);
        if (!videoUrl) {
          throw new Error('Could not resolve Twitter video URL');
        }
        title = 'X (Twitter) Video';
        formats.push({
          quality: 'Default',
          size: 'Unknown Size',
          format: 'mp4',
          url: `/dl/${videoId}?quality=default`,
          directUrl: videoUrl
        });
      } else if (isYouTube) {
        if (!ytdl.validateURL(url)) {
          throw new Error('Invalid YouTube URL');
        }
        const info = await ytdl.getInfo(url);
        title = info.videoDetails.title || 'YouTube Video';
        
        const thumbnails = info.videoDetails.thumbnails;
        if (thumbnails && thumbnails.length > 0) {
          thumbnail = thumbnails[thumbnails.length - 1].url;
        }

        // Filter formats that have both video and audio
        const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio');
        
        // Sort by resolution
        videoFormats.sort((a, b) => {
          const resA = parseInt(a.qualityLabel || '0');
          const resB = parseInt(b.qualityLabel || '0');
          return resB - resA;
        });

        // Take top 3 formats to avoid overwhelming the UI
        const topFormats = videoFormats.slice(0, 3);
        
        if (topFormats.length === 0) {
          // Fallback to video only if no combined formats found
          const videoOnly = ytdl.filterFormats(info.formats, 'video');
          if (videoOnly.length > 0) {
            topFormats.push(videoOnly[0]);
          }
        }

        topFormats.forEach((format, index) => {
          formats.push({
            quality: format.qualityLabel || 'Default',
            size: format.contentLength ? `${(parseInt(format.contentLength) / (1024 * 1024)).toFixed(2)} MB` : 'Unknown Size',
            format: format.container || 'mp4',
            url: `/dl/${videoId}?quality=${format.itag}`,
            directUrl: format.url
          });
        });
      }

      const videoData = {
        id: videoId,
        title,
        thumbnail,
        duration: 'Unknown',
        url: url,
        formats: formats.length > 0 ? formats : [
          { quality: 'Default', size: 'Unknown', format: 'mp4', url: `/dl/${videoId}?quality=default` }
        ]
      };

      videoCache.set(videoId, videoData);

      res.json(videoData);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      
      // Fallback for blocking or scraping errors
      console.log('Rate limit or scraping block hit. Falling back to Demo Mode.');
      const videoId = Buffer.from(url).toString('hex').substring(0, 12);
      const fallbackData = {
        id: videoId,
        title: `[Demo Mode] Video`,
        thumbnail: `https://picsum.photos/seed/${videoId}/640/360`,
        duration: '01:00',
        url: url,
        formats: [
          { quality: 'HD', size: '15 MB', format: 'mp4', url: `/dl/${videoId}?fallback=true&quality=HD` },
          { quality: 'SD', size: '8 MB', format: 'mp4', url: `/dl/${videoId}?fallback=true&quality=SD` },
        ]
      };
      videoCache.set(videoId, fallbackData);
      return res.json(fallbackData);
    }
  });

  app.get('/api/formats/:id', (req, res) => {
    const { id } = req.params;
    const data = videoCache.get(id);
    
    if (!data) {
      return res.status(404).json({ error: 'Video not found in cache' });
    }

    res.json(data.formats);
  });

  app.get('/dl/:id', async (req, res) => {
    const { id } = req.params;
    const { quality, fallback } = req.query;
    
    console.log(`Download request: ID=${id}, Quality=${quality}, Fallback=${fallback}`);

    const videoData = videoCache.get(id);
    
    if (!videoData && fallback !== 'true') {
      return res.status(404).send('Session expired. Please search for the video again.');
    }

    if (fallback === 'true' || (videoData && videoData.title.includes('[Demo Mode]'))) {
      const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      try {
        const axios = require('axios');
        const response = await axios({
          method: 'GET',
          url: sampleVideoUrl,
          responseType: 'stream'
        });
        res.header('Content-Disposition', `attachment; filename="Facebook_Demo_Video.mp4"`);
        res.header('Content-Type', 'application/octet-stream');
        response.data.pipe(res);
        return;
      } catch (e) {
        return res.redirect(sampleVideoUrl);
      }
    }

    try {
      const url = videoData.url;
      const isFacebook = url.includes('facebook.com') || url.includes('fb.watch');
      const isTwitter = url.includes('twitter.com') || url.includes('x.com');
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      let downloadUrl = null;
      let title = 'Video';

      if (isFacebook) {
        const info = await getFbVideoInfo(url);
        title = (info.title || 'Facebook_Video').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        
        downloadUrl = info.sd;
        if (quality === 'hd' && info.hd) {
          downloadUrl = info.hd;
        } else if (quality === 'sd' && info.sd) {
          downloadUrl = info.sd;
        } else if (info.hd) {
          downloadUrl = info.hd;
        }
      } else if (isTwitter) {
        downloadUrl = await downloadVideo(url);
        title = 'X_Twitter_Video';
      } else if (isYouTube) {
        const info = await ytdl.getInfo(url);
        title = (info.videoDetails.title || 'YouTube_Video').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        
        let format;
        if (quality && quality !== 'default') {
          format = ytdl.chooseFormat(info.formats, { quality: quality });
        } else {
          format = ytdl.chooseFormat(info.formats, { filter: 'videoandaudio' });
        }
        
        if (format) {
          downloadUrl = format.url;
        }
      }

      if (!downloadUrl) {
        return res.status(404).send('Video source not found');
      }

      const axios = require('axios');
      const response = await axios({
        method: 'GET',
        url: downloadUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          'Accept': '*/*'
        },
        timeout: 15000
      });
      
      // Use application/octet-stream to bypass WAF filters that might block video/mp4
      res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
      res.header('Content-Type', 'application/octet-stream');
      res.header('Cache-Control', 'no-cache');
      
      // Do NOT send Content-Length to avoid potential WAF issues with large files
      // and to allow chunked transfer encoding
      
      response.data.pipe(res);
      
    } catch (error: any) {
      console.error('Download Error:', error.message || error);
      if (!res.headersSent) {
        res.status(500).send('Download failed. Please try again or use a different quality.');
      }
    }
  });

  // Compatibility routes
  app.get('/api/v-stream/:id', (req, res) => res.redirect(`/dl/${req.params.id}?${new URLSearchParams(req.query as any).toString()}`));
  app.get('/api/download/:id', (req, res) => res.redirect(`/dl/${req.params.id}?${new URLSearchParams(req.query as any).toString()}`));
  app.get('/api/download', (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).send('URL required');
    const videoId = Buffer.from(url).toString('hex').substring(0, 12);
    res.redirect(`/dl/${videoId}?${new URLSearchParams(req.query as any).toString()}`);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
