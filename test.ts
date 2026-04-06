import fetch from 'node-fetch';
fetch('https://api.vxtwitter.com/Twitter/status/1592130978234900484').then(r=>r.json()).then(console.log);
