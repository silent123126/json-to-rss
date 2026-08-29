# json-to-rss v1.0

将 JSON API 数据转换为标准 RSS 订阅源，支持多数据源配置，通过 GitHub Actions 自动定时更新并部署到 GitHub Pages。

## 功能特性

- 通过 TOML 配置文件定义多个 JSON 数据源
- 支持嵌套 JSON 路径映射（如 `detail_url.m_url`）
- 自动生成标准 RSS 2.0 XML 文件
- 支持文章封面图、分类、作者等扩展字段
- GitHub Actions 定时执行，自动部署到 GitHub Pages
- 生成导航首页，方便查看所有 RSS 源

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/json-to-rss.git
cd json-to-rss
```

### 2. 安装依赖

```bash
npm install
```

### 3. 编辑配置文件

编辑 `config.toml`，添加你的数据源：

```toml
[my_source]
title = "我的数据源"
url = "https://api.example.com/articles"
feedTitle = "示例 RSS"
feedDescription = "示例描述"
feedLink = "https://example.com"
itemsPath = "data"          # JSON 中文章数组的路径
itemTitle = "title"         # 文章标题字段
itemDesc = "desc"           # 文章描述字段
itemLink = "url"            # 文章链接字段
itemDate = "created_at"     # 发布时间字段
itemGuid = "id"             # 唯一标识字段
```

### 4. 本地运行

```bash
npm run build
```

生成的 RSS 文件在 `public/` 目录下。

### 5. 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 进入仓库 **Settings > Pages**
3. Source 选择 **GitHub Actions**
4. 推送代码后会自动触发构建和部署

## 配置项说明

| 配置项 | 必填 | 说明 |
|--------|------|------|
| `url` | 是 | JSON API 请求地址 |
| `title` | 是 | 数据源名称（日志显示用） |
| `feedTitle` | 否 | RSS Feed 标题（默认取 title） |
| `feedDescription` | 否 | RSS Feed 描述 |
| `feedLink` | 否 | Feed 对应的网站链接 |
| `itemsPath` | 否 | 文章数组的 JSON 路径，默认 `data` |
| `itemTitle` | 是 | 文章标题字段名 |
| `itemDesc` | 否 | 文章描述/摘要字段名 |
| `itemLink` | 是 | 文章链接字段名 |
| `itemDate` | 否 | 发布时间字段名 |
| `itemGuid` | 否 | 唯一标识字段名（默认取 itemLink） |
| `itemImage` | 否 | 封面图字段名 |
| `itemAuthor` | 否 | 作者字段名 |
| `itemCategory` | 否 | 分类字段名（支持嵌套路径） |
| `headers` | 否 | 自定义请求头（TOML 内联表） |

所有字段路径均支持点号分隔的嵌套访问，如 `detail_url.m_url`、`column_info.column_name`。

## 更新频率

默认每 2 小时自动更新一次（通过 GitHub Actions cron 触发）。可在 `.github/workflows/build.yml` 中修改 `cron` 表达式。

## License

MIT


# JSON to RSS v1.1

将任意 JSON API 数据转换为标准 RSS Feed，通过 GitHub Pages 托管。

## 快速开始

1. Fork 本仓库
2. 编辑 `config.toml`，添加你的数据源
3. 推送到 GitHub，自动构建并部署到 gh-pages
4. 在仓库 Settings > Pages 中将 Source 设为 **GitHub Actions**
5. 访问 `https://<username>.github.io/<repo>/` 查看导航页

## 配置说明

在 `config.toml` 中添加数据源：

```toml

[[source]]
id = "唯一标识"
title = "Feed 标题"
url = "JSON API 地址"
itemsPath = "data"              # 文章数组在 JSON 中的路径
itemTitle = "title"             # 标题字段
itemLink = "detail_url.m_url"   # 链接字段（支持嵌套）
itemDate = "publish_time"       # 日期字段
itemDesc = "desc"               # 描述字段
[source.headers]
Referer = "https://example.com/"  # 可选，自定义请求头