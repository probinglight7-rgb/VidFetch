import { execSync } from 'child_process';
try {
  console.log(execSync('ffmpeg -version').toString());
} catch (e: any) {
  console.error('No native ffmpeg', e.message);
}
