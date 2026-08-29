const fs = require('fs');
const path = require('path');
const toml = require('toml');

// 读取配置
const configPath = path.join(__dirname, 'config.toml');
const config = toml.parse(fs.readFileSync(configPath, 'utf-8'));

// 默认请求头
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Accept': 'application/json',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
};

// 根据路径从对象中取值，支持 "a.b.c" 嵌套
function getNestedValue(obj, pathStr) {
  if (!pathStr) return '';
  return pathStr.split('.').reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : '';
  }, obj);
}

// 转义 XML 特殊字符
function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// 生成 RSS XML
function generateRSS(source, items) {
  const rssItems = items.map(item => {
    const title = escapeXml(getNestedValue(item, source.itemTitle));
    const link = escapeXml(getNestedValue(item, source.itemLink));
    const date = getNestedValue(item, source.itemDate);
    const desc = escapeXml(getNestedValue(item, source.itemDesc));
    const pubDate = date ? new Date(date).toUTCString() : new Date().toUTCString();

    return `    <item>
      <title>${title}</title>
      
      <guid>${link}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(source.title)}</title>
    
    <description>${escapeXml(source.title)} - RSS Feed</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rssItems}
  </channel>
</rss>`;
}

// 生成导航页
function generateIndex(sources) {
  const links = sources.map(s =>
    `<li><a href="${s.id}.xml">${s.title}</a> — <code>${s.url}</code></li>`
  ).join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JSON to RSS</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    a { color: #0066cc; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.85em; }
    li { margin: 10px 0; }
  </style>
</head>
<body>
  <h1>JSON to RSS Feeds</h1>
  <ul>
${links}
  </ul>
</body>
</html>`;
}

// 主流程
async function main() {
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  for (const source of config.source) {
    console.log(`正在抓取: ${source.title} (${source.url})`);
    try {
      // 合并默认头和自定义头
      const headers = { ...DEFAULT_HEADERS, ...(source.headers || {}) };

      const response = await fetch(source.url, { headers });

      if (!response.ok) {
        console.error(`  ❌ HTTP ${response.status}: ${response.statusText}`);
        continue;
      }

      const json = await response.json();

      // 获取文章列表
      const items = getNestedValue(json, source.itemsPath);
      if (!Array.isArray(items)) {
        console.error(`  ❌ itemsPath "${source.itemsPath}" 未返回数组，实际类型: ${typeof items}`);
        // 调试：打印 JSON 顶层键名，方便排查
        console.error(`  💡 JSON 顶层键: ${Object.keys(json).join(', ')}`);
        continue;
      }

      // 生成 RSS
      const rss = generateRSS(source, items);
      const outputPath = path.join(publicDir, `${source.id}.xml`);
      fs.writeFileSync(outputPath, rss, 'utf-8');
      console.log(`  ✅ 已生成 ${source.id}.xml (${items.length} 条)`);
    } catch (err) {
      console.error(`  ❌ 抓取失败: ${err.message}`);
    }
  }

  // 生成导航页
  const indexHtml = generateIndex(config.source);
  fs.writeFileSync(path.join(publicDir, 'index.html'), indexHtml, 'utf-8');
  console.log('✅ 导航页已生成');
}

main();