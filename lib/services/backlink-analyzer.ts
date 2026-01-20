import * as cheerio from "cheerio"

// Types for backlink analysis
export interface BacklinkAnalysisResult {
    domain: string
    region?: string
    healthScore: number
    toxicScore: number
    qualityScore: number
    totalBacklinks: number
    dofollowCount: number
    nofollowCount: number
    toxicLinks: ToxicLink[]
    qualityMetrics: QualityMetrics
    lostLinks: LostLink[]
    anchorText: AnchorTextDistribution
    topReferrers: ReferringDomain[]
}

export interface ToxicLink {
    url: string
    domain: string
    toxicityScore: number // 0-100
    reasons: string[]
    firstSeen: string
    linkType: "dofollow" | "nofollow"
    anchorText: string
}

export interface QualityMetrics {
    averageDomainAuthority: number
    dofollowRatio: number
    relevanceScore: number
    distribution: {
        highQuality: number   // DA 60+
        mediumQuality: number // DA 30-59
        lowQuality: number    // DA 0-29
    }
    topTLDs: { tld: string; count: number }[]
}

export interface LostLink {
    url: string
    domain: string
    lastSeen: string
    reason: "removed" | "noindex" | "page_deleted" | "domain_expired"
    domainAuthority: number
    anchorText: string
    reclaimable: boolean
}

export interface AnchorTextDistribution {
    branded: { text: string; count: number; percentage: number }[]
    exact: { text: string; count: number; percentage: number }[]
    partial: { text: string; count: number; percentage: number }[]
    generic: { text: string; count: number; percentage: number }[]
    naked: { text: string; count: number; percentage: number }[]
    overOptimizationRisk: "low" | "medium" | "high"
    totalUniqueAnchors: number
}

export interface ReferringDomain {
    domain: string
    domainAuthority: number
    backlinks: number
    dofollowLinks: number
    firstSeen: string
    topAnchor: string
    traffic: number
}

// Spam indicators for toxic link detection
const SPAM_INDICATORS = [
    "casino", "poker", "gambling", "slot",
    "viagra", "cialis", "pharmacy",
    "payday", "loan", "credit",
    "adult", "xxx", "porn",
    "cheap", "free", "discount",
    "replica", "fake", "counterfeit"
]

const LOW_QUALITY_TLDS = [
    ".xyz", ".tk", ".ml", ".ga", ".cf", ".gq",
    ".pw", ".top", ".club", ".work", ".site"
]

/**
 * Backlink Analyzer Service
 * Analyzes backlink profiles for toxicity, quality, and opportunities
 */
class BacklinkAnalyzerService {
    /**
     * Run full backlink analysis for a domain
     * Note: In production, this would integrate with Ahrefs/Moz/SEMrush APIs
     */
    async analyzeBacklinks(domain: string, region?: string): Promise<BacklinkAnalysisResult> {
        // Normalize domain
        domain = this.normalizeDomain(domain)

        // Generate simulated backlink data
        // In production, this would call external APIs with region filter
        const backlinks = await this.getBacklinkData(domain, region)

        // Analyze toxicity
        const toxicLinks = this.identifyToxicLinks(backlinks)

        // Calculate quality metrics
        const qualityMetrics = this.calculateQualityMetrics(backlinks)

        // Find lost links
        const lostLinks = this.findLostLinks(backlinks)

        // Analyze anchor text
        const anchorText = this.analyzeAnchorText(backlinks)

        // Get top referrers
        const topReferrers = this.getTopReferrers(backlinks)

        // Calculate scores
        const toxicScore = this.calculateToxicScore(toxicLinks, backlinks.length)
        const qualityScore = qualityMetrics.averageDomainAuthority
        const healthScore = this.calculateHealthScore(toxicScore, qualityScore, anchorText)

        return {
            domain,
            region,
            healthScore: Math.round(healthScore),
            toxicScore: Math.round(toxicScore),
            qualityScore: Math.round(qualityScore),
            totalBacklinks: backlinks.length,
            dofollowCount: backlinks.filter(b => b.linkType === "dofollow").length,
            nofollowCount: backlinks.filter(b => b.linkType === "nofollow").length,
            toxicLinks: toxicLinks.slice(0, 20), // Top 20 toxic
            qualityMetrics,
            lostLinks: lostLinks.slice(0, 10), // Top 10 lost
            anchorText,
            topReferrers: topReferrers.slice(0, 15) // Top 15 referrers
        }
    }

