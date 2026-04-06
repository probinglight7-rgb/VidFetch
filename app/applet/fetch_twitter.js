fetch('https://api.vxtwitter.com/Twitter/status/1592130978234900484').then(r=>r.json()).then(d => console.log(JSON.stringify(d.media_extended, null, 2)));
