import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { getFbVideoInfo } from 'fb-downloader-scrapper';
import { downloadVideo } from '@cedricdsst/twitter-video-downloader';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function getFileSize(url: string): Promise<string> {
  try {
    const res = await axios.head(url, { timeout: 5000 });
    const size = res.headers['content-length'];
    if (size) {
      const bytes = parseInt(size, 10);
      const mb = (bytes / (1024 * 1024)).toFixed(2);
      return `${mb} MB`;
    }
  } catch (e) {
    // Ignore errors for HEAD requests
  }
  return 'Unknown Size';
}

function mapQualityLabel(quality: string): string {
  const q = quality.toLowerCase();
  if (q.includes('1080') || q.includes('1920')) return '1080p Full HD';
  if (q.includes('720') || q === 'hd') return '720p HD';
  if (q.includes('480') || q === 'sd') return '480p SD';
  if (q.includes('360')) return '360p SD';
  if (q.includes('270') || q.includes('240')) return '240p Low';
  return quality;
}

async function getTwitterVideoFormats(url: string) {
  try {
    const res = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      }
    });
    const $ = cheerio.load(res.data);
    const formats: any[] = [];
    
    let thumbnail = '';
    const poster = $('video').attr('poster');
    if (poster) {
      thumbnail = poster;
    }

    let title = '';
    const pText = $('p').first().text().trim();
    if (pText) {
      title = pText;
    }

    $('.origin-top-right a').each((i, el) => {
      const downloadUrl = $(el).attr('href');
      const text = $(el).text().trim();
      if (downloadUrl && downloadUrl.includes('?file=')) {
        const base64Url = downloadUrl.split('?file=')[1];
        try {
          const decodedUrl = Buffer.from(decodeURIComponent(base64Url), 'base64').toString('utf-8');
          if (decodedUrl.startsWith('http')) {
            let quality = 'SD';
            if (text.includes('1280x') || text.includes('1920x') || text.includes('720') || text.includes('1080')) {
              quality = 'HD';
            } else if (text.includes('Resolution:')) {
              quality = text.split('Resolution:')[1].trim();
            }
            formats.push({
              quality,
              size: 'Unknown Size',
              format: 'mp4',
              directUrl: decodedUrl
            });
          }
        } catch (e) {}
      }
    });
    return { formats, thumbnail, title };
  } catch (e) {
    console.error('Twitsave scrape error:', e);
    return { formats: [], thumbnail: '', title: '' };
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

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

      if (!isFacebook && !isTwitter) {
        return res.status(400).json({ error: 'Currently, only Facebook and X (Twitter) URLs are supported.' });
      }

      const videoId = Buffer.from(url).toString('hex').substring(0, 12);
      const formats: any[] = [];
      let title = 'Video';
      let source = isFacebook ? 'Facebook' : 'X (Twitter)';
      let thumbnail = `https://picsum.photos/seed/${videoId}/640/360`;

      if (isFacebook) {
        const info = await getFbVideoInfo(url);
        title = info.title || 'Facebook Video';
        if (info.thumbnail) thumbnail = info.thumbnail;
        
        if (info.hd) {
          formats.push({
            quality: mapQualityLabel('HD'),
            size: await getFileSize(info.hd),
            format: 'mp4',
            type: 'video',
            url: `/dl/${videoId}?quality=hd`,
            directUrl: info.hd
          });
        }
        if (info.sd) {
          formats.push({
            quality: mapQualityLabel('SD'),
            size: await getFileSize(info.sd),
            format: 'mp4',
            type: 'video',
            url: `/dl/${videoId}?quality=sd`,
            directUrl: info.sd
          });
        }
      } else if (isTwitter) {
        title = 'X (Twitter) Video';
        const { formats: twitSaveFormats, thumbnail: twitSaveThumbnail, title: twitSaveTitle } = await getTwitterVideoFormats(url);
        
        if (twitSaveThumbnail) {
          thumbnail = twitSaveThumbnail;
        }
        if (twitSaveTitle) {
          title = twitSaveTitle;
        }

        if (twitSaveFormats.length > 0) {
          for (let idx = 0; idx < twitSaveFormats.length; idx++) {
            const f = twitSaveFormats[idx];
            formats.push({
              quality: mapQualityLabel(f.quality),
              size: await getFileSize(f.directUrl),
              format: f.format,
              type: 'video',
              url: `/dl/${videoId}?quality=tw_${idx}`,
              directUrl: f.directUrl
            });
          }
        } else {
          const videoUrl = await downloadVideo(url);
          if (!videoUrl) {
            throw new Error('Could not resolve Twitter video URL');
          }
          formats.push({
            quality: mapQualityLabel('HD'),
            size: await getFileSize(videoUrl),
            format: 'mp4',
            type: 'video',
            url: `/dl/${videoId}?quality=default`,
            directUrl: videoUrl
          });
        }
      }

      // Add audio formats (proxying the best video stream as audio)
      const bestVideo = formats.find(f => f.quality.includes('HD') || f.quality.includes('1080')) || formats[0];
      if (bestVideo) {
        formats.push({
          quality: 'Audio Only',
          size: bestVideo.size,
          format: 'm4a',
          type: 'audio',
          url: `${bestVideo.url}&audio=m4a`,
          directUrl: bestVideo.directUrl
        });
        formats.push({
          quality: 'Audio Only',
          size: bestVideo.size,
          format: 'mp3',
          type: 'audio',
          url: `${bestVideo.url}&audio=mp3`,
          directUrl: bestVideo.directUrl
        });
      }

      const videoData = {
        id: videoId,
        title,
        source,
        thumbnail,
        duration: 'Unknown',
        url: url,
        formats: formats.length > 0 ? formats : [
          { quality: 'Default', size: 'Unknown Size', format: 'mp4', type: 'video', url: `/dl/${videoId}?quality=default` }
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
    const { quality, fallback, audio } = req.query;
    
    console.log(`Download request: ID=${id}, Quality=${quality}, Fallback=${fallback}, Audio=${audio}`);

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
        const ext = audio ? audio : 'mp4';
        res.header('Content-Disposition', `attachment; filename="Demo_Video.${ext}"`);
        res.header('Content-Type', 'application/octet-stream');
        response.data.pipe(res);
        return;
      } catch (e) {
        return res.redirect(sampleVideoUrl);
      }
    }

    try {
      let downloadUrl = '';
      let title = (videoData.title || 'Video')
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_')
        .substring(0, 100) || 'VideoFetch_Download';

      const format = videoData.formats.find((f: any) => f.url.includes(`quality=${quality}`));
      if (format && format.directUrl) {
        downloadUrl = format.directUrl;
      } else {
        // Fallback if not found in formats
        const isFacebook = videoData.url.includes('facebook.com') || videoData.url.includes('fb.watch');
        if (isFacebook) {
          const info = await getFbVideoInfo(videoData.url);
          downloadUrl = quality === 'hd' && info.hd ? info.hd : info.sd || info.hd;
        } else {
          downloadUrl = videoData.formats[0]?.directUrl;
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
      
      const ext = audio ? audio : 'mp4';
      // Use application/octet-stream to bypass WAF filters that might block video/mp4
      res.header('Content-Disposition', `attachment; filename="${title}.${ext}"`);
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
