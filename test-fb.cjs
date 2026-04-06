const { getFbVideoInfo } = require('fb-downloader-scrapper');

async function test() {
  try {
    const res = await getFbVideoInfo('https://www.facebook.com/watch/?v=10156046243361729');
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}

test();
