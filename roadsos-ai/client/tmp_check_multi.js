const https = require('https');
const lat = 18.5204, lon = 73.8567;
const toRad = Math.PI / 180;
const testZooms = [12,13,14,15];
const key = 'yVGLcm4l5C6bAHbKF6O1';
function tileXY(lat, lon, z){
  const n = 2**z;
  const x = Math.floor((lon + 180) / 360 * n);
  const y = Math.floor((1 - Math.log(Math.tan(lat * toRad) + 1 / Math.cos(lat * toRad)) / Math.PI) / 2 * n);
  return {x,y};
}
(async()=>{
  for(const z of testZooms){
    const {x,y} = tileXY(lat,lon,z);
    const url = `https://api.maptiler.com/tiles/satellite/${z}/${x}/${y}.jpg?key=${key}`;
    console.log('\nZoom',z,'URL',url);
    await new Promise((res)=>{
      https.get(url,res2=>{
        console.log('Status',res2.statusCode,'Content-Type',res2.headers['content-type']);
        res2.resume();
        res();
      }).on('error',e=>{console.error('Err',e);res();});
    });
  }
})();
