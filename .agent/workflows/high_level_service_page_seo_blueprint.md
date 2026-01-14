---
description: High-Level Service Page SEO Blueprint Report
---

# High-Level Service Page SEO Blueprint Report

This workflow generates a comprehensive SEO content strategy for service-based businesses by analyzing competitor websites and user intent.

## Steps

1.  **Data Collection**
    Prompt the user for the following details:
    *   **Competitor URLs**: A list of 3-5 competitor service pages.
    *   **Target Keyword**: The primary keyword for the page.
    *   **Services Offered**: A brief description of the services provided.
    *   **Brand Name**: The name of the business.
    *   **Page Type**: Is this a Homepage or an internal Service Page?

2.  **Competitor Content Extraction**
    For each competitor URL provided:
    *   Use the `read_url_content` tool (or JINA Reader API if configured) to extract the full text content and HTML structure.
    *   *Note*: Ensure you capture headings (H1-H6), meta titles, and meta descriptions.

3.  **Content Structure Analysis**
    Analyze the extracted content for each competitor:
    *   **Headings**: Map out the heading hierarchy.
    *   **Meta Tags**: Identify patterns in title tags and meta descriptions.
    *   **Recurring Phrases**: Note any n-grams or specific terminology used frequently.

4.  **Competitor Analysis Report**
    Synthesize the findings into a summary:
    *   Common outline sections across competitors.
    *   Key concepts covered in headings.
    *   Structural elements (e.g., FAQ sections, testimonials, pricing tables).

5.  **User Intent & Gap Analysis**
    *   **Intent**: Analyze the Target Keyword to determine user intent (Informational, Transactional, etc.) and map to the buyer's journey.
    *   **Gaps**: Identify what competitors are missing that the user could capitalize on (Content Gaps).

6.  **Blueprint Generation**
    Create a detailed markdown document (the "Blueprint") containing:
    *   **Page Structure**: Recommended H1, H2, H3 hierarchy.
    *   **Section Justification**: Why each section is included based on analysis.
    *   **UX & Conversion**: specific recommendations for CTAs, trust signals, and visual elements.
    *   **SEO Recommendations**: Title tag, meta description, and URL slug suggestions.

    *Save this blueprint as an artifact.*
