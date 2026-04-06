import axios from 'axios';
import * as cheerio from 'cheerio';

async function getTwitterVideo(url) {
  try {
    const res = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`);
    const $ = cheerio.load(res.data);
    const formats = [];
    $('.origin-top-right a').each((i, el) => {
      const downloadUrl = $(el).attr('href');
      const text = $(el).text().trim();
      if (downloadUrl) {
        formats.push({ url: downloadUrl, text });
      }
    });
    console.log(formats);
  } catch (e) {
    console.error(e.message);
  }
}

getTwitterVideo('https://twitter.com/mattpocockuk/status/1592130978234900484');
