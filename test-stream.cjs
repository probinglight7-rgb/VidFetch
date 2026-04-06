const axios = require('axios');
const { getFbVideoInfo } = require('fb-downloader-scrapper');

async function test() {
  try {
    const info = await getFbVideoInfo('https://www.facebook.com/share/v/1D9LrtzGqz/');
    console.log("Got info, URL:", info.sd);
    
    const response = await axios({
      method: 'GET',
      url: info.sd,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });
    
    console.log("Stream status:", response.status);
    response.data.on('data', chunk => {
      console.log("Got chunk of size:", chunk.length);
      process.exit(0);
    });
  } catch (e) {
    console.error("Error:", e.message);
    if (e.response) console.error("Status:", e.response.status);
  }
}

test();
