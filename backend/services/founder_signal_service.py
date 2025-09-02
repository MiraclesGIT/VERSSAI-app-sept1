"""
VERSSAI Founder Signal CAG Service - Full Implementation

This service provides a comprehensive, context-augmented assessment of a founder
by querying structured, graph, and vector databases, constructing a detailed
prompt, and leveraging a generative AI model for analysis.
"""

import asyncio
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Dict, Any, Optional
import uuid
from neo4j import GraphDatabase, AsyncGraphDatabase, basic_auth

# App-specific imports
from backend.config import Config
from backend.database import get_db
from backend.gemini_ai_service import gemini_service

# --- DATABASE & SERVICE CLIENTS ---

# Neo4j Driver Dependency
# This will be initialized once and reused across requests.
neo4j_driver = None

def get_neo4j_driver():
    global neo4j_driver
    if neo4j_driver is None:
        try:
            neo4j_driver = AsyncGraphDatabase.driver(
                Config.NEO4J_URI, 
                auth=basic_auth(Config.NEO4J_USER, Config.NEO4J_PASSWORD)
            )
            print("✅ Neo4j Async Driver Initialized.")
        except Exception as e:
            print(f"❌ Failed to initialize Neo4j driver: {e}")
            raise HTTPException(status_code=503, detail="Could not connect to graph database.")
    return neo4j_driver

# TODO: Add Pinecone Client Initialization
# For now, we will mock it.
class PineconeClientMock:
    async def query(self, vector: List[float], top_k: int) -> List[Dict[str, Any]]:
        print("Executing Mock Pinecone Query")
        return [
            {"id": "news1", "score": 0.95, "metadata": {"text": "Founder praised for innovative approach to AI in a recent tech journal."}},
            {"id": "blog1", "score": 0.88, "metadata": {"text": "In a personal blog post, the founder discusses the challenges of scaling a tech startup and lessons learned."}}
        ]
pinecone_client = PineconeClientMock()


# --- API ROUTER ---

router = APIRouter(
    prefix="/signals",
    tags=["Founder Signals"],
)

# --- PYDANTIC MODELS ---

class FounderSignalRequest(BaseModel):
    founder_id: uuid.UUID = Field(..., description="The UUID of the founder to analyze.")

class FounderSignalResponse(BaseModel):
    founder_id: uuid.UUID
    founder_name: str
    overall_assessment: str
    key_strengths: List[str]
    potential_risks: List[str]
    evidence: Dict[str, Any] = Field(..., description="Evidence gathered from all data sources.")
    confidence_score: float

# --- DATA QUERYING HELPERS ---

async def query_postgres_data(founder_id: uuid.UUID, db: Session) -> Dict[str, Any]:
    """Queries PostgreSQL for structured founder data using raw SQL for clarity."""
    print(f"Querying Postgres for founder_id: {founder_id}")
    founder_query = text("SELECT * FROM founders WHERE id = :id")
    founder_result = db.execute(founder_query, {"id": founder_id}).first()
    if not founder_result:
        raise HTTPException(status_code=404, detail=f"Founder with ID {founder_id} not found.")

    work_exp_query = text("""
        SELECT c.name as company_name, w.title, w.start_date, w.end_date, w.is_founder_role
        FROM work_experience w JOIN companies c ON w.company_id = c.id
        WHERE w.founder_id = :id ORDER BY w.start_date DESC;
    """)
    work_results = db.execute(work_exp_query, {"id": founder_id}).mappings().all()

    edu_query = text("SELECT * FROM education WHERE founder_id = :id ORDER BY end_year DESC;")
    edu_results = db.execute(edu_query, {"id": founder_id}).mappings().all()

    return {
        "profile": dict(founder_result),
        "work_experience": [dict(row) for row in work_results],
        "education": [dict(row) for row in edu_results]
    }

async def query_neo4j_data(founder_id: uuid.UUID, driver) -> Dict[str, Any]:
    """Queries Neo4j for graph-based relationship insights."""
    print(f"Querying Neo4j for founder_id: {founder_id}")
    query = """
    MATCH (f:Founder {id: $founder_id})
    OPTIONAL MATCH (f)-[:FOUNDED]->(founded_co:Company)
    OPTIONAL MATCH (f)-[:WORKED_AT]->(worked_at_co:Company)
    WITH f, 
         collect(DISTINCT founded_co.name) as founded_companies, 
         collect(DISTINCT worked_at_co.name) as worked_at_companies
    OPTIONAL MATCH (f)-[:WORKED_AT]->(prev_exp)<-[:WORKED_AT]-(cofounder:Founder)
    WHERE cofounder <> f
    RETURN f.name as name, founded_companies, worked_at_companies, collect(DISTINCT cofounder.name) as past_colleagues
    """
    async with driver.session() as session:
        result = await session.run(query, founder_id=str(founder_id))
        data = await result.single()
        return dict(data) if data else {}

