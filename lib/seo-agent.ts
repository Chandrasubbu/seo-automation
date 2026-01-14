import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
// Using gemini-2.0-flash-exp as it is the only model available to this key
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

interface AnalysisRequest {
    competitors: string[];
    keyword: string;
    brand?: string;
    services?: string;
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries === 0 || !error.message.includes("429")) {
            throw error;
        }
        console.log(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
    }
}

export async function generateSeoBlueprint(data: AnalysisRequest) {
    const { competitors, keyword, brand, services } = data;

    if (!process.env.GOOGLE_API_KEY || !process.env.JINA_API_KEY) {
        throw new Error("Missing API Keys");
    }

    // 1. Fetch Competitor Content (Parallel with Timeout)
    const contentPromises = competitors.filter(url => url).map(async (url) => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`https://r.jina.ai/${url}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
                    'X-With-Generated-Alt': 'true'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) return `Failed to fetch ${url} (Status: ${response.status})`;
            const text = await response.text();
            return `--- Content from ${url} ---\n${text.slice(0, 15000)}\n--- End ${url} ---`;
        } catch (e: any) {
            if (e.name === 'AbortError') return `Error fetching ${url}: Timeout (10s)`;
            return `Error fetching ${url}: ${e.message}`;
        }
    });

    const contents = await Promise.all(contentPromises);
    const combinedContent = contents.join("\n\n");

    // 2. Generate Blueprint with Gemini (Wrapped in Retry)
    const prompt = `
    You are an expert SEO Strategist working for "${brand || 'Client'}".
    Your task is to create a "High-Level Service Page SEO Blueprint" for the target keyword: "${keyword}".
    
    Context:
    Services Offered: ${services || 'General services'}
    
    Competitor Content Analysis:
    Below is the extracted content from top ranking competitors. Use this to identify gaps, structural patterns, and key opportunities.
    ${combinedContent}

    Output Requirement:
    Generate a comprehensive, professional Markdown report. Use H1, H2, H3 headers.
    
    Structure the report as follows:
    # Service Page Blueprint: [Page Title Idea]

    ## 1. Executive Summary
    - **Target Audience**: Who are we talking to?
    - **User Intent**: What do they want? (Informational -> Transactional)
    - **Unique Value Proposition**: How we win against competitors.

    ## 2. Page Structure (Outline)
    Provide a detailed outline. For each section, explain *why* it's needed (SEO or UX).
    - **H1**: [Suggested H1]
    - **H2**: [Key Benefit/Concept]
        - *Content Brief*: What points to cover.
    - **H2**: [Social Proof/Trust]
    ... (continue for all necessary sections)

    ## 3. SEO & Metadata
    - **Title Tag**: [Primary Keyword] | [Brand] - [Hook]
    - **Meta Description**: [Compelling copy under 160 chars]
    - **URL Slug**: /[slug]
    - **Keywords to Include**: [List of 5-10 semantically related terms]

    ## 4. Conversion Optimization (CRO)
    - **Primary CTA**: Text and placement.
    - **Trust Elements**: Which specific trust signals (badges, testimonials) to use.

    ## 5. Content Gap Analysis
    - **Missing from Competitors**: What did competitors miss that we should include?
    
    Make the tone professional, authoritative, and actionable.
  `;

    const result = await retryWithBackoff(async () => {
        const res = await model.generateContent(prompt);
        return res.response;
    }, 3, 5000); // 3 retries, starting with 5s delay

    return result.text();
}
