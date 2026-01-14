"""
Content Quality Checker Module

Evaluates content quality based on:
- E-E-A-T principles (Experience, Expertise, Authoritativeness, Trustworthiness)
- Readability metrics
- SEO optimization
- Content completeness
"""

import re
from typing import Dict, List, Tuple
from dataclasses import dataclass
import math


@dataclass
class QualityScore:
    """Content quality score breakdown"""
    overall_score: float
    readability_score: float
    eeat_score: float
    seo_score: float
    completeness_score: float
    grade: str
    recommendations: List[str]


class ContentQualityChecker:
    """Analyzes and scores content quality"""
    
    # E-E-A-T indicators
    EXPERIENCE_INDICATORS = [
        'i tested', 'i tried', 'in my experience', 'i found',
        'i used', 'i noticed', 'i discovered', 'my results',
        'case study', 'real-world example', 'personal experience'
    ]
    
    EXPERTISE_INDICATORS = [
        'certified', 'expert', 'professional', 'years of experience',
        'specialist', 'authority', 'research shows', 'studies indicate',
        'according to', 'data shows', 'statistics reveal'
    ]
    
    TRUST_INDICATORS = [
        'source:', 'reference:', 'citation:', 'https://',
        'published', 'peer-reviewed', 'verified', 'guaranteed',
        'privacy policy', 'terms of service', 'contact us'
    ]
    
    def __init__(self):
        """Initialize the checker"""
        pass
    
    def check_content(self, content: str, metadata: Dict = None) -> QualityScore:
        """
        Comprehensive content quality check
        
        Args:
            content: The content text to analyze
            metadata: Optional metadata (title, meta_description, keywords, etc.)
            
        Returns:
            QualityScore object with detailed breakdown
        """
        if metadata is None:
            metadata = {}
        
        # Calculate individual scores
        readability = self.calculate_readability(content)
        eeat = self.calculate_eeat_score(content)
        seo = self.calculate_seo_score(content, metadata)
        completeness = self.calculate_completeness(content, metadata)
        
        # Calculate overall score (weighted average)
        overall = (
            readability * 0.25 +
            eeat * 0.30 +
            seo * 0.25 +
            completeness * 0.20
        )
        
        # Determine grade
        grade = self._get_grade(overall)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            readability, eeat, seo, completeness, content, metadata
        )
        
        return QualityScore(
            overall_score=round(overall, 1),
            readability_score=round(readability, 1),
            eeat_score=round(eeat, 1),
            seo_score=round(seo, 1),
            completeness_score=round(completeness, 1),
            grade=grade,
            recommendations=recommendations
        )
    
    def calculate_readability(self, content: str) -> float:
        """
        Calculate readability score based on multiple metrics
        
        Args:
            content: The content text
            
        Returns:
            Readability score (0-100)
        """
        # Clean content
        sentences = self._split_sentences(content)
        words = self._split_words(content)
        syllables = sum(self._count_syllables(word) for word in words)
        
        if not sentences or not words:
            return 0
        
        # Flesch Reading Ease
        avg_sentence_length = len(words) / len(sentences)
        avg_syllables_per_word = syllables / len(words)
        
        flesch = 206.835 - 1.015 * avg_sentence_length - 84.6 * avg_syllables_per_word
        flesch = max(0, min(100, flesch))  # Clamp to 0-100
        
        # Additional readability factors
        score = flesch * 0.6  # Base score from Flesch
        
        # Bonus for short paragraphs
        paragraphs = content.split('\n\n')
        avg_paragraph_length = len(words) / len(paragraphs) if paragraphs else 0
        if avg_paragraph_length < 100:
            score += 10
        elif avg_paragraph_length < 150:
            score += 5
        
        # Bonus for using lists
        if re.search(r'(\n-|\n\d+\.|\n•)', content):
            score += 10
        
        # Bonus for headings
        if re.search(r'(^|\n)#{1,6}\s', content):
            score += 10
        
        # Penalty for very long sentences
        long_sentences = sum(1 for s in sentences if len(s.split()) > 25)
        if long_sentences > len(sentences) * 0.3:
            score -= 10
        
        return max(0, min(100, score))
    
    def calculate_eeat_score(self, content: str) -> float:
        """
        Calculate E-E-A-T score
        
        Args:
            content: The content text
            
        Returns:
            E-E-A-T score (0-100)
        """
        content_lower = content.lower()
        score = 0
        
        # Experience indicators (30 points)
        experience_count = sum(
            1 for indicator in self.EXPERIENCE_INDICATORS
            if indicator in content_lower
        )
        score += min(30, experience_count * 5)
        
        # Expertise indicators (30 points)
        expertise_count = sum(
            1 for indicator in self.EXPERTISE_INDICATORS
            if indicator in content_lower
        )
        score += min(30, expertise_count * 5)
        
        # Trust indicators (40 points)
        trust_count = sum(
            1 for indicator in self.TRUST_INDICATORS
            if indicator in content_lower
        )
        score += min(40, trust_count * 4)
        
        # Bonus for citations/sources
        citation_count = len(re.findall(r'\[?\d+\]?|source:|reference:', content_lower))
        score += min(10, citation_count * 2)
        
        # Bonus for external links to authoritative sources
        authoritative_domains = ['edu', 'gov', 'org']
        for domain in authoritative_domains:
            if f'.{domain}' in content_lower:
                score += 5
        
        return min(100, score)
    
    def calculate_seo_score(self, content: str, metadata: Dict) -> float:
        """
        Calculate SEO optimization score
        
        Args:
            content: The content text
            metadata: Metadata dictionary
            
        Returns:
            SEO score (0-100)
        """
        score = 0
        target_keyword = metadata.get('target_keyword', '').lower()
        title = metadata.get('title', '').lower()
        meta_description = metadata.get('meta_description', '').lower()
        
        if not target_keyword:
            return 50  # Neutral score if no keyword provided
        
        content_lower = content.lower()
        
        # Keyword in title (15 points)
        if target_keyword in title:
            score += 15
        
        # Keyword in first paragraph (10 points)
        first_para = content[:500].lower()
        if target_keyword in first_para:
            score += 10
        
        # Keyword in meta description (10 points)
        if target_keyword in meta_description:
            score += 10
        
        # Keyword density (15 points)
        keyword_count = content_lower.count(target_keyword)
        word_count = len(self._split_words(content))
        if word_count > 0:
            density = (keyword_count / word_count) * 100
            if 0.5 <= density <= 2.5:  # Optimal range
                score += 15
            elif density < 0.5:
                score += 5
        
        # Headings present (10 points)
        headings = re.findall(r'(^|\n)#{1,6}\s.+', content)
        if len(headings) >= 3:
            score += 10
        elif len(headings) >= 1:
            score += 5
        
        # Content length (15 points)
        if word_count >= 1500:
            score += 15
        elif word_count >= 1000:
            score += 10
        elif word_count >= 500:
            score += 5
        
        # Internal links (10 points)
        internal_links = len(re.findall(r'\[.+?\]\(.+?\)', content))
        if internal_links >= 5:
            score += 10
        elif internal_links >= 3:
            score += 7
        elif internal_links >= 1:
            score += 4
        
        # External links (10 points)
        external_links = len(re.findall(r'https?://', content))
        if external_links >= 3:
            score += 10
        elif external_links >= 1:
            score += 5
        
        # Images/media (5 points)
        if '![' in content or '<img' in content:
            score += 5
        
        return min(100, score)
    
    def calculate_completeness(self, content: str, metadata: Dict) -> float:
        """
        Calculate content completeness score
        
        Args:
            content: The content text
            metadata: Metadata dictionary
            
        Returns:
            Completeness score (0-100)
        """
        score = 0
        
        # Has introduction (15 points)
        if len(content) > 200:
            score += 15
        
        # Has headings/structure (20 points)
        headings = re.findall(r'(^|\n)#{1,6}\s.+', content)
        if len(headings) >= 5:
            score += 20
        elif len(headings) >= 3:
            score += 15
        elif len(headings) >= 1:
            score += 10
        
        # Has examples (15 points)
        example_indicators = ['example', 'for instance', 'such as', 'like']
        example_count = sum(1 for ind in example_indicators if ind in content.lower())
        if example_count >= 3:
            score += 15
        elif example_count >= 1:
            score += 10
        
        # Has lists (10 points)
        if re.search(r'(\n-|\n\d+\.|\n•)', content):
            score += 10
        
        # Has FAQ or Q&A section (10 points)
        if re.search(r'(faq|frequently asked|question|q&a)', content.lower()):
            score += 10
        
        # Has conclusion/summary (10 points)
        if re.search(r'(conclusion|summary|in summary|to summarize|key takeaways)', content.lower()):
            score += 10
        
        # Has call-to-action (10 points)
        cta_indicators = ['learn more', 'get started', 'sign up', 'download', 'contact us', 'try']
        if any(cta in content.lower() for cta in cta_indicators):
            score += 10
        
        # Has metadata (10 points)
        if metadata.get('title') and metadata.get('meta_description'):
            score += 10
        
        return min(100, score)
    
    def _split_sentences(self, text: str) -> List[str]:
        """Split text into sentences"""
        sentences = re.split(r'[.!?]+', text)
        return [s.strip() for s in sentences if s.strip()]
    
    def _split_words(self, text: str) -> List[str]:
        """Split text into words"""
        words = re.findall(r'\b[a-zA-Z]+\b', text)
        return words
    
    def _count_syllables(self, word: str) -> int:
        """Count syllables in a word (approximation)"""
        word = word.lower()
        count = 0
        vowels = 'aeiouy'
        previous_was_vowel = False
        
        for char in word:
            is_vowel = char in vowels
            if is_vowel and not previous_was_vowel:
                count += 1
            previous_was_vowel = is_vowel
        
        # Adjust for silent e
        if word.endswith('e'):
            count -= 1
        
        # Ensure at least one syllable
        if count == 0:
            count = 1
        
        return count
    
    def _get_grade(self, score: float) -> str:
        """Convert score to letter grade"""
        if score >= 90:
            return 'A'
        elif score >= 80:
            return 'B'
        elif score >= 70:
            return 'C'
        elif score >= 60:
            return 'D'
        else:
            return 'F'
    
    def _generate_recommendations(
        self,
        readability: float,
        eeat: float,
        seo: float,
        completeness: float,
        content: str,
        metadata: Dict
    ) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        # Readability recommendations
        if readability < 70:
            recommendations.append("Improve readability: Use shorter sentences and simpler words")
            recommendations.append("Add more headings and bullet points to break up text")
        
        # E-E-A-T recommendations
        if eeat < 70:
            recommendations.append("Add personal experience and real-world examples")
            recommendations.append("Include citations and references to authoritative sources")
            recommendations.append("Demonstrate expertise with data, statistics, and research")
        
        # SEO recommendations
        if seo < 70:
            target_keyword = metadata.get('target_keyword', '')
            if target_keyword:
                if target_keyword.lower() not in content[:500].lower():
                    recommendations.append(f"Include target keyword '{target_keyword}' in the first paragraph")
                
                word_count = len(self._split_words(content))
                if word_count < 1500:
                    recommendations.append(f"Expand content to at least 1,500 words (currently {word_count})")
            
            internal_links = len(re.findall(r'\[.+?\]\(.+?\)', content))
            if internal_links < 5:
                recommendations.append("Add more internal links to related content (5-10 recommended)")
        
        # Completeness recommendations
        if completeness < 70:
            if not re.search(r'(faq|frequently asked)', content.lower()):
                recommendations.append("Add an FAQ section to address common questions")
            
            if not re.search(r'(conclusion|summary)', content.lower()):
                recommendations.append("Add a conclusion or summary section")
        
        if not recommendations:
            recommendations.append("Content quality is excellent! Focus on promotion and link building.")
        
        return recommendations


