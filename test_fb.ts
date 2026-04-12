import { getFbVideoInfo } from 'fb-downloader-scrapper';

async function testFb() {
  try {
    const info = await getFbVideoInfo('https://www.facebook.com/facebook/videos/10153231379946729/');
    console.log(info);
  } catch (e) {
    console.error(e);
  }
}
testFb();
