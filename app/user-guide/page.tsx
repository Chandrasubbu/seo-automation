import { GuideSection } from "@/components/user-guide/GuideSection"
import {
    LayoutDashboard,
    Briefcase,
    Search,
    LineChart,
    FileText,
    Shield,
    Link2,
    PenTool,
    Zap,
    Settings
} from "lucide-react"

export default function UserGuidePage() {
    return (
        <div className="container mx-auto py-10 space-y-8 max-w-7xl">
            <div className="space-y-4 text-center pb-6 border-b">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                    SEO Automation User Guide
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    A complete reference for mastering your SEO workflow, from keyword research to technical audits.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-10">

                {/* Main Content */}
                <div className="space-y-12">
                    {/* 1. Dashboard */}
                    <GuideSection
                        id="dashboard"
                        title="Dashboard"
                        icon={LayoutDashboard}
                        description="Your central command center for SEO performance. View real-time metrics, recent activity, and quick access to key tools."
                        steps={[
                            { title: "Review Metrics", description: "Check immediate stats on rankings, traffic, and site health." },
                            { title: "Navigation", description: "Use the sidebar to access all 13 modules." },
                            { title: "Quick Actions", description: "Jump straight to recent projects or reports." }
                        ]}
                        tips={["The dashboard updates in real-time.", "Clicking on cards often deep-links to specific reports."]}
                    />

                    {/* 2. Projects */}
                    <GuideSection
                        id="projects"
                        title="Projects"
                        icon={Briefcase}
                        description="Manage your SEO campaigns. Organize keywords, audits, and content under specific domains."
                        steps={[
                            { title: "Create Project", description: "Click 'New Project' and enter your domain name." },
                            { title: "Track Progress", description: "Monitor the overall health score of each project." },
                            { title: "Settings", description: "Configure geographical targeting and crawl frequency." }
                        ]}
                        example={{
                            label: "New Project Setup",
                            content: "Project Name: Eastside Ventilation\nDomain: www.eastsideventilation.ca\nTarget Region: Canada"
                        }}
                    />

                    {/* 3. Keyword Research */}
                    <GuideSection
                        id="keyword-research"
                        title="Keyword Research"
                        icon={Search}
                        description="Discover high-value search terms with volume, difficulty, and CPC data."
                        steps={[
                            { title: "Input Keyword", description: "Enter a seed keyword (e.g., 'HVAC services')." },
                            { title: "Analyze", description: "View search volume, keyword difficulty (KD%), and CPC." },
                            { title: "Related Terms", description: "Find long-tail variations to target niche topics." }
                        ]}
                        example={{
                            label: "Researching 'Ventilation'",
                            content: "Input: 'Home Ventilation'\nResult: Volume 12,500 | KD 45% | CPC $2.50\nIdea: Target 'attic ventilation' for easier ranking."
                        }}
                        tips={["Target keywords with high volume but low difficulty (KD < 40).", "Use long-tail keywords for faster wins."]}
                    />

                    {/* 4. SERP Analysis */}
                    <GuideSection
                        id="serp-analysis"
                        title="SERP Analysis"
                        icon={LineChart}
                        description="Analyze the top ranking pages for any keyword to understand the competitive landscape."
                        steps={[
                            { title: "Enter Query", description: "Type the keyword you want to rank for." },
                            { title: "Select Region", description: "Choose the target country (e.g., Canada, US)." },
                            { title: "Review Competitors", description: "See who ranks in Top 10 and their domain authority." }
                        ]}
                        example={{
                            label: "Checking 'Furnace Repair'",
                            content: "Query: 'Furnace Repair'\nRegion: Canada\nResult: 1.25M results. Top 3 are Homestars, HomeDepot, and Local Hero."
                        }}
                    />

                    {/* 5. Competitor Analysis */}
                    <GuideSection
                        id="competitor-analysis"
                        title="Competitor Analysis"
                        icon={Search}
                        description="Perform a gap analysis between your site and key competitors."
                        steps={[
                            { title: "Your URL", description: "Enter your full domain URL." },
                            { title: "Competitor URL", description: "Enter a main competitor's domain." },
                            { title: "Analyze Gap", description: "Compare content length, headings, and SEO structure." }
                        ]}
                        example={{
                            label: "Gap Analysis",
                            content: "You: eastsideventilation.ca\nCompetitor: homedepot.ca\nResult: Competitor has 2x content length. Recommendation: Expand service pages."
                        }}
                    />

                    {/* 6. Content Strategy */}
                    <GuideSection
                        id="content-strategy"
                        title="Content Strategy"
                        icon={Briefcase}
                        description="Plan content clusters and topical authority mapping."
                        steps={[
                            { title: "Define Topic", description: "Start with a broad pillar topic." },
                            { title: "Generate Cluster", description: "AI suggests sub-topics and article ideas." },
                            { title: "Assign Priority", description: "mark high-impact topics to write first." }
                        ]}
                    />

                    {/* 7. Content Generator */}
                    <GuideSection
                        id="content-generator"
                        title="Content Generator"
                        icon={PenTool}
                        description="AI-powered article writing assistant producing SEO-optimized drafts."
                        steps={[
                            { title: "Topic & Keywords", description: "Enter the main topic and target keywords." },
                            { title: "Generate Outline", description: "Review and edit the proposed article structure." },
                            { title: "Write Article", description: "Generate full content with formatting and meta tags." }
                        ]}
                        tips={["Always review AI content for brand voice accuracy.", "Use generated meta descriptions for better CTR."]}
                    />

                    {/* 8. Optimization (SXO) */}
                    <GuideSection
                        id="optimization"
                        title="Content Optimization"
                        icon={Zap}
                        description="Real-time feedback on content quality and keyword usage."
                        steps={[
                            { title: "Paste Content", description: "Input your draft text." },
                            { title: "Set Keyword", description: "Define the target focus keyword." },
                            { title: "Analyze", description: "Get a score (0-100) and specific fix suggestions." }
                        ]}
                        example={{
                            label: "Optimizing Service Page",
                            content: "Score: 55 -> Issues: 'Keyword density low', 'Title missing keyword'.\nAction: Add keyword to H1 and first paragraph to boost score."
                        }}
                    />

                    {/* 9. Content Audit */}
                    <GuideSection
                        id="content-audit"
                        title="Content Audit"
                        icon={FileText}
                        description="Evaluate existing pages for quality, relevance, and SEO health."
                        steps={[
                            { title: "Input Text", description: "Paste text from a live page." },
                            { title: "Run Audit", description: "Check for grammar, readability, and SEO basics." },
                            { title: "Review Score", description: "See overall quality metrics." }
                        ]}
                    />

                    {/* 10. Technical Audit */}
                    <GuideSection
                        id="technical-audit"
                        title="Technical Audit"
                        icon={Shield}
                        description="Deep dive into site infrastructure, speed, and security."
                        steps={[
                            { title: "Enter URL", description: "Full URL of the page to audit." },
                            { title: "Run Scan", description: "Analyzes 7 categories (Speed, Mobile, Security, etc.)." },
                            { title: "View Report", description: "Detailed breakdown of critical errors and warnings." }
                        ]}
                        tips={["Fix 'Critical' issues first as they hurt rankings most.", "Run audits after any major site update."]}
                    />

                    {/* 11. Backlinks */}
                    <GuideSection
                        id="backlinks"
                        title="Backlink Manager"
                        icon={Link2}
                        description="Monitor backlink profile and find new link-building opportunities."
                        steps={[
                            { title: "Select Region", description: "Target specific geo-locations." },
                            { title: "Analyze Profile", description: "View Health Score and Toxic Links." },
                            { title: "Find Opportunities", description: "Discover unlinked mentions and broken links." }
                        ]}
                    />

                    {/* 12. Analytics */}
                    <GuideSection
                        id="analytics"
                        title="Analytics"
                        icon={LineChart}
                        description="Deep performance tracking and reporting."
                        steps={[
                            { title: "Connect Data", description: "Integrates with mock data sources." },
                            { title: "View Trends", description: "Traffic growth, user behavior, and conversions." }
                        ]}
                    />

                    {/* 13. Workflows */}
                    <GuideSection
                        id="workflows"
                        title="Workflows"
                        icon={Settings}
                        description="Automate repetitive SEO tasks."
                        steps={[
                            { title: "Create Workflow", description: "Chain actions like 'Audit -> Report -> Email'." },
                            { title: "Set Triggers", description: "Schedule weekly or monthly runs." }
                        ]}
                    />
                </div>

                {/* Sticky TOC */}
                <div className="hidden lg:block relative">
                    <div className="sticky top-24 space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Contents</h3>
                        <nav className="flex flex-col space-y-2 text-sm">
                            <a href="#dashboard" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Dashboard</a>
                            <a href="#projects" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Projects</a>
                            <a href="#keyword-research" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Keyword Research</a>
                            <a href="#serp-analysis" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">SERP Analysis</a>
                            <a href="#competitor-analysis" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Competitor Analysis</a>
                            <a href="#content-strategy" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Content Strategy</a>
                            <a href="#content-generator" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Content Generator</a>
                            <a href="#optimization" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Optimization</a>
                            <a href="#content-audit" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Content Audit</a>
                            <a href="#technical-audit" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Technical Audit</a>
                            <a href="#backlinks" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Backlinks</a>
                            <a href="#analytics" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Analytics</a>
                            <a href="#workflows" className="text-muted-foreground hover:text-primary transition-colors block py-1 border-l-2 border-transparent hover:border-primary pl-2">Workflows</a>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    )
}
