#!/usr/bin/env python3
"""
CLI Wrapper for Content Strategy Modules
Handles stdin/stdout communication with Next.js API routes
"""

import sys
import json
from user_intent_analyzer import UserIntentAnalyzer
from topic_cluster_generator import TopicClusterGenerator, PillarPage, ClusterContent
from content_quality_checker import ContentQualityChecker


def handle_intent_analysis(data):
    """Handle user intent analysis requests"""
    analyzer = UserIntentAnalyzer()
    action = data.get('action')
    
    if action == 'analyze_batch':
        queries = data.get('queries', [])
        results = analyzer.analyze_batch(queries)
        return results
    
    elif action == 'get_distribution':
        queries = data.get('queries', [])
        distribution = analyzer.get_intent_distribution(queries)
        return distribution
    
    elif action == 'analyze_single':
        query = data.get('query', '')
        result = analyzer.analyze_query(query)
        return result
    
    else:
        return {'error': 'Unknown action'}


def handle_topic_cluster(data):
    """Handle topic cluster generation requests"""
    generator = TopicClusterGenerator()
    action = data.get('action')
    
    if action == 'generate_ideas':
        pillar_topic = data.get('pillar_topic', '')
        template_type = data.get('template_type', 'guide')
        count = data.get('count', 10)
        ideas = generator.generate_cluster_ideas(pillar_topic, template_type, count)
        return ideas
    
    elif action == 'analyze_coverage':
        pillar_data = data.get('pillar', {})
        pillar = _dict_to_pillar(pillar_data)
        analysis = generator.analyze_cluster_coverage(pillar)
        return analysis
    
    elif action == 'generate_linking_strategy':
        pillar_data = data.get('pillar', {})
        pillar = _dict_to_pillar(pillar_data)
        strategy = generator.generate_internal_linking_strategy(pillar)
        return strategy
    
    elif action == 'export':
        pillar_data = data.get('pillar', {})
        format_type = data.get('format', 'json')
        pillar = _dict_to_pillar(pillar_data)
        generator.pillars.append(pillar)
        export_content = generator.export_cluster_map(pillar, format_type)
        return export_content
    
    else:
        return {'error': 'Unknown action'}


def handle_quality_check(data):
    """Handle content quality checking requests"""
    checker = ContentQualityChecker()
    action = data.get('action')
    
    if action == 'check_quality':
        content = data.get('content', '')
        metadata = data.get('metadata', {})
        score = checker.check_content(content, metadata)
        
        # Convert dataclass to dict
        return {
            'overall_score': score.overall_score,
            'readability_score': score.readability_score,
            'eeat_score': score.eeat_score,
            'seo_score': score.seo_score,
            'completeness_score': score.completeness_score,
            'grade': score.grade,
            'recommendations': score.recommendations
        }
    
    else:
        return {'error': 'Unknown action'}


def _dict_to_pillar(pillar_data):
    """Convert dictionary to PillarPage object"""
    pillar = PillarPage(
        title=pillar_data.get('title', ''),
        target_keyword=pillar_data.get('target_keyword', ''),
        description=pillar_data.get('description', ''),
        word_count=pillar_data.get('word_count', 3000),
        url_slug=pillar_data.get('url_slug', '')
    )
    
    # Add clusters
    for cluster_data in pillar_data.get('clusters', []):
        cluster = ClusterContent(
            title=cluster_data.get('title', ''),
            target_keyword=cluster_data.get('target_keyword', ''),
            search_volume=cluster_data.get('search_volume', 0),
            difficulty=cluster_data.get('difficulty', 'medium'),
            word_count=cluster_data.get('word_count', 1500),
            url_slug=cluster_data.get('url_slug', '')
        )
        pillar.add_cluster(cluster)
    
    return pillar


def main():
    """Main CLI entry point"""
    try:
        # Read JSON from stdin
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        # Determine which module to use
        module = data.get('module', '')
        
        if module == 'intent_analyzer':
            result = handle_intent_analysis(data)
        elif module == 'topic_cluster':
            result = handle_topic_cluster(data)
        elif module == 'quality_checker':
            result = handle_quality_check(data)
        else:
            result = {'error': 'Unknown module'}
        
        # Output JSON to stdout
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        error_result = {'error': str(e)}
        print(json.dumps(error_result))
        sys.exit(1)


if __name__ == '__main__':
    main()
