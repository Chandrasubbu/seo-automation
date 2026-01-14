# SEO Automation Platform

A comprehensive Next.js application for SEO strategy, content optimization, and competitive analysis powered by AI.

## 🚀 Features

### Core Features
- **SEO Projects** - Create and manage multiple SEO analysis projects
- **Website Management** - Save 40+ competitor/reference websites per project
- **SEO Blueprint Generator** - AI-powered SEO strategy from competitor analysis
- **Content Strategy Suite** - User intent analysis, topic clusters, and quality scoring
- **Keyword Research** - Search volume, difficulty, and intent classification
- **SERP Analysis** - Real-time competitor ranking analysis
- **AI Content Generation** - Multi-provider AI content creation

### Phase 2 Enhancements (✅ Completed)
- ✅ **SEO Projects & Website Management** - Create projects and save 40+ websites
- ✅ **Full Content Generation** - 10+ templates, AI outlines, auto-writing
- ✅ **Performance Tracking** - Google Search Console integration
- ✅ **Automated Optimization** - AI scoring & auto-fix capabilities
- ✅ **Workflow Automation** - Drag-and-drop builder & job scheduler
- ✅ **User Authentication** - Secure login & role-based access
- ✅ **Phase 1 Features** - SERP analysis, Keyword research, etc.

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (or use cloud database)
- API keys (at least one AI provider)

### Installation

```bash
# 1. Clone and install
git clone <your-repo>
cd SEO-Automation
npm install

# 2. Set up environment variables
cp env.example .env.local
# Edit .env.local with your API keys and database URL

# 3. Set up database
npx prisma generate
npx prisma migrate dev --name init

# 4. Start development server
npm run dev
```

Visit http://localhost:3000

## 🔑 API Keys Required

### Required
- **Database**: PostgreSQL connection string
- **AI Provider**: At least one of:
  - OpenAI API key
  - Anthropic API key
  - Google Gemini API key

### Optional (uses mock data if not provided)
- **SERP Analysis**: SerpAPI or DataForSEO
- **Keyword Research**: SEMrush, Ahrefs, or DataForSEO

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[CONTENT_STRATEGY_README.md](./CONTENT_STRATEGY_README.md)** - Content strategy features
- **[Implementation Plan](/.gemini/antigravity/brain/2942e6c5-e0ee-470c-a3cb-3085684eed84/implementation_plan.md)** - Technical implementation details
- **[Architecture](/.gemini/antigravity/brain/2942e6c5-e0ee-470c-a3cb-3085684eed84/architecture.md)** - System architecture and diagrams
- **[Walkthrough](/.gemini/antigravity/brain/2942e6c5-e0ee-470c-a3cb-3085684eed84/walkthrough.md)** - Phase 1 implementation walkthrough

## 🎯 Features Overview

### 1. SEO Blueprint Generator
Generate comprehensive SEO strategies by analyzing competitor websites.

**Endpoint**: `POST /api/analyze`
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "email marketing",
    "brand": "Your Brand",
    "competitors": ["https://competitor1.com", "https://competitor2.com"],
    "services": "Email marketing automation"
  }'
```

### 2. Keyword Research
Discover high-value keywords with search volume and difficulty analysis.

**Page**: http://localhost:3000/keyword-research

**Endpoint**: `POST /api/keywords/research`
```bash
curl -X POST http://localhost:3000/api/keywords/research \
  -H "Content-Type: application/json" \
  -d '{"keyword": "seo tools"}'
```

### 3. SERP Analysis
Analyze search engine results to understand competition.

**Page**: http://localhost:3000/serp-analysis

**Endpoint**: `POST /api/serp/analyze`
```bash
curl -X POST http://localhost:3000/api/serp/analyze \
  -H "Content-Type: application/json" \
  -d '{"keyword": "best coffee shops", "location": "United States"}'
```

### 4. Content Strategy
Comprehensive content planning and optimization tools.

**Page**: http://localhost:3000/content-strategy

Features:
- User intent analysis
- Topic cluster generation
- Content quality scoring
- E-E-A-T assessment

### 5. AI Content Generation
Generate SEO-optimized content with multiple AI providers.

**Endpoint**: `POST /api/content/generate`
```bash
curl -X POST http://localhost:3000/api/content/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write an introduction about SEO",
    "type": "article",
    "provider": "openai"
  }'
```

## 🗄️ Database Schema

The platform uses PostgreSQL with Prisma ORM. Key models:

- **AnalysisResult** - SEO blueprint results
- **TopicCluster** - Topic cluster data
- **ContentQuality** - Content quality assessments
- **SerpAnalysis** - SERP analysis results
- **KeywordResearch** - Keyword research data
- **IntentAnalysis** - Intent analysis results
- **User** - User accounts (Auth)
- **Account/Session** - Auth sessions
- **SearchPerformance** - GSC analytics data
- **Workflow** - Automation workflows
- **WorkflowRun** - Execution logs

View database:
```bash
npx prisma studio
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **AI**: OpenAI, Anthropic, Google Gemini
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Custom Components
- **APIs**: SerpAPI, SEMrush, JINA Reader

## 📊 API Endpoints

### SEO & Analysis
```
POST /api/analyze                           # Generate SEO blueprint
POST /api/serp/analyze                      # Analyze SERP
GET  /api/serp/analyze?keyword=X            # Get SERP history
POST /api/keywords/research                 # Research keywords
GET  /api/keywords/research?keyword=X       # Get keyword data
```

### Content Strategy
```
POST /api/content-strategy/analyze-intent   # Analyze user intent
POST /api/content-strategy/generate-clusters # Generate topic clusters
POST /api/content-strategy/analyze-cluster  # Analyze cluster coverage
POST /api/content-strategy/export-cluster   # Export cluster data
POST /api/content-strategy/check-quality    # Check content quality
```

### AI Content
```
POST /api/content/generate                  # Simple generation
POST /api/content/article/generate          # Full article generation
GET  /api/content/article/generate          # List templates
```

### Automation & Tools
```
POST /api/analytics/sync                    # Sync GSC data
GET  /api/analytics/dashboard               # Get performance stats
POST /api/optimization/analyze              # Score content
POST /api/optimization/fix                  # Applied ID fixes
POST /api/workflows                         # Create workflow
POST /api/workflows/[id]/run                # Trigger workflow
```

## 🔒 Rate Limiting

- **Limit**: 5 requests per minute per IP
- **Headers**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Status**: 429 when limit exceeded

## 🚧 Roadmap

### Phase 2 (✅ Completed)
- [x] Full content generation system
- [x] Performance tracking dashboard
- [x] Automated content optimization
- [x] User authentication & collaboration
- [x] Workflow automation
- [x] Advanced analytics

See [implementation_plan.md](/.gemini/antigravity/brain/2942e6c5-e0ee-470c-a3cb-3085684eed84/implementation_plan.md) for details.

## 🐛 Troubleshooting

### Database Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Regenerate Prisma client
npx prisma generate
```

### API Key Issues
- Ensure keys are in `.env.local` (not `env.example`)
- Restart dev server after adding keys
- Verify key validity on provider dashboards

### Missing Dependencies
```bash
# Reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for more troubleshooting tips.

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read the implementation plan and architecture docs before contributing.

## 📧 Support

For issues or questions:
1. Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review the [walkthrough](/.gemini/antigravity/brain/2942e6c5-e0ee-470c-a3cb-3085684eed84/walkthrough.md)
3. Check existing issues or create a new one

---

**Built with ❤️ using Next.js, TypeScript, and AI**
