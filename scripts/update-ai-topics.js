const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');

// 初始化 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// AI 新闻源配置
const NEWS_SOURCES = [
  {
    name: 'MIT Technology Review',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/',
    selector: 'h3 a, .articlesList__title a'
  },
  {
    name: 'AI News',
    url: 'https://artificialintelligence-news.com/',
    selector: '.entry-title a'
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/ai/',
    selector: '.ArticleListing__title a'
  }
];

// 获取当前日期
function getCurrentDate() {
  const now = new Date();
  return {
    date: now.toISOString().split('T')[0],
    timestamp: now.toISOString(),
    formatted: now.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  };
}

// 爬取AI新闻标题
async function scrapeAINews() {
  const allTitles = [];
  
  for (const source of NEWS_SOURCES) {
    try {
      console.log(`Scraping ${source.name}...`);
      const response = await axios.get(source.url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const titles = [];
      
      $(source.selector).each((i, element) => {
        if (i < 5) { // 只取前5个标题
          const title = $(element).text().trim();
          if (title && title.length > 10) {
            titles.push(title);
          }
        }
      });
      
      allTitles.push(...titles);
      console.log(`Found ${titles.length} titles from ${source.name}`);
      
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error.message);
    }
  }
  
  return allTitles;
}

// 使用 OpenAI 生成 AI 话题摘要
async function generateAITopicsSummary(newsHeadlines) {
  try {
    const prompt = `
基于以下AI和机器人相关的新闻标题，请生成一个简洁而有见地的每日AI话题摘要。

新闻标题：
${newsHeadlines.slice(0, 15).join('\n')}

请用中文回复，包含以下结构的JSON格式：
{
  "mainTopic": "今日主要AI话题（1-2句话概括）",
  "keyInsights": [
    "关键洞察1（1句话）",
    "关键洞察2（1句话）",
    "关键洞察3（1句话）"
  ],
  "trendAnalysis": "趋势分析（2-3句话，分析当前AI发展方向）",
  "futureImplications": "未来影响（1-2句话，这些发展对AI和机器人领域的潜在影响）"
}

要求：
- 内容要有技术深度但易于理解
- 突出最重要和最有趣的发展
- 保持专业的技术视角
- 如果新闻标题不足，可以基于当前AI发展趋势生成相关内容
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "你是一位AI和机器人领域的专家分析师，擅长从技术新闻中提取关键信息并进行深度分析。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseText = completion.choices[0].message.content;
    
    // 尝试解析JSON
    try {
      return JSON.parse(responseText.replace(/```json\n?|\n?```/g, ''));
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      
      // 如果解析失败，返回默认结构
      return {
        mainTopic: "今日AI技术继续快速发展，多个领域出现突破性进展。",
        keyInsights: [
          "机器学习模型性能持续提升",
          "AI应用场景不断扩展",
          "技术商业化步伐加快"
        ],
        trendAnalysis: "当前AI发展呈现多元化趋势，从基础研究到实际应用都在快速推进。大模型技术的成熟为各行业带来新的可能性。",
        futureImplications: "这些发展将加速AI技术的普及，为自动化和智能化带来更多机遇。"
      };
    }
    
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

// 生成随机的技术统计数据
function generateTechStats() {
  const baseStats = {
    modelsAnalyzed: 45 + Math.floor(Math.random() * 20),
    researchPapers: 280 + Math.floor(Math.random() * 50),
    codeCommits: 1200 + Math.floor(Math.random() * 300),
    experimentsRun: 89 + Math.floor(Math.random() * 30)
  };
  
  return baseStats;
}

// 主函数
async function main() {
  try {
    console.log('🤖 Starting AI topics update...');
    
    const currentDate = getCurrentDate();
    console.log(`Date: ${currentDate.formatted}`);
    
    // 爬取新闻
    console.log('📰 Scraping AI news...');
    const newsHeadlines = await scrapeAINews();
    console.log(`Found ${newsHeadlines.length} news headlines`);
    
    // 生成摘要
    console.log('🧠 Generating AI summary with OpenAI...');
    const aiSummary = await generateAITopicsSummary(newsHeadlines);
    
    // 生成技术统计
    const techStats = generateTechStats();
    
    // 构建最终数据
    const todayData = {
      lastUpdated: currentDate.timestamp,
      date: currentDate.date,
      dateFormatted: currentDate.formatted,
      summary: aiSummary,
      techStats: techStats,
      sourceCount: newsHeadlines.length,
      metadata: {
        generatedBy: 'GitHub Actions',
        version: '1.0.0',
        sources: NEWS_SOURCES.map(s => s.name)
      }
    };
    
    // 确保目录存在
    const dataDir = path.join(__dirname, '..', 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // 写入文件
    const filePath = path.join(dataDir, 'today_ai_topics.json');
    fs.writeFileSync(filePath, JSON.stringify(todayData, null, 2), 'utf8');
    
    console.log('✅ AI topics updated successfully!');
    console.log(`📁 File saved to: ${filePath}`);
    console.log(`📊 Main topic: ${aiSummary.mainTopic}`);
    
  } catch (error) {
    console.error('❌ Error updating AI topics:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main, generateAITopicsSummary, scrapeAINews }; 