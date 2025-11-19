# 실행 방법
# cd backend
# uvicorn main:app --reload --port 8000

from fastapi import FastAPI, Query
import google.generativeai as genai
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Gemini 설정 ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash-lite")

@app.get("/api/interview-question")
async def interview_question(position: str = Query("일반")):
    # 프롬프트로 질문 생성
    prompt = f"너는 전문 면접관이야. 다른 불필요한 대답하지말고 {position} 면접 질문 한 문장 만들어서 그것만 출력해줘."
    response = model.generate_content(prompt)
    question = response.text.strip()

    print(f"Generated question for {position}:", question)
    return {"question": question}
