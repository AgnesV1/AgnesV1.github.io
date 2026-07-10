#!/usr/bin/env node
// 生成社交分享用的 OG 图片（public/og.png），改完配色后可以重新跑一次。

import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#FFFCF7"/>
  <circle cx="520" cy="270" r="125" fill="#F26D5B"/>
  <circle cx="680" cy="270" r="125" fill="#8A7BF0" fill-opacity="0.88"/>
  <circle cx="600" cy="408" r="125" fill="#2FB48C" fill-opacity="0.88"/>
  <g>
    <circle cx="560" cy="565" r="7" fill="#F26D5B"/>
    <circle cx="585" cy="565" r="7" fill="#EFB53C"/>
    <circle cx="610" cy="565" r="7" fill="#2FB48C"/>
    <circle cx="635" cy="565" r="7" fill="#4FA8D8"/>
    <circle cx="660" cy="565" r="7" fill="#8A7BF0"/>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log('✓ 已生成 public/og.png');
