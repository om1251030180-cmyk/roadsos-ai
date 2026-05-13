const https = require('https');
const lat = 18.5204, lon = 73.8567, z = 14;
const toRad = Math.PI / 180;
const n = 2 ** z;
const x = Math.floor((lon + 180) / 360 * n);
const y = Math.floor((1 - Math.log(Math.tan(lat * toRad) + 1 / Math.cos(lat * toRad)) / Math.PI) / 2 * n);
const key = 'yVGLcm4l5C6bAHbKF6O1';
const url = `https://api.maptiler.com/tiles/satellite/${z}/${x}/${y}.jpg?key=${key}`;
console.log('Tile URL:', url);
https.get(url, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Content-Type:', res.headers['content-type']);
  res.resume();
}).on('error', (e) => console.error('Error:', e));
