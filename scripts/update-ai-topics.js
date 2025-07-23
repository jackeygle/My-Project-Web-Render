const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Gemini API 配置
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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
    formatted: now.toLocaleDateString('en-US', {
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

// 使用 Gemini API 生成 AI 话题摘要
async function generateAITopicsSummary(newsHeadlines) {
  try {
    const prompt = `
Based on the following AI and robotics news headlines, generate a concise and insightful daily AI topics summary.

News Headlines:
${newsHeadlines.slice(0, 15).join('\n')}

Please respond in English with the following JSON structure:
{
  "mainTopic": "Today's main AI topic (1-2 sentences summary)",
  "keyInsights": [
    "Key insight 1 (one sentence)",
    "Key insight 2 (one sentence)", 
    "Key insight 3 (one sentence)"
  ],
  "trendAnalysis": "Trend analysis (2-3 sentences analyzing current AI development direction)",
  "futureImplications": "Future implications (1-2 sentences about potential impact on AI and robotics field)"
}

Requirements:
- Content should be technically deep but understandable
- Highlight the most important and interesting developments
- Maintain professional technical perspective
- If news headlines are insufficient, generate relevant content based on current AI development trends
`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are an AI and robotics domain expert analyst, skilled at extracting key information from technical news and conducting in-depth analysis.\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    };

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // 尝试解析JSON
    try {
      const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      console.log('Raw response:', responseText);
      
      // 如果解析失败，返回默认结构
      return {
        mainTopic: "Today's AI technology continues rapid development with breakthrough progress across multiple domains.",
        keyInsights: [
          "Machine learning model performance continues to improve",
          "AI application scenarios are constantly expanding",
          "Technology commercialization pace is accelerating"
        ],
        trendAnalysis: "Current AI development shows diversified trends, with rapid progress from basic research to practical applications. The maturity of large model technology brings new possibilities for various industries.",
        futureImplications: "These developments will accelerate AI technology adoption and bring more opportunities for automation and intelligence."
      };
    }
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
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
    console.log('🧠 Generating AI summary with Gemini...');
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