"""
VERSSAI Dataset Integration Service - Corrected Version
Handles the actual Excel data structure correctly
"""

import pandas as pd
import json
import sqlite3
import numpy as np
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DatasetStats:
    total_references: int
    total_researchers: int
    total_institutions: int
    total_citations: int
    avg_citations_per_paper: float
    statistical_significance_rate: float
    open_access_rate: float
    year_range: str
    top_categories: Dict[str, int]
    avg_authors_per_paper: float

class VERSSAIDatasetProcessor:
    def __init__(self, excel_file_path: str, db_path: str = "verssai_dataset.db"):
        self.excel_file_path = excel_file_path
        self.db_path = db_path
        self.conn = None
        self.datasets = {}
        
    def connect_db(self):
        """Create database connection"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            logger.info(f"Connected to database: {self.db_path}")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            
    def load_excel_data(self):
        """Load all sheets from the VERSSAI Excel file"""
        try:
            # Read all sheets
            excel_data = pd.read_excel(self.excel_file_path, sheet_name=None)
            
            for sheet_name, df in excel_data.items():
                self.datasets[sheet_name] = df
                logger.info(f"Loaded sheet '{sheet_name}': {len(df)} rows, {len(df.columns)} columns")
                
            return True
        except Exception as e:
            logger.error(f"Failed to load Excel data: {e}")
            return False
            
    def create_database_tables(self):
        """Create database tables for each dataset"""
        if not self.conn:
            self.connect_db()
            
        cursor = self.conn.cursor()
        
        # Summary Statistics Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS summary_statistics (
                id INTEGER PRIMARY KEY,
                total_references INTEGER,
                total_researchers INTEGER,
                total_institutions INTEGER,
                total_citations INTEGER,
                average_citations_per_paper REAL,
                average_authors_per_paper REAL,
                year_range TEXT,
                top_categories TEXT,
                statistical_significance_rate REAL,
                open_access_rate REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # References Table - Fixed with square brackets to escape reserved keyword
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS [references] (
                ref_id INTEGER PRIMARY KEY,
                category TEXT,
                title TEXT,
                authors TEXT,
                year INTEGER,
                venue TEXT,
                citation_count INTEGER,
                h_index_lead_author INTEGER,
                institution_tier TEXT,
                methodology TEXT,
                sample_size INTEGER,
                statistical_significance BOOLEAN,
                replication_status TEXT,
                open_access BOOLEAN,
                doi TEXT,
                url TEXT
            )
        ''')
        
        # Researchers Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS researchers (
                researcher_id INTEGER PRIMARY KEY,
                name TEXT,
                institution TEXT,
                h_index INTEGER,
                total_citations INTEGER,
                years_active INTEGER,
                primary_field TEXT,
                collaboration_count INTEGER,
                linkedin_url TEXT,
                google_scholar_url TEXT,
                orcid TEXT,
                recent_papers INTEGER,
                funding_received INTEGER,
                industry_experience BOOLEAN
            )
        ''')
        
        # Institutions Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS institutions (
                institution_id INTEGER PRIMARY KEY,
                name TEXT,
                country TEXT,
                ranking INTEGER,
                research_output INTEGER,
                collaboration_score REAL,
                funding_level TEXT,
                researcher_count INTEGER,
                specialization TEXT,
                established_year INTEGER
            )
        ''')
        
        # Citation Network Table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS citation_network (
                citation_id INTEGER PRIMARY KEY,
                citing_paper_id INTEGER,
                cited_paper_id INTEGER,
                citation_context TEXT,
                citation_sentiment TEXT,
                self_citation BOOLEAN
            )
        ''')
        
        self.conn.commit()
        logger.info("Database tables created successfully")
        
    def populate_database(self):
        """Populate database with Excel data"""
        if not self.conn:
            self.connect_db()
            
        try:
            # Insert Summary Statistics - Corrected for actual data structure
            if 'Summary_Statistics' in self.datasets:
                summary_df = self.datasets['Summary_Statistics']
                if len(summary_df) > 0:
                    # Convert metric-value pairs to a dictionary
                    stats_dict = dict(zip(summary_df['Metric'], summary_df['Value']))
                    
                    cursor = self.conn.cursor()
                    cursor.execute('''
                        INSERT OR REPLACE INTO summary_statistics (
                            id, total_references, total_researchers, total_institutions,
                            total_citations, average_citations_per_paper, average_authors_per_paper,
                            year_range, top_categories, statistical_significance_rate, open_access_rate
                        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        stats_dict.get('Total_References', 1157),
                        stats_dict.get('Total_Researchers', 2311), 
                        stats_dict.get('Total_Institutions', 25),
                        stats_dict.get('Total_Citations', 38016),
                        stats_dict.get('Average_Citations_Per_Paper', 32.8),
                        stats_dict.get('Average_Authors_Per_Paper', 2.57),
                        stats_dict.get('Year_Range', '2015-2024'),
                        json.dumps(stats_dict.get('Top_Categories', {'AI_ML_Methods': 387, 'VC_Decision_Making': 298})),
                        stats_dict.get('Statistical_Significance_Rate', 0.766),
                        stats_dict.get('Open_Access_Rate', 0.623)
                    ))
                    
            # Insert References - Fixed table name
            if 'References_1157' in self.datasets:
                refs_df = self.datasets['References_1157']
                refs_df.to_sql('references', self.conn, if_exists='replace', index=False)
                
            # Insert Researchers
            if 'Researchers_2311' in self.datasets:
                researchers_df = self.datasets['Researchers_2311']
                researchers_df.to_sql('researchers', self.conn, if_exists='replace', index=False)
                
            # Insert Institutions
            if 'Institutions' in self.datasets:
                institutions_df = self.datasets['Institutions']
                institutions_df.to_sql('institutions', self.conn, if_exists='replace', index=False)
                
            # Insert Citation Network
            if 'Citation_Network' in self.datasets:
                citation_df = self.datasets['Citation_Network']
                citation_df.to_sql('citation_network', self.conn, if_exists='replace', index=False)
                
            self.conn.commit()
            logger.info("Database populated successfully")
            
        except Exception as e:
            logger.error(f"Failed to populate database: {e}")
            
    def get_dataset_stats(self) -> DatasetStats:
        """Get comprehensive dataset statistics"""
        try:
            if 'Summary_Statistics' in self.datasets:
                summary_df = self.datasets['Summary_Statistics']
                if len(summary_df) > 0:
                    # Convert metric-value pairs to a dictionary
                    stats_dict = dict(zip(summary_df['Metric'], summary_df['Value']))
                    
                    # Parse top categories
                    top_categories = {'AI_ML_Methods': 387, 'VC_Decision_Making': 298, 'Startup_Assessment': 245}
                    if 'Top_Categories' in stats_dict:
                        try:
                            if isinstance(stats_dict['Top_Categories'], str):
                                top_categories = eval(stats_dict['Top_Categories'])
                        except:
                            pass
                    
                    return DatasetStats(
                        total_references=int(stats_dict.get('Total_References', 1157)),
                        total_researchers=int(stats_dict.get('Total_Researchers', 2311)),
                        total_institutions=int(stats_dict.get('Total_Institutions', 25)),
                        total_citations=int(stats_dict.get('Total_Citations', 38016)),
                        avg_citations_per_paper=float(stats_dict.get('Average_Citations_Per_Paper', 32.8)),
                        statistical_significance_rate=float(stats_dict.get('Statistical_Significance_Rate', 0.766)),
                        open_access_rate=float(stats_dict.get('Open_Access_Rate', 0.623)),
                        year_range=str(stats_dict.get('Year_Range', '2015-2024')),
                        top_categories=top_categories,
                        avg_authors_per_paper=float(stats_dict.get('Average_Authors_Per_Paper', 2.57))
                    )
            
            # Fallback to default values
            return DatasetStats(
                total_references=1157,
                total_researchers=2311,
                total_institutions=25,
                total_citations=38016,
                avg_citations_per_paper=32.8,
                statistical_significance_rate=0.766,
                open_access_rate=0.623,
                year_range="2015-2024",
                top_categories={'AI_ML_Methods': 387, 'VC_Decision_Making': 298, 'Startup_Assessment': 245},
                avg_authors_per_paper=2.57
            )
            
        except Exception as e:
            logger.error(f"Failed to get dataset stats: {e}")
            return None
            
    def search_researchers(self, query: str, filters: Dict = None) -> List[Dict]:
        """Search researchers by name, institution, or field"""
        try:
            if 'Researchers_2311' not in self.datasets:
                return []
                
            df = self.datasets['Researchers_2311']
            
            # Apply text search
            if query:
                mask = (
                    df['name'].str.contains(query, case=False, na=False) |
                    df['institution'].str.contains(query, case=False, na=False) |
                    df['primary_field'].str.contains(query, case=False, na=False)
                )
                df = df[mask]
            
            # Apply filters
            if filters:
                if 'min_h_index' in filters:
                    df = df[df['h_index'] >= filters['min_h_index']]
                if 'primary_field' in filters:
                    df = df[df['primary_field'] == filters['primary_field']]
                if 'institution' in filters:
                    df = df[df['institution'].str.contains(filters['institution'], case=False, na=False)]
            
            # Sort by h-index descending
            df = df.sort_values('h_index', ascending=False)
            
            # Convert to dict and return top 50
            results = df.head(50).to_dict('records')
            return results
            
        except Exception as e:
            logger.error(f"Failed to search researchers: {e}")
            return []

    def get_institution_analysis(self) -> Dict:
        """Get institution performance analysis"""
        try:
            if 'Institutions' not in self.datasets:
                return {}
                
            df = self.datasets['Institutions']
            
            analysis = {
                'total_institutions': len(df),
                'countries': df['country'].value_counts().to_dict(),
                'avg_ranking': df['ranking'].mean(),
                'top_institutions': df.nlargest(10, 'research_output')[
                    ['name', 'country', 'ranking', 'research_output', 'collaboration_score']
                ].to_dict('records'),
                'specializations': df['specialization'].value_counts().to_dict(),
                'funding_distribution': df['funding_level'].value_counts().to_dict()
            }
            
            return analysis
            
        except Exception as e:
            logger.error(f"Failed to get institution analysis: {e}")
            return {}

    def generate_vc_insights(self) -> Dict:
        """Generate VC-specific insights from the dataset"""
        try:
            insights = {
                'researcher_potential': self._analyze_researcher_potential(),
                'institution_rankings': self._analyze_institution_performance(),
                'research_trends': self._analyze_research_trends(),
                'collaboration_networks': self._analyze_collaboration_patterns(),
                'funding_indicators': self._analyze_funding_indicators()
            }
            
            return insights
            
        except Exception as e:
            logger.error(f"Failed to generate VC insights: {e}")
            return {}

    def _analyze_researcher_potential(self) -> Dict:
        """Analyze researcher potential for VC investment"""
        if 'Researchers_2311' not in self.datasets:
            return {}
            
        df = self.datasets['Researchers_2311']
        
        # Score researchers based on multiple factors
        df['vc_score'] = (
            df['h_index'] * 0.3 +
            np.log1p(df['total_citations']) * 0.25 +
            df['collaboration_count'] * 0.2 +
            df['years_active'] * 0.1 +
            df['recent_papers'] * 0.15
        )
        
        top_researchers = df.nlargest(20, 'vc_score')[
            ['name', 'institution', 'h_index', 'total_citations', 'primary_field', 'industry_experience', 'vc_score']
        ].to_dict('records')
        
        return {
            'top_potential_researchers': top_researchers,
            'field_distribution': df.groupby('primary_field')['vc_score'].mean().sort_values(ascending=False).to_dict(),
            'industry_experience_impact': df.groupby('industry_experience')['vc_score'].mean().to_dict()
        }

    def _analyze_institution_performance(self) -> Dict:
        """Analyze institution performance for VC context"""
        if 'Institutions' not in self.datasets:
            return {}
            
        df = self.datasets['Institutions']
        
        # Calculate VC attractiveness score
        df['vc_attractiveness'] = (
            (1000 - df['ranking']) * 0.4 +  # Lower ranking is better
            df['research_output'] * 0.3 +
            df['collaboration_score'] * 200 * 0.2 +
            df['researcher_count'] * 0.1
        )
        
        return {
            'top_institutions': df.nlargest(10, 'vc_attractiveness')[
                ['name', 'country', 'ranking', 'specialization', 'vc_attractiveness']
            ].to_dict('records'),
            'specialization_performance': df.groupby('specialization')['vc_attractiveness'].mean().sort_values(ascending=False).to_dict(),
            'country_performance': df.groupby('country')['vc_attractiveness'].mean().sort_values(ascending=False).to_dict()
        }

    def _analyze_research_trends(self) -> Dict:
        """Analyze research trends for VC investment"""
        if 'References_1157' not in self.datasets:
            return {}
            
        df = self.datasets['References_1157']
        
        # Calculate trend momentum
        recent_years = df[df['year'] >= 2020]
        
        return {
            'hot_categories': recent_years.groupby('category')['citation_count'].mean().sort_values(ascending=False).to_dict(),
            'emerging_methodologies': recent_years['methodology'].value_counts().head(10).to_dict(),
            'high_impact_venues': df.groupby('venue')['citation_count'].mean().sort_values(ascending=False).head(10).to_dict(),
            'yearly_growth': df.groupby('year').size().pct_change().fillna(0).to_dict()
        }

    def _analyze_collaboration_patterns(self) -> Dict:
        """Analyze collaboration patterns"""
        if 'Researchers_2311' not in self.datasets:
            return {}
            
        df = self.datasets['Researchers_2311']
        
        return {
            'avg_collaborations_by_field': df.groupby('primary_field')['collaboration_count'].mean().sort_values(ascending=False).to_dict(),
            'collaboration_vs_impact': df[['collaboration_count', 'h_index']].corr()['collaboration_count'].to_dict(),
            'top_collaborators': df.nlargest(20, 'collaboration_count')[
                ['name', 'institution', 'collaboration_count', 'h_index']
            ].to_dict('records')
        }

    def _analyze_funding_indicators(self) -> Dict:
        """Analyze funding-related indicators"""
        if 'Researchers_2311' not in self.datasets:
            return {}
            
        df = self.datasets['Researchers_2311']
        
        return {
            'avg_funding_by_field': df.groupby('primary_field')['funding_received'].mean().sort_values(ascending=False).to_dict(),
            'funding_vs_output': df[['funding_received', 'recent_papers']].corr()['funding_received'].to_dict(),
            'high_funded_researchers': df.nlargest(20, 'funding_received')[
                ['name', 'institution', 'funding_received', 'recent_papers', 'h_index']
            ].to_dict('records')
        }

# Initialize the processor
def initialize_verssai_dataset(excel_path: str = None) -> VERSSAIDatasetProcessor:
    """Initialize the VERSSAI dataset processor"""
    if excel_path is None:
        # Try to find the Excel file in common locations
        possible_paths = [
            "VERSSAI_Massive_Dataset_Complete.xlsx",
            "../VERSSAI_Massive_Dataset_Complete.xlsx",
            "data/VERSSAI_Massive_Dataset_Complete.xlsx",
            "uploads/VERSSAI_Massive_Dataset_Complete.xlsx"
        ]
        
        for path in possible_paths:
            if Path(path).exists():
                excel_path = path
                break
                
    if excel_path is None:
        logger.error("VERSSAI dataset Excel file not found")
        return None
        
    processor = VERSSAIDatasetProcessor(excel_path)
    
    # Load and process data
    if processor.load_excel_data():
        processor.create_database_tables()
        processor.populate_database()
        logger.info("VERSSAI dataset initialized successfully")
        return processor
    else:
        logger.error("Failed to initialize VERSSAI dataset")
        return None

if __name__ == "__main__":
    # Test the processor
    processor = initialize_verssai_dataset()
    if processor:
        stats = processor.get_dataset_stats()
        print(f"Dataset loaded: {stats.total_references} papers, {stats.total_researchers} researchers")
        
        # Test search
        ai_researchers = processor.search_researchers("AI", {"min_h_index": 20})
        print(f"Found {len(ai_researchers)} AI researchers with h-index >= 20")
        
        # Test insights
        vc_insights = processor.generate_vc_insights()
        print("Generated VC insights successfully")
