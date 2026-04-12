import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

const videoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

ffmpeg(videoUrl)
  .noVideo()
  .toFormat('mp4')
  .audioCodec('aac')
  .outputOptions('-movflags frag_keyframe+empty_moov')
  .on('end', () => console.log('Finished processing'))
  .on('error', (err) => console.error('Error:', err))
  .pipe(fs.createWriteStream('./output.m4a'), { end: true });
