"""
VERSSAI CAG Database Population Script

This script reads founder data from a JSON file and populates the PostgreSQL
and Neo4j databases according to the defined schemas.

It uses an idempotent "upsert" logic:
- PostgreSQL: Checks for existence before inserting.
- Neo4j: Uses the MERGE command to create nodes and relationships if they don't exist.

Usage:
  python scripts/populate_cag_databases.py

"""

import json
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from neo4j import GraphDatabase, basic_auth

# Add backend to path to import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.config import Config

# --- Configuration ---
DATA_FILE = os.path.join(os.path.dirname(__file__), '../data/sample_founder_data.json')

# --- PostgreSQL Connection ---
def get_postgres_session():
    try:
        engine = create_engine(Config.POSTGRES_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        print("✅ Successfully connected to PostgreSQL.")
        return session
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        sys.exit(1)

# --- Neo4j Connection ---
def get_neo4j_driver():
    try:
        driver = GraphDatabase.driver(Config.NEO4J_URI, auth=(Config.NEO4J_USER, "verssai_neo4j_2024"))
        driver.verify_connectivity()
        print("✅ Successfully connected to Neo4j.")
        return driver
    except Exception as e:
        print(f"❌ Neo4j connection failed: {e}")
        sys.exit(1)

# --- Data Loading Logic ---

def populate_databases(db_session, neo4j_driver, data):
    print("\n🚀 Starting database population...")
    with neo4j_driver.session() as neo4j_session:
        for entry in data:
            founder_data = entry['founder']
            education_data = entry['education']
            work_experience_data = entry['work_experience']

            # --- Populate PostgreSQL ---
            # 1. Upsert Founder
            db_session.execute(text("""
                INSERT INTO founders (id, full_name, linkedin_url, twitter_handle, github_username, bio)
                VALUES (:id, :full_name, :linkedin_url, :twitter_handle, :github_username, :bio)
                ON CONFLICT (id) DO UPDATE SET
                    full_name = EXCLUDED.full_name,
                    linkedin_url = EXCLUDED.linkedin_url,
                    twitter_handle = EXCLUDED.twitter_handle,
                    github_username = EXCLUDED.github_username,
                    bio = EXCLUDED.bio,
                    updated_at = NOW();
            """ ), params=founder_data)

            # 2. Upsert Education
            for edu in education_data:
                edu['founder_id'] = founder_data['id']
                db_session.execute(text("""
                    INSERT INTO education (founder_id, institution_name, degree, field_of_study, start_year, end_year)
                    VALUES (:founder_id, :institution_name, :degree, :field_of_study, :start_year, :end_year)
                    ON CONFLICT DO NOTHING; -- Simple approach for sample script
                """ ), params=edu)

            # 3. Upsert Companies and Work Experience
            for work in work_experience_data:
                company_data = work['company']
                db_session.execute(text("""
                    INSERT INTO companies (id, name, website, description, founded_date)
                    VALUES (:id, :name, :website, :description, :founded_date)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        website = EXCLUDED.website,
                        description = EXCLUDED.description,
                        founded_date = EXCLUDED.founded_date,
                        updated_at = NOW();
                """ ), params=company_data)

                work['founder_id'] = founder_data['id']
                work['company_id'] = company_data['id']
                db_session.execute(text("""
                    INSERT INTO work_experience (founder_id, company_id, title, start_date, end_date, is_founder_role)
                    VALUES (:founder_id, :company_id, :title, :start_date, :end_date, :is_founder_role)
                    ON CONFLICT (founder_id, company_id, title, start_date) DO NOTHING;
                """ ), params=work)

            # --- Populate Neo4j ---
            # Use MERGE to create nodes and relationships idempotently
            neo4j_session.run("""
                MERGE (f:Founder {id: $id})
                ON CREATE SET f.name = $full_name, f.linkedin = $linkedin_url
            """, **founder_data)

            for edu in education_data:
                neo4j_session.run("""
                    MERGE (u:University {name: $institution_name})
                    WITH u
                    MATCH (f:Founder {id: $founder_id})
                    MERGE (f)-[:ATTENDED {degree: $degree, field_of_study: $field_of_study}]->(u)
                """, **edu)

            for work in work_experience_data:
                company_data = work['company']
                neo4j_session.run("""
                    MERGE (c:Company {id: $id})
                    ON CREATE SET c.name = $name, c.website = $website
                    WITH c
                    MATCH (f:Founder {id: $founder_id})
                    MERGE (f)-[r:WORKED_AT]->(c)
                    SET r.title = CASE WHEN $title IS NOT NULL THEN $title ELSE r.title END,
                        r.start_date = CASE WHEN $start_date IS NOT NULL THEN $start_date ELSE r.start_date END,
                        r.end_date = CASE WHEN $end_date IS NOT NULL THEN $end_date ELSE r.end_date END
                """, **company_data, **work)

                if work['is_founder_role']:
                    neo4j_session.run("""
                        MATCH (f:Founder {id: $founder_id}), (c:Company {id: $company_id})
                        MERGE (f)-[:FOUNDED]->(c)
                    """, founder_id=founder_data['id'], company_id=company_data['id'])

            print(f"  Processed data for founder: {founder_data['full_name']}")

    db_session.commit()
    print("\n✅ PostgreSQL data committed.")
    print("✅ Neo4j data loaded.")


if __name__ == "__main__":
    # Load data from JSON file
    try:
        with open(DATA_FILE, 'r') as f:
            founder_data_list = json.load(f)
        print(f"📄 Loaded {len(founder_data_list)} founder entries from {DATA_FILE}")
    except FileNotFoundError:
        print(f"❌ Error: Data file not found at {DATA_FILE}")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"❌ Error: Could not decode JSON from {DATA_FILE}")
        sys.exit(1)

    # Get database connections
    pg_session = get_postgres_session()
    neo4j_driver = get_neo4j_driver()

    # Populate databases
    populate_databases(pg_session, neo4j_driver, founder_data_list)

    # Clean up
    pg_session.close()
    neo4j_driver.close()
    print("\n🎉 Database population complete.")