# Example usage
if __name__ == "__main__":
    checker = ContentQualityChecker()
    
    sample_content = """
# How to Make Cold Brew Coffee

Cold brew coffee has become increasingly popular in recent years. In my experience testing over 20 different methods, I've found that the key to perfect cold brew is the right ratio and steeping time.

## What You'll Need

- Coarse coffee grounds
- Cold water
- A large jar or pitcher
- Coffee filter or cheesecloth

## Step-by-Step Process

1. Mix coffee and water at a 1:4 ratio
2. Steep for 12-24 hours in the refrigerator
3. Strain through a coffee filter
4. Dilute with water or milk to taste

According to research from the Specialty Coffee Association, cold brew has 67% less acidity than hot coffee.

## Tips for Best Results

- Use high-quality, freshly ground beans
- Experiment with steeping time
- Store in the refrigerator for up to 2 weeks

For more coffee brewing methods, check out our [complete coffee guide](https://example.com/coffee-guide).

Source: https://www.specialtycoffee.org
"""
    
    metadata = {
        'title': 'How to Make Cold Brew Coffee at Home',
        'meta_description': 'Learn how to make perfect cold brew coffee with this simple guide',
        'target_keyword': 'cold brew coffee'
    }
    
    result = checker.check_content(sample_content, metadata)
    
    print(f"=== Content Quality Report ===\n")
    print(f"Overall Score: {result.overall_score}/100 (Grade: {result.grade})")
    print(f"\nScore Breakdown:")
    print(f"  Readability: {result.readability_score}/100")
    print(f"  E-E-A-T: {result.eeat_score}/100")
    print(f"  SEO: {result.seo_score}/100")
    print(f"  Completeness: {result.completeness_score}/100")
    print(f"\nRecommendations:")
    for i, rec in enumerate(result.recommendations, 1):
        print(f"  {i}. {rec}")
