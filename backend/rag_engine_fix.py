    async def _create_query_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Create a summary of the multi-layer query results"""
        total_matches = sum(len(layer_data.get('matches', [])) for layer_data in results['layers'].values())
        cross_layer_connections = len(results['cross_layer_insights'])
        
        # Identify most relevant layer
        best_layer = None
        best_score = 0
        for layer_name, layer_data in results['layers'].items():
            if layer_data.get('matches'):
                avg_score = np.mean([m['similarity'] for m in layer_data['matches']])
                if avg_score > best_score:
                    best_score = avg_score
                    best_layer = layer_name
        
        summary = {
            'total_matches': total_matches,
            'cross_layer_connections': cross_layer_connections,
            'primary_layer': best_layer,
            'confidence_score': float(best_score) if best_score > 0 else 0,
        }
        
        # Generate recommendation with the summary data
        summary['recommendation'] = self._generate_recommendation_from_summary(summary)
        
        return summary
    
    def _generate_recommendation_from_summary(self, summary: Dict[str, Any]) -> str:
        """Generate a recommendation based on query summary"""
        total_matches = summary['total_matches']
        cross_connections = summary['cross_layer_connections']
        primary_layer = summary['primary_layer']
        
        if cross_connections > 0:
            return f"Found {cross_connections} cross-layer insights. Primary expertise in {primary_layer} layer with {total_matches} total matches. Consider multi-layer analysis for comprehensive understanding."
        elif total_matches > 0:
            return f"Found {total_matches} relevant matches primarily in {primary_layer} layer. Consider expanding search to other layers for broader perspective."
        else:
            return "No significant matches found. Consider refining search terms or exploring different aspects of the query."
    
    def _generate_recommendation(self, results: Dict[str, Any]) -> str:
        """Legacy method - now uses summary-based approach"""
        return self._generate_recommendation_from_summary(results.get('summary', {}))
