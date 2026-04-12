import { getFbVideoInfo } from 'fb-downloader-scrapper';

async function testFb() {
  try {
    const info = await getFbVideoInfo('https://www.facebook.com/watch/?v=10158281352705667');
    console.log(info);
  } catch (e) {
    console.error(e);
  }
}
testFb();
