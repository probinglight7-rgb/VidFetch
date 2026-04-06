const { getFbVideoInfo } = require('fb-downloader-scrapper');

async function test() {
  try {
    const res = await getFbVideoInfo('https://www.facebook.com/share/v/1D9LrtzGqz/');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
}

test();
