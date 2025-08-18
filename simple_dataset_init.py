#!/usr/bin/env python3
"""
Simple VERSSAI Dataset Processor for Real Backend Integration
Creates SQLite database with research data for frontend consumption
"""

import sqlite3
import pandas as pd
import logging
import sys
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_database_tables(db_path):
    """Create database tables for VERSSAI dataset"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create papers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS papers (
            id TEXT PRIMARY KEY,
            title TEXT,
            authors TEXT,
            year INTEGER,
            venue TEXT,
            citation_count INTEGER,
            abstract TEXT,
            category TEXT
        )
    ''')
    
    # Create researchers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS researchers (
            id TEXT PRIMARY KEY,
            name TEXT,
            affiliation TEXT,
            h_index INTEGER,
            total_citations INTEGER,
            expertise_area TEXT
        )
    ''')
    
    # Create institutions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS institutions (
            id TEXT PRIMARY KEY,
            name TEXT,
            total_papers INTEGER,
            total_citations INTEGER,
            avg_citations_per_paper REAL,
            h_index_sum INTEGER
        )
    ''')
    
    # Create citations table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS citations (
            id TEXT PRIMARY KEY,
            citing_paper_id TEXT,
            cited_paper_id TEXT,
            citation_context TEXT,
            citation_sentiment TEXT,
            citation_type TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    logger.info("Database tables created successfully")

def populate_database_from_excel(db_path, excel_path):
    """Populate database from VERSSAI Excel file"""
    if not os.path.exists(excel_path):
        logger.error(f"Excel file not found: {excel_path}")
        return False
    
    try:
        # Read Excel sheets
        logger.info(f"Reading Excel file: {excel_path}")
        
        # Load all sheets
        sheets = pd.read_excel(excel_path, sheet_name=None)
        
        # Get the main data sheets
        papers_df = sheets.get('References_1157')
        researchers_df = sheets.get('Researchers_2311') 
        institutions_df = sheets.get('Institutions')
        citations_df = sheets.get('Citation_Network')
        
        conn = sqlite3.connect(db_path)
        
        # Populate papers table
        if papers_df is not None:
            logger.info(f"Processing {len(papers_df)} papers...")
            for idx, row in papers_df.iterrows():
                try:
                    conn.execute('''
                        INSERT OR REPLACE INTO papers 
                        (id, title, authors, year, venue, citation_count, abstract, category)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        str(row.get('ref_id', f'paper_{idx}')),
                        str(row.get('title', 'Unknown Title')),
                        str(row.get('authors', 'Unknown Authors')),
                        int(row.get('year', 2020)) if pd.notna(row.get('year')) else 2020,
                        str(row.get('venue', 'Unknown Venue')),
                        int(row.get('citation_count', 0)) if pd.notna(row.get('citation_count')) else 0,
                        str(row.get('abstract', '')),
                        str(row.get('category', 'Unknown'))
                    ))
                except Exception as e:
                    logger.warning(f"Error inserting paper {idx}: {e}")
                    continue
        
        # Populate researchers table
        if researchers_df is not None:
            logger.info(f"Processing {len(researchers_df)} researchers...")
            for idx, row in researchers_df.iterrows():
                try:
                    conn.execute('''
                        INSERT OR REPLACE INTO researchers 
                        (id, name, affiliation, h_index, total_citations, expertise_area)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        str(row.get('researcher_id', f'researcher_{idx}')),
                        str(row.get('name', 'Unknown Researcher')),
                        str(row.get('institution', 'Unknown Institution')),
                        int(row.get('h_index', 0)) if pd.notna(row.get('h_index')) else 0,
                        int(row.get('total_citations', 0)) if pd.notna(row.get('total_citations')) else 0,
                        str(row.get('expertise_area', 'General'))
                    ))
                except Exception as e:
                    logger.warning(f"Error inserting researcher {idx}: {e}")
                    continue
        
        # Populate institutions table
        if institutions_df is not None:
            logger.info(f"Processing {len(institutions_df)} institutions...")
            for idx, row in institutions_df.iterrows():
                try:
                    conn.execute('''
                        INSERT OR REPLACE INTO institutions 
                        (id, name, total_papers, total_citations, avg_citations_per_paper, h_index_sum)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        str(row.get('institution_id', f'inst_{idx}')),
                        str(row.get('Institution', 'Unknown Institution')),
                        int(row.get('Total_Papers', 0)) if pd.notna(row.get('Total_Papers')) else 0,
                        int(row.get('Total_Citations', 0)) if pd.notna(row.get('Total_Citations')) else 0,
                        float(row.get('Avg_Citations_per_Paper', 0.0)) if pd.notna(row.get('Avg_Citations_per_Paper')) else 0.0,
                        int(row.get('H_index_Sum', 0)) if pd.notna(row.get('H_index_Sum')) else 0
                    ))
                except Exception as e:
                    logger.warning(f"Error inserting institution {idx}: {e}")
                    continue
        
        # Populate citations table  
        if citations_df is not None:
            logger.info(f"Processing {len(citations_df)} citations...")
            for idx, row in citations_df.iterrows():
                try:
                    conn.execute('''
                        INSERT OR REPLACE INTO citations 
                        (id, citing_paper_id, cited_paper_id, citation_context, citation_sentiment, citation_type)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (
                        str(row.get('citation_id', f'citation_{idx}')),
                        str(row.get('citing_paper_id', '')),
                        str(row.get('cited_paper_id', '')),
                        str(row.get('citation_context', '')),
                        str(row.get('citation_sentiment', '')),
                        str(row.get('citation_type', ''))
                    ))
                except Exception as e:
                    logger.warning(f"Error inserting citation {idx}: {e}")
                    continue
                    
                # Only process first 1000 citations to avoid memory issues
                if idx >= 1000:
                    break
        
        conn.commit()
        conn.close()
        
        logger.info("Database populated successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error populating database: {e}")
        return False

def get_database_stats(db_path):
    """Get database statistics"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        stats = {}
        
        # Count papers
        cursor.execute("SELECT COUNT(*) FROM papers")
        stats['papers_total'] = cursor.fetchone()[0]
        
        # Count researchers
        cursor.execute("SELECT COUNT(*) FROM researchers")
        stats['researchers_total'] = cursor.fetchone()[0]
        
        # Count institutions
        cursor.execute("SELECT COUNT(*) FROM institutions")
        stats['institutions_total'] = cursor.fetchone()[0]
        
        # Count citations
        cursor.execute("SELECT COUNT(*) FROM citations")
        stats['citations_total'] = cursor.fetchone()[0]
        
        # Get averages
        cursor.execute("SELECT AVG(citation_count) FROM papers WHERE citation_count > 0")
        avg_citations = cursor.fetchone()[0]
        stats['avg_citations'] = round(avg_citations, 2) if avg_citations else 0
        
        cursor.execute("SELECT AVG(h_index) FROM researchers WHERE h_index > 0")
        avg_h_index = cursor.fetchone()[0]
        stats['avg_h_index'] = round(avg_h_index, 2) if avg_h_index else 0
        
        conn.close()
        return stats
        
    except Exception as e:
        logger.error(f"Error getting database stats: {e}")
        return None

def main():
    """Main function to initialize VERSSAI dataset"""
    db_path = 'verssai_dataset.db'
    excel_path = 'VERSSAI_Massive_Dataset_Complete.xlsx'
    
    logger.info("🚀 Initializing VERSSAI Dataset for Real Backend...")
    
    # Create database tables
    create_database_tables(db_path)
    
    # Populate from Excel file
    if populate_database_from_excel(db_path, excel_path):
        logger.info("✅ Dataset populated successfully")
        
        # Get statistics
        stats = get_database_stats(db_path)
        if stats:
            logger.info(f"📊 Dataset Statistics:")
            logger.info(f"   Papers: {stats['papers_total']}")
            logger.info(f"   Researchers: {stats['researchers_total']}")
            logger.info(f"   Institutions: {stats['institutions_total']}")
            logger.info(f"   Citations: {stats['citations_total']}")
            logger.info(f"   Avg Citations per Paper: {stats['avg_citations']}")
            logger.info(f"   Avg H-Index: {stats['avg_h_index']}")
            
            logger.info("🎉 VERSSAI dataset ready for real backend integration!")
        else:
            logger.error("❌ Failed to get dataset statistics")
    else:
        logger.error("❌ Failed to populate dataset")

if __name__ == "__main__":
    main()
