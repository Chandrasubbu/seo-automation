"""
Topic Cluster Generator Module

Generates topic cluster architecture with pillar pages and cluster content mapping.
Creates hub-and-spoke content structures for topical authority.
"""

from typing import Dict, List, Set, Optional
from dataclasses import dataclass, field
import json


@dataclass
class ClusterContent:
    """Represents a cluster content piece"""
    title: str
    target_keyword: str
    search_volume: int = 0
    difficulty: str = "medium"
    word_count: int = 1500
    content_type: str = "blog_post"
    url_slug: str = ""
    
    def __post_init__(self):
        if not self.url_slug:
            self.url_slug = self.title.lower().replace(' ', '-')


@dataclass
class PillarPage:
    """Represents a pillar page"""
    title: str
    target_keyword: str
    description: str
    clusters: List[ClusterContent] = field(default_factory=list)
    word_count: int = 3000
    url_slug: str = ""
    
    def __post_init__(self):
        if not self.url_slug:
            self.url_slug = self.title.lower().replace(' ', '-')
    
    def add_cluster(self, cluster: ClusterContent):
        """Add a cluster content piece to this pillar"""
        self.clusters.append(cluster)
    
    def get_cluster_count(self) -> int:
        """Get number of cluster pieces"""
        return len(self.clusters)


