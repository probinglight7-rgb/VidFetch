import axios from 'axios';

async function getFileSize(url: string) {
  try {
    const res = await axios.head(url);
    const size = res.headers['content-length'];
    if (size) {
      const bytes = parseInt(size, 10);
      const mb = (bytes / (1024 * 1024)).toFixed(2);
      console.log(`${mb} MB`);
    } else {
      console.log('Unknown size');
    }
  } catch (e: any) {
    console.error(e.message);
  }
}

getFileSize('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
