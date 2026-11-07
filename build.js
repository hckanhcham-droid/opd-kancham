import fs from 'fs';
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}
fs.copyFileSync('index.html', 'dist/index.html');
console.log('Build successfully published to dist/index.html!');
