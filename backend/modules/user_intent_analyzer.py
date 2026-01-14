"""
User Intent Analyzer Module

Analyzes search queries to determine user intent:
- Informational
- Navigational
- Commercial Investigation
- Transactional
"""

import re
from typing import Dict, List, Tuple
from enum import Enum


class SearchIntent(Enum):
    """Search intent types"""
    INFORMATIONAL = "informational"
    NAVIGATIONAL = "navigational"
    COMMERCIAL = "commercial_investigation"
    TRANSACTIONAL = "transactional"


class UserIntentAnalyzer:
    """Analyzes user search intent based on query patterns and SERP features"""
    
    # Keyword modifiers for each intent type
    INFORMATIONAL_MODIFIERS = [
        'how', 'what', 'why', 'when', 'where', 'who',
        'guide', 'tutorial', 'tips', 'learn', 'explain',
        'definition', 'meaning', 'examples', 'benefits',
        'difference between', 'vs', 'comparison'
    ]
    
    NAVIGATIONAL_MODIFIERS = [
        'login', 'sign in', 'official site', 'website',
        'homepage', 'portal', 'dashboard', 'account'
    ]
    
    COMMERCIAL_MODIFIERS = [
        'best', 'top', 'review', 'reviews', 'comparison',
        'compare', 'vs', 'versus', 'alternative', 'alternatives',
        'cheapest', 'affordable', 'recommended', 'rating'
    ]
    
    TRANSACTIONAL_MODIFIERS = [
        'buy', 'purchase', 'order', 'shop', 'price',
        'cost', 'cheap', 'deal', 'discount', 'coupon',
        'subscribe', 'download', 'get', 'hire', 'book',
        'reserve', 'appointment', 'quote'
    ]
    
    def __init__(self):
        """Initialize the analyzer"""
        self.intent_patterns = self._compile_patterns()
    
    def _compile_patterns(self) -> Dict[SearchIntent, List[re.Pattern]]:
        """Compile regex patterns for each intent type"""
        patterns = {}
        
        for intent, modifiers in [
            (SearchIntent.INFORMATIONAL, self.INFORMATIONAL_MODIFIERS),
            (SearchIntent.NAVIGATIONAL, self.NAVIGATIONAL_MODIFIERS),
            (SearchIntent.COMMERCIAL, self.COMMERCIAL_MODIFIERS),
            (SearchIntent.TRANSACTIONAL, self.TRANSACTIONAL_MODIFIERS)
        ]:
            patterns[intent] = [
                re.compile(r'\b' + re.escape(mod) + r'\b', re.IGNORECASE)
                for mod in modifiers
            ]
        
        return patterns
    
    def analyze_query(self, query: str) -> Dict:
        """
        Analyze a search query and determine its intent
        
        Args:
            query: The search query to analyze
            
        Returns:
            Dictionary containing:
            - primary_intent: The most likely intent
            - confidence: Confidence score (0-1)
            - intent_scores: Scores for all intent types
            - matched_modifiers: Keywords that matched
        """
        query_lower = query.lower().strip()
        
        # Calculate scores for each intent
        intent_scores = {}
        matched_modifiers = {}
        
        for intent, patterns in self.intent_patterns.items():
            matches = []
            for pattern in patterns:
                if pattern.search(query_lower):
                    matches.append(pattern.pattern.strip(r'\b'))
            
            intent_scores[intent.value] = len(matches)
            matched_modifiers[intent.value] = matches
        
        # Determine primary intent
        if all(score == 0 for score in intent_scores.values()):
            # No clear modifiers - use heuristics
            primary_intent, confidence = self._apply_heuristics(query_lower)
        else:
            # Get intent with highest score
            max_score = max(intent_scores.values())
            primary_intent = max(intent_scores.items(), key=lambda x: x[1])[0]
            
            # Calculate confidence based on score distribution
            total_score = sum(intent_scores.values())
            confidence = max_score / total_score if total_score > 0 else 0.5
        
        return {
            'query': query,
            'primary_intent': primary_intent,
            'confidence': round(confidence, 2),
            'intent_scores': intent_scores,
            'matched_modifiers': matched_modifiers[primary_intent] if primary_intent in matched_modifiers else [],
            'recommendations': self._get_recommendations(primary_intent)
        }
    
    def _apply_heuristics(self, query: str) -> Tuple[str, float]:
        """
        Apply heuristic rules when no clear modifiers are found
        
        Args:
            query: The search query
            
        Returns:
            Tuple of (intent, confidence)
        """
        # Question words suggest informational
        if query.startswith(('how ', 'what ', 'why ', 'when ', 'where ')):
            return SearchIntent.INFORMATIONAL.value, 0.8
        
        # Brand names suggest navigational
        # (In production, check against brand database)
        if len(query.split()) <= 2 and not any(c in query for c in ['?', 'how', 'what']):
            return SearchIntent.NAVIGATIONAL.value, 0.6
        
        # Multiple words with no modifiers - likely informational
        if len(query.split()) >= 3:
            return SearchIntent.INFORMATIONAL.value, 0.5
        
        # Default to informational with low confidence
        return SearchIntent.INFORMATIONAL.value, 0.4
    
    def _get_recommendations(self, intent: str) -> Dict:
        """
        Get content recommendations based on intent
        
        Args:
            intent: The detected intent type
            
        Returns:
            Dictionary with content recommendations
        """
        recommendations = {
            SearchIntent.INFORMATIONAL.value: {
                'content_type': 'Blog post, guide, tutorial, how-to article',
                'format': 'Long-form content (1,500-3,000 words)',
                'elements': [
                    'Clear headings and subheadings',
                    'Step-by-step instructions',
                    'Examples and visuals',
                    'FAQ section',
                    'Related articles'
                ],
                'cta': 'Subscribe to newsletter, download guide, read related content'
            },
            SearchIntent.NAVIGATIONAL.value: {
                'content_type': 'Homepage, brand page, login page',
                'format': 'Clear navigation and branding',
                'elements': [
                    'Prominent brand name',
                    'Clear navigation menu',
                    'Search functionality',
                    'Quick links to popular pages'
                ],
                'cta': 'Sign up, login, explore products/services'
            },
            SearchIntent.COMMERCIAL.value: {
                'content_type': 'Comparison article, review, buyer\'s guide',
                'format': 'Structured comparison (1,500-2,500 words)',
                'elements': [
                    'Comparison tables',
                    'Pros and cons lists',
                    'Product specifications',
                    'Expert opinions',
                    'User reviews'
                ],
                'cta': 'Read full review, compare products, get pricing'
            },
            SearchIntent.TRANSACTIONAL.value: {
                'content_type': 'Product page, service page, pricing page',
                'format': 'Conversion-focused layout',
                'elements': [
                    'Clear product/service details',
                    'Pricing information',
                    'Trust signals (reviews, guarantees)',
                    'Strong call-to-action',
                    'Easy checkout process'
                ],
                'cta': 'Buy now, add to cart, get quote, subscribe'
            }
        }
        
        return recommendations.get(intent, recommendations[SearchIntent.INFORMATIONAL.value])
    
    def analyze_batch(self, queries: List[str]) -> List[Dict]:
        """
        Analyze multiple queries at once
        
        Args:
            queries: List of search queries
            
        Returns:
            List of analysis results
        """
        return [self.analyze_query(query) for query in queries]
    
    def get_intent_distribution(self, queries: List[str]) -> Dict:
        """
        Get distribution of intents across multiple queries
        
        Args:
            queries: List of search queries
            
        Returns:
            Dictionary with intent distribution statistics
        """
        results = self.analyze_batch(queries)
        
        distribution = {
            SearchIntent.INFORMATIONAL.value: 0,
            SearchIntent.NAVIGATIONAL.value: 0,
            SearchIntent.COMMERCIAL.value: 0,
            SearchIntent.TRANSACTIONAL.value: 0
        }
        
        for result in results:
            distribution[result['primary_intent']] += 1
        
        total = len(queries)
        percentages = {
            intent: round((count / total) * 100, 1)
            for intent, count in distribution.items()
        }
        
        return {
            'total_queries': total,
            'distribution': distribution,
            'percentages': percentages,
            'dominant_intent': max(distribution.items(), key=lambda x: x[1])[0]
        }


# Example usage
if __name__ == "__main__":
    analyzer = UserIntentAnalyzer()
    
    # Test queries
    test_queries = [
        "how to make coffee",
        "best coffee maker 2024",
        "buy espresso machine",
        "starbucks login",
        "what is seo",
        "seo tools comparison",
        "hire seo consultant"
    ]
    
    print("=== Individual Query Analysis ===\n")
    for query in test_queries:
        result = analyzer.analyze_query(query)
        print(f"Query: {result['query']}")
        print(f"Intent: {result['primary_intent']} (confidence: {result['confidence']})")
        print(f"Matched modifiers: {result['matched_modifiers']}")
        print(f"Content type: {result['recommendations']['content_type']}\n")
    
    print("\n=== Intent Distribution ===\n")
    distribution = analyzer.get_intent_distribution(test_queries)
    print(f"Total queries: {distribution['total_queries']}")
    print(f"Dominant intent: {distribution['dominant_intent']}")
    print("\nDistribution:")
    for intent, percentage in distribution['percentages'].items():
        print(f"  {intent}: {percentage}%")
