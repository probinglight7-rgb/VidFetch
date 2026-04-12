import axios from 'axios';

async function testCobalt() {
  try {
    const res = await axios.post('https://api.cobalt.tools/api/json', {
      url: 'https://twitter.com/mattpocockuk/status/1592130978234900484',
      isAudioOnly: true
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    console.log(res.data);
  } catch (e: any) {
    console.error(e.response?.data || e.message);
  }
}
testCobalt();
