# AI Insights 自动化系统设置指南

## 🎯 系统概述

这个系统可以实现：
- ✅ 每天定时运行爬虫脚本
- ✅ 调用 ChatGPT API 生成今日 AI & 机器人话题摘要  
- ✅ 把结果写入 `/public/data/today_ai_topics.json` 文件
- ✅ 自动推送到 GitHub 仓库（触发网站更新）
- ✅ 网站前端通过 JS 读取 JSON，展示最新内容

## 🚀 快速开始

### 1. 设置 GitHub Repository Secrets

在你的 GitHub 仓库中设置以下 Secrets：

1. 访问你的 GitHub 仓库
2. 点击 `Settings` → `Secrets and variables` → `Actions`
3. 点击 `New repository secret` 添加：

```
Name: OPENAI_API_KEY
Value: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 获取 OpenAI API Key

1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 登录你的账户
3. 点击 `Create new secret key`
4. 复制 API 密钥并添加到 GitHub Secrets

### 3. 验证设置

推送代码到 GitHub 后：

1. 访问 `Actions` 标签页
2. 你会看到 `Update Daily AI Topics` 工作流
3. 可以点击 `Run workflow` 手动测试
4. 检查 `/public/data/today_ai_topics.json` 是否更新

## 📁 文件结构

```
.github/workflows/
├── update-ai-topics.yml          # GitHub Actions 工作流

scripts/
├── update-ai-topics.js           # 主要更新脚本

public/
├── data/
│   └── today_ai_topics.json      # 生成的数据文件
├── ai-insights.html              # AI Insights 页面
└── [其他网站文件]

AI_INSIGHTS_SETUP.md              # 本设置文档
```

## ⏰ 运行时间表

- **自动运行**: 每天早上 8:00 UTC（北京时间下午 4:00）
- **手动触发**: 可以在 GitHub Actions 中手动运行
- **失败重试**: GitHub Actions 自动处理失败情况

## 🔧 自定义配置

### 修改运行时间

编辑 `.github/workflows/update-ai-topics.yml`:

```yaml
schedule:
  # 更改为你想要的时间（UTC）
  - cron: '0 8 * * *'  # 每天 8:00 UTC
```

### 添加新的新闻源

编辑 `scripts/update-ai-topics.js` 中的 `NEWS_SOURCES`:

```javascript
const NEWS_SOURCES = [
  {
    name: '新的AI新闻网站',
    url: 'https://example.com/ai-news',
    selector: '.news-title a'  // CSS 选择器
  },
  // ... 其他源
];
```

### 调整 AI 分析提示词

在 `scripts/update-ai-topics.js` 中修改 `generateAITopicsSummary` 函数的 prompt。

## 🌐 访问 AI Insights 页面

添加完整系统后，访问：
- 主要页面: `https://你的域名/ai-insights.html`
- 数据API: `https://你的域名/data/today_ai_topics.json`

## 💡 功能特点

### AI Insights 页面包含：

1. **实时状态栏**: 显示最后更新时间和数据来源数量
2. **今日AI焦点**: OpenAI API 生成的主要话题
3. **关键洞察**: 3个要点总结
4. **趋势分析**: 深度技术分析
5. **未来影响**: 发展前景预测
6. **技术统计**: 动态计数器显示各项指标
7. **AI资源链接**: 相关技术资源快速访问

### 视觉特效：

- 🎨 赛博朋克主题设计
- ⚡ 加载动画和过渡效果
- 📱 完全响应式设计
- 🌟 鼠标交互粒子效果
- 🔄 数字计数动画

## 🔍 故障排除

### 常见问题：

1. **API 调用失败**
   - 检查 OpenAI API 密钥是否正确
   - 确认账户有足够的额度

2. **数据文件未更新**
   - 查看 GitHub Actions 日志
   - 检查脚本权限设置

3. **页面显示错误**
   - 确认 JSON 文件格式正确
   - 检查浏览器控制台错误

### 调试步骤：

1. 检查 GitHub Actions 运行日志
2. 验证生成的 JSON 文件格式
3. 在浏览器开发者工具中查看网络请求
4. 测试 OpenAI API 连接

## 📊 数据格式说明

生成的 `today_ai_topics.json` 包含：

```json
{
  "lastUpdated": "ISO 时间戳",
  "date": "YYYY-MM-DD",
  "dateFormatted": "中文格式日期",
  "summary": {
    "mainTopic": "主要话题",
    "keyInsights": ["洞察1", "洞察2", "洞察3"],
    "trendAnalysis": "趋势分析文本",
    "futureImplications": "未来影响文本"
  },
  "techStats": {
    "modelsAnalyzed": 数字,
    "researchPapers": 数字,
    "codeCommits": 数字,
    "experimentsRun": 数字
  },
  "sourceCount": 数字,
  "metadata": {
    "generatedBy": "GitHub Actions",
    "version": "1.0.0",
    "sources": ["新闻源列表"]
  }
}
```

## 🎉 完成！

设置完成后，你的网站将拥有：

- ✅ 每日自动更新的 AI 洞察内容
- ✅ 专业的 AI Insights 展示页面
- ✅ 完全自动化的内容生成流程
- ✅ 美观的可视化数据展示

享受你的智能化静态网站吧！🚀 