    /**
     * Get backlink data
     * NOTE: This requires integration with a backlink API (Ahrefs, Moz, SEMrush)
     */
    private async getBacklinkData(domain: string, region?: string): Promise<SimulatedBacklink[]> {
        throw new Error(
            'Backlink analysis requires integration with Ahrefs, Moz, or SEMrush API. ' +
            'Configure API credentials in .env to enable this feature.'
        );
    }



    /**
     * Identify toxic backlinks
     */
    private identifyToxicLinks(backlinks: SimulatedBacklink[]): ToxicLink[] {
        const toxicLinks: ToxicLink[] = []

        for (const link of backlinks) {
            const reasons: string[] = []
            let toxicityScore = 0

            // Check domain authority
            if (link.domainAuthority < 10) {
                reasons.push("Very low domain authority")
                toxicityScore += 30
            }

            // Check for spam indicators in domain
            for (const indicator of SPAM_INDICATORS) {
                if (link.domain.toLowerCase().includes(indicator)) {
                    reasons.push(`Contains spam indicator: "${indicator}"`)
                    toxicityScore += 40
                    break
                }
            }

            // Check for low-quality TLDs
            for (const tld of LOW_QUALITY_TLDS) {
                if (link.domain.endsWith(tld)) {
                    reasons.push(`Low-quality TLD: ${tld}`)
                    toxicityScore += 25
                    break
                }
            }

            // Check for very low traffic
            if (link.traffic < 100) {
                reasons.push("Extremely low traffic site")
                toxicityScore += 15
            }

            // Check for suspicious patterns
            if (link.domain.match(/\d{4,}/)) {
                reasons.push("Domain contains suspicious number pattern")
                toxicityScore += 20
            }

            if (toxicityScore > 30) {
                toxicLinks.push({
                    url: link.url,
                    domain: link.domain,
                    toxicityScore: Math.min(100, toxicityScore),
                    reasons,
                    firstSeen: link.firstSeen,
                    linkType: link.linkType,
                    anchorText: link.anchorText
                })
            }
        }

        return toxicLinks.sort((a, b) => b.toxicityScore - a.toxicityScore)
    }

