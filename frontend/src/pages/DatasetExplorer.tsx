import React, { useState } from 'react';
import { Search, Database, Users, FileText, Network, Download, Filter } from 'lucide-react';
import { useRAGQuery } from '@/hooks/useEnhancedDashboardData';
import { verssaiMCPService } from '@/services/verssaiMCPService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  id: string;
  type: 'paper' | 'researcher' | 'institution';
  title: string;
  authors?: string[];
  institution?: string;
  year?: number;
  citations?: number;
  relevanceScore: number;
  abstract?: string;
  tags?: string[];
}

const DatasetExplorer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResponse, setRagResponse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('search');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<'roof' | 'vc' | 'startup'>('vc');
  
  const { query: queryRAG, isQuerying } = useRAGQuery();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Search across researchers and papers
      const results = await verssaiMCPService.searchResearchers(searchQuery, {
        includeInstitutions: true,
        includePapers: true,
        limit: 20
      });

      // Transform results to our format
      const transformedResults: SearchResult[] = results.map((item: any, index: number) => ({
        id: item.id || index.toString(),
        type: item.type || 'researcher',
        title: item.name || item.title,
        authors: item.authors,
        institution: item.institution,
        year: item.year,
        citations: item.total_citations || item.citation_count,
        relevanceScore: item.relevance_score || Math.random(),
        abstract: item.abstract || item.bio,
        tags: item.primary_field ? [item.primary_field] : []
      }));

      setSearchResults(transformedResults);
      
      if (transformedResults.length === 0) {
        toast({
          title: "No Results",
          description: "No matching researchers or papers found.",
        });
      }

    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search the dataset. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRAGQuery = async () => {
    if (!ragQuery.trim()) return;

    try {
      const response = await queryRAG(ragQuery, selectedLayer);
      setRagResponse(response);
    } catch (error) {
      console.error('RAG query failed:', error);
    }
  };

  const exportResults = async () => {
    try {
      const blob = new Blob([JSON.stringify(searchResults, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verssai-search-results-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Search results have been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export search results.",
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paper': return <FileText className="h-4 w-4" />;
      case 'researcher': return <Users className="h-4 w-4" />;
      case 'institution': return <Database className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'paper': return 'bg-blue-100 text-blue-800';
      case 'researcher': return 'bg-green-100 text-green-800';
      case 'institution': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">VERSSAI Dataset Explorer</h1>
        <p className="text-muted-foreground">
          Explore 1,157 research papers, 2,311 researchers, and 38,015 citations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Dataset Search</TabsTrigger>
          <TabsTrigger value="rag">RAG Intelligence</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Search Academic Research</span>
              </CardTitle>
              <CardDescription>
                Search across research papers, researchers, and institutions in the VERSSAI dataset
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search papers, researchers, institutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Found {searchResults.length} results
                  </span>
                  <Button variant="outline" size="sm" onClick={exportResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getTypeIcon(result.type)}
                          <Badge className={getTypeColor(result.type)}>
                            {result.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Relevance: {(result.relevanceScore * 100).toFixed(1)}%
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-foreground mb-1">{result.title}</h3>
                        
                        {result.authors && (
                          <p className="text-sm text-muted-foreground mb-1">
                            Authors: {result.authors.join(', ')}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {result.institution && <span>📍 {result.institution}</span>}
                          {result.year && <span>📅 {result.year}</span>}
                          {result.citations && <span>📊 {result.citations} citations</span>}
                        </div>
                        
                        {result.abstract && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {result.abstract}
                          </p>
                        )}
                        
                        {result.tags && result.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {searchResults.length === 0 && !isSearching && searchQuery && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-sm">Try different keywords or search terms</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rag" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>3-Layer RAG Intelligence</span>
              </CardTitle>
              <CardDescription>
                Query the research-backed intelligence system across different layers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(['roof', 'vc', 'startup'] as const).map((layer) => (
                  <Button
                    key={layer}
                    variant={selectedLayer === layer ? 'default' : 'outline'}
                    onClick={() => setSelectedLayer(layer)}
                    className="capitalize"
                  >
                    {layer} Layer
                  </Button>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Ask a question about VC intelligence..."
                  value={ragQuery}
                  onChange={(e) => setRagQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleRAGQuery()}
                  className="flex-1"
                />
                <Button onClick={handleRAGQuery} disabled={isQuerying}>
                  {isQuerying ? 'Querying...' : 'Ask'}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p><strong>Roof Layer:</strong> Market & industry intelligence</p>
                <p><strong>VC Layer:</strong> Investment & portfolio analysis</p>
                <p><strong>Startup Layer:</strong> Company & founder intelligence</p>
              </div>

              {ragResponse && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">RAG Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {ragResponse.answer && (
                        <div>
                          <h4 className="font-medium mb-2">Answer:</h4>
                          <p className="text-sm">{ragResponse.answer}</p>
                        </div>
                      )}
                      
                      {ragResponse.sources && ragResponse.sources.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Sources:</h4>
                          <div className="space-y-2">
                            {ragResponse.sources.map((source: any, index: number) => (
                              <div key={index} className="text-sm border-l-2 border-blue-500 pl-3">
                                <p className="font-medium">{source.title}</p>
                                <p className="text-muted-foreground">{source.excerpt}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {ragResponse.confidence && (
                        <div className="text-sm text-muted-foreground">
                          Confidence: {(ragResponse.confidence * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Research Papers:</span>
                    <span className="font-medium">1,157</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Researchers:</span>
                    <span className="font-medium">2,311</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Citations:</span>
                    <span className="font-medium">38,015</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Institutions:</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Citations/Paper:</span>
                    <span className="font-medium">32.9</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Research Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI/ML Methods</span>
                    <Badge>387 papers</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">VC Decision Making</span>
                    <Badge>298 papers</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Startup Assessment</span>
                    <Badge>245 papers</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Financial Modeling</span>
                    <Badge>156 papers</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Risk Analysis</span>
                    <Badge>71 papers</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatasetExplorer;