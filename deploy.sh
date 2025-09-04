#!/bin/bash

# AI Portfolio Website - Render Deployment Script
echo "🚀 Starting deployment to Render..."

# 检查 Git 状态
echo "📋 Checking Git status..."
git status

# 添加所有文件
echo "📁 Adding files to Git..."
git add .

# 提交更改
echo "💾 Committing changes..."
git commit -m "🚀 Deploy to Render - AI Portfolio Website

✨ Features:
- Complete AI & Deep Learning portfolio
- Interactive games and algorithms
- Neural network background animations
- Responsive design for all devices

🔧 Technical:
- Static website optimized for Render
- PDF preview support
- Fast loading with proper caching
- SEO optimized

🎯 Ready for production deployment!"

# 推送到 GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated! Check Render dashboard for progress."
echo "🌐 Your website will be available at: https://your-app-name.onrender.com"
