#!/usr/bin/env python3
"""
Create Mock VERSSAI Dataset for Testing
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime

def create_mock_dataset():
    """Create a mock VERSSAI dataset that matches the expected structure"""
    print("🔧 Creating Mock VERSSAI Dataset for Testing...")
    print("=" * 50)

    # Create mock data that matches the structure we analyzed earlier
    np.random.seed(42)  # For reproducible results

    # Summary Statistics
    summary_stats = pd.DataFrame({
        'Metric': ['Total_References', 'Total_Researchers', 'Total_Institutions', 'Total_Citations', 
                   'Average_Citations_Per_Paper', 'Average_Authors_Per_Paper', 'Year_Range', 
                   'Top_Categories', 'Statistical_Significance_Rate', 'Open_Access_Rate'],
        'Value': [1157, 2311, 25, 38016, 32.8, 3.2, '2015-2024', 'AI,ML,Fintech', 0.78, 0.65]
    })

    # References (1,157 research papers)
    categories = ['Artificial Intelligence', 'Machine Learning', 'Venture Capital', 'Fintech', 'Startup Analysis', 'Due Diligence', 'Portfolio Management']
    venues = ['Nature', 'Science', 'ICML', 'NeurIPS', 'Management Science', 'Journal of Finance', 'Venture Capital Journal']

    references_data = []
    for i in range(200):  # Reduced sample for faster testing
        ref_data = {
            'ref_id': f'ref_{i+1:04d}',
            'category': np.random.choice(categories),
            'title': f'Research Paper {i+1}: {np.random.choice(["Analysis of", "Study on", "Investigation of", "Review of"])} {np.random.choice(["AI Startups", "VC Patterns", "Founder Success", "Market Trends"])}',
            'authors': f'Author{i%50+1}, Coauthor{(i+1)%30+1}, Researcher{(i+2)%20+1}',
            'year': np.random.randint(2015, 2025),
            'venue': np.random.choice(venues),
            'citation_count': np.random.randint(0, 500),
            'h_index_lead_author': np.random.randint(5, 50),
            'institution_tier': np.random.choice(['Tier1', 'Tier2', 'Tier3']),
            'methodology': np.random.choice(['Quantitative', 'Qualitative', 'Mixed', 'Meta-analysis']),
            'sample_size': np.random.randint(50, 5000),
            'statistical_significance': np.random.choice([True, False], p=[0.78, 0.22]),
            'replication_status': np.random.choice(['Replicated', 'Not_Replicated', 'Pending']),
            'open_access': np.random.choice([True, False], p=[0.65, 0.35]),
            'doi': f'10.1000/journal.{i+1:04d}',
            'url': f'https://example.com/paper_{i+1}'
        }
        references_data.append(ref_data)

    references_df = pd.DataFrame(references_data)

    # Researchers (2,311 researchers)
    institutions = ['MIT', 'Stanford', 'Harvard', 'UC Berkeley', 'CMU', 'Oxford', 'Cambridge', 'ETH Zurich', 'NUS', 'Tsinghua']
    fields = ['Artificial Intelligence', 'Machine Learning', 'Computer Science', 'Finance', 'Economics', 'Business', 'Statistics']

    researchers_data = []
    for i in range(100):  # Reduced sample for testing
        researcher_data = {
            'researcher_id': f'researcher_{i+1:04d}',
            'name': f'Dr. Researcher {i+1}',
            'institution': np.random.choice(institutions),
            'h_index': np.random.randint(5, 80),
            'total_citations': np.random.randint(100, 10000),
            'years_active': np.random.randint(3, 30),
            'primary_field': np.random.choice(fields),
            'collaboration_count': np.random.randint(5, 100),
            'linkedin_url': f'https://linkedin.com/in/researcher{i+1}',
            'google_scholar_url': f'https://scholar.google.com/citations?user=researcher{i+1}',
            'orcid': f'0000-0000-0000-{i+1:04d}',
            'recent_papers': np.random.randint(1, 15),
            'funding_received': np.random.randint(0, 1) * np.random.randint(10000, 1000000),
            'industry_experience': np.random.randint(0, 15)
        }
        researchers_data.append(researcher_data)

    researchers_df = pd.DataFrame(researchers_data)

    # Institutions
    institutions_data = []
    countries = ['USA', 'UK', 'Germany', 'France', 'China', 'Singapore', 'Canada', 'Australia', 'Japan', 'South Korea']
    for i, inst in enumerate(institutions):
        inst_data = {
            'institution_id': f'inst_{i+1:03d}',
            'name': inst,
            'country': np.random.choice(countries),
            'ranking': i + 1,
            'research_output': np.random.randint(100, 2000),
            'collaboration_score': np.random.uniform(0.3, 0.9),
            'funding_level': np.random.choice(['High', 'Medium', 'Low']),
            'researcher_count': np.random.randint(50, 500),
            'specialization': np.random.choice(fields),
            'established_year': np.random.randint(1850, 2000)
        }
        institutions_data.append(inst_data)

    institutions_df = pd.DataFrame(institutions_data)

    # Citation Network (simplified)
    citation_data = []
    for i in range(300):  # Reduced sample
        citation_entry = {
            'citation_id': f'cite_{i+1:04d}',
            'citing_paper_id': f'ref_{np.random.randint(1, 200):04d}',
            'cited_paper_id': f'ref_{np.random.randint(1, 200):04d}',
            'citation_context': np.random.choice(['Introduction', 'Methods', 'Results', 'Discussion']),
            'citation_sentiment': np.random.choice(['Positive', 'Neutral', 'Negative'], p=[0.7, 0.25, 0.05]),
            'self_citation': np.random.choice([True, False], p=[0.15, 0.85])
        }
        citation_data.append(citation_entry)

    citation_df = pd.DataFrame(citation_data)

    # Category Analysis
    category_analysis = pd.DataFrame({
        'category': categories,
        'ref_count': [np.random.randint(10, 50) for _ in categories],
        'citation_count': [np.random.randint(100, 1000) for _ in categories],
        'avg_h_index': [np.random.uniform(10, 40) for _ in categories],
        'sample_size': [np.random.randint(500, 5000) for _ in categories],
        'statistical_significance': [np.random.uniform(0.6, 0.9) for _ in categories],
        'year': [2024] * len(categories)
    })

    # Create the Excel file
    excel_path = './uploads/VERSSAI_Massive_Dataset_Complete.xlsx'

    print(f"📊 Creating dataset with {len(references_df)} references, {len(researchers_df)} researchers...")
    print(f"   Institutions: {len(institutions_df)}, Citations: {len(citation_df)}")

    try:
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            summary_stats.to_excel(writer, sheet_name='Summary_Statistics', index=False)
            references_df.to_excel(writer, sheet_name='References_1157', index=False)
            researchers_df.to_excel(writer, sheet_name='Researchers_2311', index=False)
            institutions_df.to_excel(writer, sheet_name='Institutions', index=False)
            citation_df.to_excel(writer, sheet_name='Citation_Network', index=False)
            category_analysis.to_excel(writer, sheet_name='Category_Analysis', index=False)
            
            # Add some additional sheets for completeness
            researchers_df.head(10).to_excel(writer, sheet_name='Researcher_Analysis', index=False)
            institutions_df.head(10).to_excel(writer, sheet_name='Institutional_Analysis', index=False)
            references_df.head(10).to_excel(writer, sheet_name='Verified_Papers_32', index=False)

        print(f"✅ Mock VERSSAI dataset created: {excel_path}")
        print(f"📁 File size: {os.path.getsize(excel_path) / 1024:.1f} KB")

        # Verify the file exists and can be read
        test_read = pd.read_excel(excel_path, sheet_name=None)
        print(f"✅ Dataset verification successful - {len(test_read)} sheets created")
        for sheet_name, df in test_read.items():
            print(f"   📋 {sheet_name}: {len(df)} rows")
        
        return True
        
    except Exception as e:
        print(f"❌ Dataset creation failed: {e}")
        return False

if __name__ == "__main__":
    create_mock_dataset()
