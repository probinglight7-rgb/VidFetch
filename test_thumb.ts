import axios from 'axios';
import * as cheerio from 'cheerio';

async function testScrape() {
  const url = 'https://twitter.com/mattpocockuk/status/1592130978234900484';
  const res = await axios.get(`https://twitsave.com/info?url=${encodeURIComponent(url)}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    }
  });
  const $ = cheerio.load(res.data);
  const images = [];
  $('img').each((i, el) => {
    images.push($(el).attr('src'));
  });
  console.log(images);
}
testScrape();
