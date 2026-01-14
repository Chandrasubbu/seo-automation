/**
 * SEO Content Templates
 * Pre-built templates for common content types
 */

export interface ContentTemplate {
    name: string
    description: string
    type: 'blog' | 'landing' | 'product' | 'guide' | 'listicle'
    structure: {
        sections: string[]
        minSections: number
        maxSections: number
    }
    seoGuidelines: string[]
}

export const contentTemplates: Record<string, ContentTemplate> = {
    'how-to-guide': {
        name: 'How-To Guide',
        description: 'Step-by-step instructional content',
        type: 'guide',
        structure: {
            sections: [
                'Introduction - What and Why',
                'Prerequisites/Requirements',
                'Step-by-Step Instructions',
                'Common Mistakes to Avoid',
                'Tips for Success',
                'Conclusion and Next Steps'
            ],
            minSections: 4,
            maxSections: 8
        },
        seoGuidelines: [
            'Use numbered steps for clarity',
            'Include screenshots or examples',
            'Target "how to" keywords',
            'Add FAQ section',
            'Include time estimates'
        ]
    },

    'ultimate-guide': {
        name: 'Ultimate Guide',
        description: 'Comprehensive, authoritative long-form content',
        type: 'guide',
        structure: {
            sections: [
                'Introduction',
                'What is [Topic]?',
                'Why [Topic] Matters',
                'Key Concepts and Terminology',
                'Best Practices',
                'Advanced Strategies',
                'Tools and Resources',
                'Case Studies/Examples',
                'Common Challenges and Solutions',
                'Conclusion and Action Steps'
            ],
            minSections: 6,
            maxSections: 12
        },
        seoGuidelines: [
            'Target pillar keywords',
            'Aim for 3000+ words',
            'Include table of contents',
            'Add internal links to cluster content',
            'Use schema markup'
        ]
    },

    'listicle': {
        name: 'Listicle',
        description: 'Numbered or bulleted list article',
        type: 'listicle',
        structure: {
            sections: [
                'Introduction',
                'Item 1',
                'Item 2',
                'Item 3',
                'Item 4',
                'Item 5',
                'Conclusion'
            ],
            minSections: 5,
            maxSections: 25
        },
        seoGuidelines: [
            'Use odd numbers (7, 11, 15) for better engagement',
            'Make each item actionable',
            'Include visuals for each item',
            'Target "best", "top", "X ways" keywords',
            'Add summary at the end'
        ]
    },

    'comparison': {
        name: 'Comparison Article',
        description: 'Compare products, services, or concepts',
        type: 'blog',
        structure: {
            sections: [
                'Introduction',
                'Overview of Option A',
                'Overview of Option B',
                'Feature Comparison',
                'Pros and Cons',
                'Pricing Comparison',
                'Use Cases - When to Choose Each',
                'Final Verdict',
                'Conclusion'
            ],
            minSections: 6,
            maxSections: 10
        },
        seoGuidelines: [
            'Target "vs" and "comparison" keywords',
            'Use comparison tables',
            'Be objective and balanced',
            'Include affiliate disclaimers if applicable',
            'Add schema for reviews'
        ]
    },

    'product-review': {
        name: 'Product Review',
        description: 'In-depth product or service review',
        type: 'product',
        structure: {
            sections: [
                'Introduction',
                'Product Overview',
                'Key Features',
                'Performance and Testing',
                'Pros and Cons',
                'Pricing and Value',
                'Alternatives to Consider',
                'Who Should Buy This',
                'Final Verdict'
            ],
            minSections: 7,
            maxSections: 12
        },
        seoGuidelines: [
            'Target "review" keywords',
            'Include product images',
            'Add rating/score',
            'Use schema markup for reviews',
            'Include purchase links'
        ]
    },

    'landing-page': {
        name: 'Landing Page',
        description: 'Conversion-focused page for products/services',
        type: 'landing',
        structure: {
            sections: [
                'Hero Section with Value Proposition',
                'Problem Statement',
                'Solution Overview',
                'Key Benefits',
                'How It Works',
                'Features',
                'Social Proof/Testimonials',
                'Pricing',
                'FAQ',
                'Final CTA'
            ],
            minSections: 6,
            maxSections: 10
        },
        seoGuidelines: [
            'Clear, compelling headlines',
            'Multiple CTAs throughout',
            'Use benefit-focused language',
            'Include trust signals',
            'Optimize for conversion keywords'
        ]
    },

    'pillar-page': {
        name: 'Pillar Page',
        description: 'Comprehensive topic overview linking to cluster content',
        type: 'guide',
        structure: {
            sections: [
                'Introduction to [Topic]',
                'Core Concept 1',
                'Core Concept 2',
                'Core Concept 3',
                'Advanced Topics',
                'Tools and Resources',
                'Related Topics',
                'Conclusion'
            ],
            minSections: 6,
            maxSections: 15
        },
        seoGuidelines: [
            'Target broad, high-volume keywords',
            'Link to all cluster content',
            'Aim for 4000+ words',
            'Include visual content map',
            'Update regularly'
        ]
    },

    'news-article': {
        name: 'News Article',
        description: 'Timely, newsworthy content',
        type: 'blog',
        structure: {
            sections: [
                'Headline and Lead',
                'Background Context',
                'Key Details',
                'Expert Opinions/Quotes',
                'Impact and Implications',
                'What Happens Next',
                'Conclusion'
            ],
            minSections: 5,
            maxSections: 8
        },
        seoGuidelines: [
            'Use inverted pyramid structure',
            'Include publish date prominently',
            'Target trending keywords',
            'Add news schema markup',
            'Update with developments'
        ]
    },

    'case-study': {
        name: 'Case Study',
        description: 'Real-world example with results',
        type: 'blog',
        structure: {
            sections: [
                'Executive Summary',
                'Client Background',
                'Challenge/Problem',
                'Solution Approach',
                'Implementation',
                'Results and Metrics',
                'Key Takeaways',
                'Conclusion'
            ],
            minSections: 6,
            maxSections: 10
        },
        seoGuidelines: [
            'Include specific metrics and data',
            'Use before/after comparisons',
            'Add client testimonials',
            'Target industry-specific keywords',
            'Include downloadable PDF version'
        ]
    },

    'beginner-guide': {
        name: 'Beginner\'s Guide',
        description: 'Introductory content for newcomers',
        type: 'guide',
        structure: {
            sections: [
                'Introduction - What You\'ll Learn',
                'Basic Concepts Explained',
                'Getting Started',
                'Essential Tips for Beginners',
                'Common Beginner Mistakes',
                'Next Steps',
                'Additional Resources',
                'Conclusion'
            ],
            minSections: 5,
            maxSections: 10
        },
        seoGuidelines: [
            'Use simple, jargon-free language',
            'Target "beginner", "introduction", "basics" keywords',
            'Include glossary of terms',
            'Add visual aids and examples',
            'Link to advanced content'
        ]
    }
}

