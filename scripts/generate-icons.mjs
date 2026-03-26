import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

async function generate(size, filename) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0a0a"/>
    <text x="${size / 2}" y="${size * 0.58}" text-anchor="middle" font-size="${size * 0.5}" font-family="sans-serif">🏸</text>
  </svg>`
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(publicDir, filename))
  console.log(`✓ ${filename}`)
}

await generate(192, 'icon-192.png')
await generate(512, 'icon-512.png')
console.log('Done!')
