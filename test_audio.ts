import ffmpeg from 'fluent-ffmpeg';

const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

ffmpeg(videoUrl)
  .toFormat('mp3')
  .on('end', () => console.log('Finished processing'))
  .on('error', (err) => console.error('Error:', err))
  .save('./output.mp3');
