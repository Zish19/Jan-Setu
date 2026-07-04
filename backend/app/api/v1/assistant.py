from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from google import genai
from ..config.settings import settings
import asyncio

router = APIRouter()

# Configure Gemini securely via centralized settings
gemini_api_key = settings.GEMINI_API_KEY
client = genai.Client(api_key=gemini_api_key) if gemini_api_key else None

class Citation(BaseModel):
    id: str
    type: str
    title: str

class AssistantRequest(BaseModel):
    query: str
    context: Optional[dict] = None

class AssistantResponse(BaseModel):
    text: str
    citations: List[Citation]

@router.post("/query", response_model=AssistantResponse)
async def query_assistant(request: AssistantRequest):
    """
    RAG Assistant Endpoint.
    Retrieves relevant clusters/projects and answers the MP's question.
    """
    # 1. Simulate Retrieval (In production, this would search Firestore vector embeddings)
    await asyncio.sleep(1) # Simulate DB latency
    
    # Mock retrieved context based on likely questions
    citations = []
    prompt_context = ""
    
    if "ward" in request.query.lower() or "first" in request.query.lower():
        citations.append(Citation(id="1", type="cluster", title="Severe Road Damage"))
        prompt_context = "Ward 4 has the highest concentration of severe road damage (Priority 95)."
    elif "budget" in request.query.lower():
        citations.append(Citation(id="OPT-04", type="optimization", title="Budget Run #04"))
        prompt_context = "The total budget utilized is 2.4 Cr, mostly allocated to Roads and Healthcare."
    else:
        citations.append(Citation(id="CL-ALL", type="analytics", title="Constituency Analytics"))
        prompt_context = "General constituency health is good, with 84 open clusters remaining."

    # 2. Call Gemini
    if not client:
        # Fallback if no API key is present during demo
        return AssistantResponse(
            text=f"Based on the data, {prompt_context} (Mocked response - API key missing)",
            citations=citations
        )
        
    try:
        sys_instruct = (
            "You are Jan-Setu, an AI constituency intelligence analyst. "
            "Answer the user's question using ONLY the provided context. "
            "Never invent data, project IDs, or cluster IDs. "
            "Keep the answer concise, use markdown formatting, and bullet points."
        )
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=f"Context: {prompt_context}\n\nQuestion: {request.query}",
            config=genai.types.GenerateContentConfig(
                system_instruction=sys_instruct,
                temperature=0.2,
            )
        )
        
        return AssistantResponse(
            text=response.text or "I could not generate an answer.",
            citations=citations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
