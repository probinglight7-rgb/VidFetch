const axios = require('axios');

async function test() {
  try {
    const { data } = await axios.get('https://www.facebook.com/watch/?v=10156046243361729', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    const hdMatch = data.match(/"hd_src":"([^"]+)"/);
    const sdMatch = data.match(/"sd_src":"([^"]+)"/);
    const titleMatch = data.match(/<title>(.*?)<\/title>/);
    
    console.log({
      hd: hdMatch ? hdMatch[1].replace(/\\/g, '') : null,
      sd: sdMatch ? sdMatch[1].replace(/\\/g, '') : null,
      title: titleMatch ? titleMatch[1] : null
    });
  } catch (e) {
    console.error(e.message);
  }
}

test();
