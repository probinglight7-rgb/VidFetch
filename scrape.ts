import axios from 'axios';
import * as cheerio from 'cheerio';

async function getTwitterVideoFormats(url: string) {
  try {
    const res = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      }
    });
    const $ = cheerio.load(res.data);
    const formats: any[] = [];
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
    return formats;
  } catch (e) {
    console.error('Twitsave scrape error:', e);
    return [];
  }
}

getTwitterVideoFormats('https://twitter.com/mattpocockuk/status/1592130978234900484').then(console.log);