async def query_pinecone_data(founder_name: str) -> Dict[str, Any]:
    """Queries Pinecone for semantic context from unstructured data."""
    print(f"Querying Pinecone for founder: {founder_name}")
    query_embedding = await gemini_service.generate_embedding(f"News, articles, and analysis for founder {founder_name}")
    results = await pinecone_client.query(vector=query_embedding, top_k=3)
    return {"semantic_context": [res['metadata']['text'] for res in results]}

# --- PROMPT CONSTRUCTION ---

def construct_cag_prompt(founder_name: str, evidence: Dict[str, Any]) -> str:
    """Constructs a detailed, evidence-based prompt for the LLM."""
    return f"""
    **Role:** You are a meticulous, data-driven Venture Capital Analyst.
    **Task:** Generate a structured assessment of the founder named '{founder_name}'. Base your entire analysis *only* on the evidence provided below. Do not infer or add outside information. For each point, you must cite the source (PostgreSQL, Neo4j, or Pinecone).

    **Evidence Corpus:**

    **1. Professional History (Source: PostgreSQL)**
    - Profile: {evidence['postgres']['profile']}
    - Work Experience: {evidence['postgres']['work_experience']}
    - Education: {evidence['postgres']['education']}

    **2. Network & Relationships (Source: Neo4j)**
    - Graph Analysis: {evidence['neo4j']}

    **3. Public Narrative & Sentiment (Source: Pinecone)**
    - Semantic Search Results: {evidence['pinecone']['semantic_context']}

    **Required Output (JSON Object):**
    Provide your response as a single, valid JSON object with the following keys. Do not add any text outside of this JSON object.
    {{
        "overall_assessment": "A 2-3 sentence, evidence-based summary of the founder's potential, synthesizing all available data.",
        "key_strengths": [
            "Strength 1 (Citation: Source, specific data point)",
            "Strength 2 (Citation: Source, specific data point)"
        ],
        "potential_risks": [
            "Risk 1 (Citation: Source, specific data point)",
            "Risk 2 (Citation: Source, specific data point)"
        ],
        "confidence_score": "A float from 0.0 to 1.0 representing your confidence in this assessment based *only* on the quality and completeness of the provided evidence."
    }}
    """

# --- API ENDPOINT ---

@router.post("/founder", response_model=FounderSignalResponse)
async def get_founder_signal_assessment(
    request: FounderSignalRequest,
    db: Session = Depends(get_db),
    neo4j_driver = Depends(get_neo4j_driver)
):
    """
    Performs a comprehensive Context-Augmented Generation (CAG) assessment for a given founder.
    """
    founder_id = request.founder_id

    try:
        # 1. Gather evidence concurrently from all data sources
        postgres_data = await query_postgres_data(founder_id, db)
        founder_name = postgres_data.get("profile", {}).get("full_name", "Unknown Founder")

        neo4j_task = query_neo4j_data(founder_id, neo4j_driver)
        pinecone_task = query_pinecone_data(founder_name)

        neo4j_data, pinecone_data = await asyncio.gather(neo4j_task, pinecone_task)

        evidence = {
            "postgres": postgres_data,
            "neo4j": neo4j_data,
            "pinecone": pinecone_data
        }

        # 2. Construct the detailed, evidence-based prompt
        prompt = construct_cag_prompt(founder_name, evidence)

        # 3. Call the Generative Model for the final assessment
        ai_response_json = await gemini_service.generate_json(prompt)
        
        if not all(k in ai_response_json for k in ["overall_assessment", "key_strengths", "potential_risks", "confidence_score"]):
            raise HTTPException(status_code=500, detail="AI service returned a malformed JSON response.")

        # 4. Format and return the final, structured response
        return FounderSignalResponse(
            founder_id=founder_id,
            founder_name=founder_name,
            overall_assessment=ai_response_json["overall_assessment"],
            key_strengths=ai_response_json["key_strengths"],
            potential_risks=ai_response_json["potential_risks"],
            confidence_score=ai_response_json["confidence_score"],
            evidence=evidence
        )

    except HTTPException as he:
        raise he # Re-raise HTTP exceptions (like 404 Not Found)
    except Exception as e:
        print(f"❌ An unexpected error occurred during founder assessment: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")

# --- INTEGRATION WITH INTELLIGENCE ORCHESTRATOR ---

# To integrate this service with your existing `intelligence_orchestrator.py`,
# you would modify the orchestrator to make an HTTP request to this service
# instead of running its own internal logic.
#
# Example modification in `intelligence_orchestrator.py`:
#
# import httpx
#
# async def trigger_founder_analysis(self, founder_id: str, ...):
#     api_url = "http://localhost:8080/signals/founder" # Assuming the main app runs on 8080
#     try:
#         async with httpx.AsyncClient() as client:
#             response = await client.post(api_url, json={"founder_id": founder_id})
#             response.raise_for_status() # Raise an exception for bad status codes
#             return response.json()
#     except httpx.RequestError as e:
#         logger.error(f"API call to founder_signal_service failed: {e}")
#         return {"status": "failed", "error": "Could not connect to the signal service."}