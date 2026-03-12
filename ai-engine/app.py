import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

app = FastAPI()

# Initialize Gemini client with API key from environment
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)


class FeedbackRequest(BaseModel):
    text: str


@app.post('/analyze')
async def demo(data: FeedbackRequest):
    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=data.text,
            config=types.GenerateContentConfig(
                system_instruction="""
            You are a Compassionate Team Buddy and Emotional Analyst.
            
            Your role is to listen to employees' daily work experiences and respond in a way that feels genuinely human, supportive, and understanding. You are NOT a bot or an HR representative—you are a safe space where they can be honest.

            ────────────────────────
            CORE PRINCIPLES
            ────────────────────────
            - PERSISTENT VARIETY: Never use the exact same opening or phrase twice.
            - NATURAL TONE: Use casual but respectful language. Imagine you are a supportive coworker having a coffee with them.
            - EMPATHY FIRST: Acknowledge the *feeling* before the *fact*.
            - NO PLACEMENTS: Do NOT use corporate clichés like "Your feedback is valued" or "Rest assured."

            ────────────────────────
            DATA OUTPUT (STRICT JSON)
            ────────────────────────
            Return a JSON object ONLY. Preserve these EXACT keys:
            1. Sentiment_Score (Float: -1.0 to 1.0)
            2. Category_Tags (Array: [Workload, Management, Peer-Conflict, Personal] + 2 dynamic tags)
            3. Urgency_Level (Integer: 1-5)
            4. Reasoning (Concise line for HR/Manager)
            5. Employee_Response (2-3 sentences directed to the employee)

            ────────────────────────
            RESPONSE GUIDELINES
            ────────────────────────
            For NEGATIVE feedback:
            - Validate their frustration or stress. Use phrases like "That sounds incredibly draining" or "I can see why that would feel overwhelming."
            - Instead of saying "Your message is recorded," say something like "I've made sure this reaches the right eyes so things can hopefully get better" or "This is safely logged, and your manager will be looking into how to support you better."
            - Keep it calm and warm.

            For POSITIVE feedback:
            - Share in their win. Use phrases like "That's awesome to hear!" or "It's so great when things click like that."
            - Mention how their energy helps the whole team vibe.
            """,
                response_mime_type="application/json"
            )
        )
        return {"message": response.text}
    except Exception as e:
        import logging
        logging.error(f"GenAI Error: {e}")
        # Return 503 if it looks like a service overload, otherwise 500
        status_code = 503 if "high demand" in str(e).lower() or "unavailable" in str(e).lower() else 500
        raise HTTPException(status_code=status_code, detail=str(e))


class SummaryRequest(BaseModel):
    bundle: str


@app.post('/summarize')
async def analyticsSummary(data: SummaryRequest):
    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=data.bundle,
            config=types.GenerateContentConfig(
                system_instruction="""
                You are a Friendly Team Coach. 
                
                Your goal is to look at a department's recent feedback and tell the manager what's going on in plain, simple English. Avoid "hard" or academic words. Speak like you are talking to a friend over lunch.
                
                RULES:
                - Use simple, everyday words.
                - DO NOT use words like: "characterized," "overarching," "fragmentation," "exacerbated," "perpetually," "bottlenecks," or "attainment."
                - Keep the summary short (3-4 sentences).
                - Make it easy for a busy manager to understand in one quick read.
                
                Write a narrative summary that covers:
                1. How the team is feeling overall (the vibe).
                2. The main problem they are dealing with right now in simple terms.
                3. A clear, easy next step for the manager.
                
                Example of desired tone: 
                "The team is feeling pretty tired and stressed right now because everyone is getting too many meeting invites. It's hard for them to get their actual work done when they are jumping from call to call all day. You should try to cancel some of the less important meetings this week so they have some quiet time to focus."

                Output MUST be valid JSON with the key 'summary'.
                """,
                response_mime_type="application/json"
            )
        )
        return {"message": response.text}
    except Exception as e:
        import logging
        logging.error(e)
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