/**
 * Get template by name
 */
export function getTemplate(name: string): ContentTemplate | undefined {
    return contentTemplates[name]
}

/**
 * Get all template names
 */
export function getTemplateNames(): string[] {
    return Object.keys(contentTemplates)
}

/**
 * Get templates by type
 */
export function getTemplatesByType(type: ContentTemplate['type']): ContentTemplate[] {
    return Object.values(contentTemplates).filter(t => t.type === type)
}

/**
 * Generate outline from template
 */
export function generateOutlineFromTemplate(
    templateName: string,
    topic: string,
    targetKeyword: string,
    customSections?: string[]
): any {
    const template = getTemplate(templateName)
    if (!template) {
        throw new Error(`Template "${templateName}" not found`)
    }

    const sections = customSections || template.structure.sections

    return {
        title: `${topic} - ${template.name}`,
        introduction: `Learn everything you need to know about ${topic}. This comprehensive guide covers ${sections.length} key areas to help you master ${targetKeyword}.`,
        sections: sections.map(section => ({
            heading: section.replace('[Topic]', topic),
            subheadings: [],
            keyPoints: [
                `Key point 1 about ${section.toLowerCase()}`,
                `Key point 2 about ${section.toLowerCase()}`,
                `Key point 3 about ${section.toLowerCase()}`
            ]
        })),
        conclusion: `You now have a solid understanding of ${topic}. Apply these insights to improve your ${targetKeyword} strategy.`,
        callToAction: `Ready to get started with ${topic}? Take action today!`,
        template: templateName,
        seoGuidelines: template.seoGuidelines
    }
}