    /**
     * Calculate quality metrics
     */
    private calculateQualityMetrics(backlinks: SimulatedBacklink[]): QualityMetrics {
        const totalDA = backlinks.reduce((sum, b) => sum + b.domainAuthority, 0)
        const averageDA = backlinks.length > 0 ? totalDA / backlinks.length : 0

        const dofollowCount = backlinks.filter(b => b.linkType === "dofollow").length
        const dofollowRatio = backlinks.length > 0 ? dofollowCount / backlinks.length : 0

        const distribution = {
            highQuality: backlinks.filter(b => b.domainAuthority >= 60).length,
            mediumQuality: backlinks.filter(b => b.domainAuthority >= 30 && b.domainAuthority < 60).length,
            lowQuality: backlinks.filter(b => b.domainAuthority < 30).length
        }

        // Count TLDs
        const tldCounts: Record<string, number> = {}
        for (const link of backlinks) {
            const tld = "." + link.domain.split(".").pop()
            tldCounts[tld] = (tldCounts[tld] || 0) + 1
        }

        const topTLDs = Object.entries(tldCounts)
            .map(([tld, count]) => ({ tld, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)

        return {
            averageDomainAuthority: Math.round(averageDA),
            dofollowRatio: Math.round(dofollowRatio * 100) / 100,
            relevanceScore: 65 + Math.random() * 20, // Simulated
            distribution,
            topTLDs
        }
    }

    /**
     * Find lost/broken backlinks
     */
    private findLostLinks(backlinks: SimulatedBacklink[]): LostLink[] {
        return backlinks
            .filter(b => !b.isActive)
            .map(b => ({
                url: b.url,
                domain: b.domain,
                lastSeen: b.lastSeen,
                reason: this.getLostReason(),
                domainAuthority: b.domainAuthority,
                anchorText: b.anchorText,
                reclaimable: b.domainAuthority > 20 && Math.random() > 0.3
            }))
    }

    private getLostReason(): LostLink["reason"] {
        const reasons: LostLink["reason"][] = ["removed", "noindex", "page_deleted", "domain_expired"]
        return reasons[Math.floor(Math.random() * reasons.length)]
    }

    /**
     * Analyze anchor text distribution
     */
    private analyzeAnchorText(backlinks: SimulatedBacklink[]): AnchorTextDistribution {
        const anchorCounts: Record<string, number> = {}

        for (const link of backlinks) {
            const anchor = link.anchorText.toLowerCase()
            anchorCounts[anchor] = (anchorCounts[anchor] || 0) + 1
        }

        const total = backlinks.length
        const toDistribution = (anchors: string[]) =>
            anchors.map(text => ({
                text,
                count: anchorCounts[text.toLowerCase()] || 0,
                percentage: Math.round(((anchorCounts[text.toLowerCase()] || 0) / total) * 100)
            })).filter(a => a.count > 0)

        // Categorize anchors
        const branded: string[] = []
        const exact: string[] = []
        const partial: string[] = []
        const generic: string[] = []
        const naked: string[] = []

        const genericTerms = ["click here", "read more", "learn more", "this website", "here", "website"]

        for (const anchor of Object.keys(anchorCounts)) {
            if (anchor.match(/^https?:\/\//)) {
                naked.push(anchor)
            } else if (genericTerms.includes(anchor)) {
                generic.push(anchor)
            } else if (anchor.split(" ").length === 1) {
                branded.push(anchor)
            } else if (anchor.split(" ").length <= 3) {
                partial.push(anchor)
            } else {
                exact.push(anchor)
            }
        }

        // Calculate over-optimization risk
        const exactRatio = exact.length / Object.keys(anchorCounts).length
        const overOptimizationRisk: "low" | "medium" | "high" =
            exactRatio > 0.5 ? "high" : exactRatio > 0.3 ? "medium" : "low"

        return {
            branded: toDistribution(branded),
            exact: toDistribution(exact),
            partial: toDistribution(partial),
            generic: toDistribution(generic),
            naked: toDistribution(naked),
            overOptimizationRisk,
            totalUniqueAnchors: Object.keys(anchorCounts).length
        }
    }

    /**
     * Get top referring domains
     */
    private getTopReferrers(backlinks: SimulatedBacklink[]): ReferringDomain[] {
        const domainMap: Record<string, ReferringDomain> = {}

        for (const link of backlinks) {
            if (!domainMap[link.domain]) {
                domainMap[link.domain] = {
                    domain: link.domain,
                    domainAuthority: link.domainAuthority,
                    backlinks: 0,
                    dofollowLinks: 0,
                    firstSeen: link.firstSeen,
                    topAnchor: link.anchorText,
                    traffic: link.traffic
                }
            }
            domainMap[link.domain].backlinks++
            if (link.linkType === "dofollow") {
                domainMap[link.domain].dofollowLinks++
            }
        }

        return Object.values(domainMap)
            .sort((a, b) => b.domainAuthority - a.domainAuthority)
    }

    /**
     * Calculate toxic score (percentage of toxic links)
     */
    private calculateToxicScore(toxicLinks: ToxicLink[], totalLinks: number): number {
        if (totalLinks === 0) return 0
        return (toxicLinks.length / totalLinks) * 100
    }

    /**
     * Calculate overall health score
     */
    private calculateHealthScore(
        toxicScore: number,
        qualityScore: number,
        anchorText: AnchorTextDistribution
    ): number {
        let score = 100

        // Penalize for toxic links
        score -= toxicScore * 0.5

        // Boost for quality
        score += (qualityScore - 50) * 0.3

        // Penalize for over-optimization
        if (anchorText.overOptimizationRisk === "high") score -= 15
        else if (anchorText.overOptimizationRisk === "medium") score -= 8

        return Math.max(0, Math.min(100, score))
    }

    /**
     * Generate disavow file content
     */
    generateDisavowFile(toxicLinks: ToxicLink[]): string {
        const lines = [
            "# Disavow file generated by SEO Automation Platform",
            `# Generated on: ${new Date().toISOString()}`,
            `# Total toxic links: ${toxicLinks.length}`,
            ""
        ]

        // Group by domain
        const domains = new Set<string>()
        for (const link of toxicLinks) {
            if (link.toxicityScore >= 70) {
                domains.add(link.domain)
            }
        }

        // Add domain-level disavows for high-toxicity sites
        for (const domain of domains) {
            lines.push(`domain:${domain}`)
        }

        // Add individual URLs for medium-toxicity links
        for (const link of toxicLinks) {
            if (link.toxicityScore < 70 && link.toxicityScore >= 50) {
                lines.push(link.url)
            }
        }

        return lines.join("\n")
    }

    private normalizeDomain(domain: string): string {
        return domain
            .replace(/^https?:\/\//, "")
            .replace(/^www\./, "")
            .replace(/\/$/, "")
            .toLowerCase()
    }
}

// Internal type for simulated data
interface SimulatedBacklink {
    url: string
    domain: string
    domainAuthority: number
    traffic: number
    linkType: "dofollow" | "nofollow"
    anchorText: string
    firstSeen: string
    lastSeen: string
    isActive: boolean
    spamScore?: number
}

export const backlinkAnalyzerService = new BacklinkAnalyzerService()