class TopicClusterGenerator:
    """Generates topic cluster structures for content strategy"""
    
    # Common subtopic patterns for different industries
    SUBTOPIC_TEMPLATES = {
        'guide': [
            'What is {topic}',
            'How to {topic}',
            '{topic} for beginners',
            '{topic} best practices',
            '{topic} tips and tricks',
            '{topic} tools and resources',
            '{topic} examples',
            '{topic} mistakes to avoid',
            '{topic} checklist',
            '{topic} step by step guide'
        ],
        'product': [
            'Best {topic}',
            '{topic} reviews',
            '{topic} comparison',
            '{topic} pricing',
            '{topic} features',
            '{topic} alternatives',
            'How to choose {topic}',
            '{topic} for small business',
            '{topic} for enterprise',
            '{topic} vs competitors'
        ],
        'service': [
            '{topic} services',
            '{topic} cost',
            'How to hire {topic}',
            '{topic} benefits',
            '{topic} process',
            '{topic} case studies',
            '{topic} ROI',
            '{topic} consultant',
            '{topic} agency',
            'DIY {topic} vs professional'
        ]
    }
    
    def __init__(self):
        """Initialize the generator"""
        self.pillars: List[PillarPage] = []
    
    def create_pillar(
        self,
        title: str,
        target_keyword: str,
        description: str,
        word_count: int = 3000
    ) -> PillarPage:
        """
        Create a new pillar page
        
        Args:
            title: Pillar page title
            target_keyword: Main keyword to target
            description: Brief description of the pillar topic
            word_count: Target word count (default: 3000)
            
        Returns:
            PillarPage object
        """
        pillar = PillarPage(
            title=title,
            target_keyword=target_keyword,
            description=description,
            word_count=word_count
        )
        self.pillars.append(pillar)
        return pillar
    
    def generate_cluster_ideas(
        self,
        pillar_topic: str,
        template_type: str = 'guide',
        count: int = 10
    ) -> List[str]:
        """
        Generate cluster content ideas based on pillar topic
        
        Args:
            pillar_topic: The main pillar topic
            template_type: Type of template to use (guide, product, service)
            count: Number of ideas to generate
            
        Returns:
            List of cluster content titles
        """
        templates = self.SUBTOPIC_TEMPLATES.get(template_type, self.SUBTOPIC_TEMPLATES['guide'])
        ideas = []
        
        for template in templates[:count]:
            idea = template.format(topic=pillar_topic)
            ideas.append(idea)
        
        return ideas
    
    def add_clusters_to_pillar(
        self,
        pillar: PillarPage,
        cluster_data: List[Dict]
    ):
        """
        Add cluster content pieces to a pillar page
        
        Args:
            pillar: The pillar page to add clusters to
            cluster_data: List of dictionaries with cluster information
        """
        for data in cluster_data:
            cluster = ClusterContent(
                title=data.get('title', ''),
                target_keyword=data.get('target_keyword', ''),
                search_volume=data.get('search_volume', 0),
                difficulty=data.get('difficulty', 'medium'),
                word_count=data.get('word_count', 1500),
                content_type=data.get('content_type', 'blog_post')
            )
            pillar.add_cluster(cluster)
    
    def generate_internal_linking_strategy(self, pillar: PillarPage) -> Dict:
        """
        Generate internal linking recommendations for a topic cluster
        
        Args:
            pillar: The pillar page
            
        Returns:
            Dictionary with linking strategy
        """
        strategy = {
            'pillar_to_clusters': [],
            'clusters_to_pillar': [],
            'cluster_to_cluster': []
        }
        
        # Pillar to all clusters
        for cluster in pillar.clusters:
            strategy['pillar_to_clusters'].append({
                'from': pillar.url_slug,
                'to': cluster.url_slug,
                'anchor_text': cluster.target_keyword,
                'context': f'Link from pillar page section about {cluster.title}'
            })
        
        # All clusters back to pillar
        for cluster in pillar.clusters:
            strategy['clusters_to_pillar'].append({
                'from': cluster.url_slug,
                'to': pillar.url_slug,
                'anchor_text': pillar.target_keyword,
                'context': f'Link to main {pillar.title} guide'
            })
        
        # Related clusters to each other
        for i, cluster1 in enumerate(pillar.clusters):
            for cluster2 in pillar.clusters[i+1:i+3]:  # Link to next 2 clusters
                if cluster1 != cluster2:
                    strategy['cluster_to_cluster'].append({
                        'from': cluster1.url_slug,
                        'to': cluster2.url_slug,
                        'anchor_text': cluster2.target_keyword,
                        'context': f'Related topic link'
                    })
        
        return strategy
    
    def export_cluster_map(self, pillar: PillarPage, format: str = 'json') -> str:
        """
        Export topic cluster map in various formats
        
        Args:
            pillar: The pillar page to export
            format: Export format (json, markdown, mermaid)
            
        Returns:
            Formatted string
        """
        if format == 'json':
            return self._export_json(pillar)
        elif format == 'markdown':
            return self._export_markdown(pillar)
        elif format == 'mermaid':
            return self._export_mermaid(pillar)
        else:
            return self._export_json(pillar)
    
    def _export_json(self, pillar: PillarPage) -> str:
        """Export as JSON"""
        data = {
            'pillar': {
                'title': pillar.title,
                'target_keyword': pillar.target_keyword,
                'description': pillar.description,
                'word_count': pillar.word_count,
                'url_slug': pillar.url_slug
            },
            'clusters': [
                {
                    'title': c.title,
                    'target_keyword': c.target_keyword,
                    'search_volume': c.search_volume,
                    'difficulty': c.difficulty,
                    'word_count': c.word_count,
                    'url_slug': c.url_slug
                }
                for c in pillar.clusters
            ],
            'internal_linking': self.generate_internal_linking_strategy(pillar)
        }
        return json.dumps(data, indent=2)
    
    def _export_markdown(self, pillar: PillarPage) -> str:
        """Export as Markdown table"""
        md = f"# Topic Cluster: {pillar.title}\n\n"
        md += f"**Target Keyword:** {pillar.target_keyword}\n\n"
        md += f"**Description:** {pillar.description}\n\n"
        md += f"**Word Count:** {pillar.word_count}\n\n"
        md += "## Cluster Content\n\n"
        md += "| Title | Target Keyword | Search Volume | Difficulty | Word Count |\n"
        md += "|-------|----------------|---------------|------------|------------|\n"
        
        for cluster in pillar.clusters:
            md += f"| {cluster.title} | {cluster.target_keyword} | "
            md += f"{cluster.search_volume} | {cluster.difficulty} | {cluster.word_count} |\n"
        
        return md
    
    def _export_mermaid(self, pillar: PillarPage) -> str:
        """Export as Mermaid diagram"""
        mermaid = "```mermaid\ngraph TD\n"
        
        # Pillar node
        pillar_id = "A"
        mermaid += f'    {pillar_id}["{pillar.title}"]\n'
        
        # Cluster nodes
        for i, cluster in enumerate(pillar.clusters):
            cluster_id = chr(66 + i)  # B, C, D, etc.
            mermaid += f'    {cluster_id}["{cluster.title}"]\n'
        
        # Connections
        for i in range(len(pillar.clusters)):
            cluster_id = chr(66 + i)
            mermaid += f'    {pillar_id} --> {cluster_id}\n'
            mermaid += f'    {cluster_id} --> {pillar_id}\n'
        
        # Styling
        mermaid += f'\n    style {pillar_id} fill:#4CAF50,stroke:#2E7D32,stroke-width:3px,color:#fff\n'
        for i in range(len(pillar.clusters)):
            cluster_id = chr(66 + i)
            mermaid += f'    style {cluster_id} fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff\n'
        
        mermaid += "```"
        return mermaid
    
    def analyze_cluster_coverage(self, pillar: PillarPage) -> Dict:
        """
        Analyze the coverage and completeness of a topic cluster
        
        Args:
            pillar: The pillar page to analyze
            
        Returns:
            Dictionary with analysis results
        """
        total_clusters = len(pillar.clusters)
        total_words = pillar.word_count + sum(c.word_count for c in pillar.clusters)
        
        difficulty_distribution = {}
        for cluster in pillar.clusters:
            diff = cluster.difficulty
            difficulty_distribution[diff] = difficulty_distribution.get(diff, 0) + 1
        
        return {
            'pillar_title': pillar.title,
            'total_clusters': total_clusters,
            'total_word_count': total_words,
            'average_cluster_length': round(sum(c.word_count for c in pillar.clusters) / total_clusters) if total_clusters > 0 else 0,
            'difficulty_distribution': difficulty_distribution,
            'completeness_score': self._calculate_completeness(pillar),
            'recommendations': self._get_coverage_recommendations(pillar)
        }
    
    def _calculate_completeness(self, pillar: PillarPage) -> float:
        """Calculate completeness score (0-100)"""
        score = 0
        
        # Minimum 10 clusters recommended
        if len(pillar.clusters) >= 10:
            score += 40
        else:
            score += (len(pillar.clusters) / 10) * 40
        
        # Pillar word count (3000+ recommended)
        if pillar.word_count >= 3000:
            score += 30
        else:
            score += (pillar.word_count / 3000) * 30
        
        # Cluster word counts (1500+ recommended)
        adequate_clusters = sum(1 for c in pillar.clusters if c.word_count >= 1500)
        if pillar.clusters:
            score += (adequate_clusters / len(pillar.clusters)) * 30
        
        return round(score, 1)
    
    def _get_coverage_recommendations(self, pillar: PillarPage) -> List[str]:
        """Get recommendations for improving cluster coverage"""
        recommendations = []
        
        if len(pillar.clusters) < 10:
            recommendations.append(f"Add {10 - len(pillar.clusters)} more cluster pieces (minimum 10 recommended)")
        
        if pillar.word_count < 3000:
            recommendations.append(f"Increase pillar word count by {3000 - pillar.word_count} words")
        
        short_clusters = [c for c in pillar.clusters if c.word_count < 1500]
        if short_clusters:
            recommendations.append(f"Expand {len(short_clusters)} cluster pieces to at least 1,500 words")
        
        if not recommendations:
            recommendations.append("Cluster coverage is excellent! Focus on content quality and promotion.")
        
        return recommendations


