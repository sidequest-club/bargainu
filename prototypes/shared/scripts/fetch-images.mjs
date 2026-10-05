// Downloads the product photos used by all three prototypes into ../public/images.
// Source: Unsplash (free licence, https://unsplash.com/license). Run: node fetch-images.mjs
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const photos = {
  shoes: ['1595950653106-6c9ebd614d3a', '1600269452121-4f2416e55c28', '1560769629-975ec94e6a86', '1608231387042-66d1773070a5', '1600185365926-3a2ce3cdb9eb'],
  clothing: ['1521223890158-f9f7c3d5d504', '1551488831-00ddcb6c6bd3', '1649433911119-7cf48b3e8f50', '1624548140150-108c3287f551', '1649937408746-4d2f603f91c8'],
  audio: ['1505740420928-5e560c06d30e', '1618366712010-f4ae9c647dcb', '1546435770-a3e426bf472b', '1613040809024-b4ef7ba99bc3', '1583394838336-acd977736f90'],
  cameras: ['1516035069371-29a1b244cc32', '1502920917128-1aa500764cbd', '1502982720700-bfff97f2ecac', '1564466809058-bf4114d55352', '1621985499238-698dfd45b017'],
  computers: ['1496181133206-80ce9b88a853', '1541807084-5c52b6b3adef', '1525547719571-a2d4ac8945e2', '1531297484001-80022131f5a1', '1611186871348-b1ce696e52c9'],
  watches: ['1523170335258-f5ed11844a49', '1620625515032-6ed0c1790c75', '1542496658-e33a6d0d50f6', '1622434641406-a158123450f9', '1587925358603-c2eea5305bbc'],
  appliances: ['1620807773206-49c1f2957417', '1475296204602-08d15839e95f', '1616388761741-a5936c6f61f6', '1707241358597-bafcc8a8e73d', '1637029436347-e33bf98a5412'],
  beauty: ['1583209814683-c023dd293cc6', '1631730486572-226d1f595b68', '1576426863848-c21f53c60b19', '1613803745799-ba6c10aace85', '1638609927040-8a7e97cd9d6a'],
  bags: ['1553062407-98eeb64c6a62', '1622560480654-d96214fdc887', '1622560480605-d83c853bc5c3', '1509762774605-f07235a08f1f', '1680039211156-66c721b87625'],
  kitchen: ['1556909212-d5b604d0c90d', '1556910585-09baa3a3998e', '1584990347163-2b86b71390d6', '1584990347193-6bebebfeaeee', '1556910602-38f53e68e15d'],
  gaming: ['1612287230202-1ff1d85d1bdf', '1509198397868-475647b2a1e5', '1552820728-8b83bb6b773f', '1592840496694-26d035b52b48', '1600861194942-f883de0dfe96'],
  furniture: ['1592078615290-033ee584e267', '1634712282287-14ed57b9cc89', '1612372606404-0ab33e7187ee', '1640938776314-4d303f8a1380', '1603376728541-6e1906a300e6'],
}

const out = fileURLToPath(new URL('../public/images/', import.meta.url))
await mkdir(out, { recursive: true })

const credits = ['# Image credits', '', 'All photos are from Unsplash under the Unsplash License (https://unsplash.com/license).', '', '| File | Source |', '|---|---|']
let failed = 0
for (const [category, ids] of Object.entries(photos)) {
  for (const [i, id] of ids.entries()) {
    const file = `${category}-${i + 1}.jpg`
    const url = `https://images.unsplash.com/photo-${id}`
    const res = await fetch(`${url}?w=900&h=900&fit=crop&q=72&fm=jpg`)
    if (!res.ok) {
      failed++
      console.error(`FAILED ${file} ${res.status}`)
      continue
    }
    await writeFile(out + file, Buffer.from(await res.arrayBuffer()))
    credits.push(`| ${file} | ${url} |`)
  }
}
await writeFile(out + 'CREDITS.md', credits.join('\n') + '\n')
console.log(`done, ${failed} failed`)
