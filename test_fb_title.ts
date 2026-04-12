import axios from 'axios';
import * as cheerio from 'cheerio';

export async function getFacebookTitle(url: string): Promise<string> {
  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 5000
    });
    const $ = cheerio.load(res.data);
    let title = $('meta[property="og:description"]').attr('content') || 
                $('meta[name="description"]').attr('content') || 
                $('meta[property="og:title"]').attr('content') || 
                $('title').text();
    
    if (title && !title.includes('Discover popular videos') && !title.includes('Facebook')) {
      return title.trim();
    }
    
    // Try to find title in JSON data
    const match = res.data.match(/"text":"(.*?)"/);
    if (match && match[1]) {
        return match[1].replace(/\\u[\dA-F]{4}/gi, (m: string) => String.fromCharCode(parseInt(m.replace(/\\u/g, ''), 16)));
    }
  } catch (e) {
    // Ignore
  }
  return '';
}

async function test() {
    console.log(await getFacebookTitle('https://www.facebook.com/facebook/videos/10153231379946729/'));
}
test();