# Example usage
if __name__ == "__main__":
    generator = TopicClusterGenerator()
    
    # Create a pillar page
    pillar = generator.create_pillar(
        title="Complete Guide to Email Marketing",
        target_keyword="email marketing",
        description="Comprehensive guide covering all aspects of email marketing strategy, implementation, and optimization"
    )
    
    # Generate cluster ideas
    cluster_ideas = generator.generate_cluster_ideas("email marketing", template_type='guide', count=12)
    
    # Add clusters with data
    cluster_data = [
        {'title': idea, 'target_keyword': idea.lower(), 'search_volume': 1000 + i*100, 'difficulty': 'medium'}
        for i, idea in enumerate(cluster_ideas)
    ]
    generator.add_clusters_to_pillar(pillar, cluster_data)
    
    # Export in different formats
    print("=== JSON Export ===")
    print(generator.export_cluster_map(pillar, format='json'))
    
    print("\n=== Markdown Export ===")
    print(generator.export_cluster_map(pillar, format='markdown'))
    
    print("\n=== Mermaid Diagram ===")
    print(generator.export_cluster_map(pillar, format='mermaid'))
    
    print("\n=== Coverage Analysis ===")
    analysis = generator.analyze_cluster_coverage(pillar)
    print(json.dumps(analysis, indent=2))
