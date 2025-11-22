# 실행 방법
# & D:\Q_mate\.venv\Scripts\Activate.ps1
# cd backend
# uvicorn main:app --reload --port 8000

from fastapi import FastAPI, UploadFile, File, Query, Form
import google.generativeai as genai
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
import whisper
import tempfile

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

# --- Whisper 모델 로드 (최초 한 번) ---
whisper_model = whisper.load_model("base")

# -- 질문 생성 --
@app.get("/api/interview-question")
async def interview_question(position: str = Query("일반")):
    prompt = f"너는 전문 면접관이야. 다른 불필요한 대답하지말고 {position} 면접 질문 한 문장 만들어서 그것만 출력해줘."
    response = model.generate_content(prompt)
    question = response.text.strip()

    print(f"Generated question for {position}:", question)
    return {"question": question}

# --- 답변 평가 ---
@app.post("/api/evaluate-answer")
async def evaluate_answer(
    file: UploadFile = File(...),
    question: str = Form(...)
):
    # 1. 업로드된 파일을 임시 파일로 저장
    import tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # 2. Whisper로 음성 → 텍스트
    result = whisper_model.transcribe(tmp_path, language="ko")
    answer_text = result["text"].strip()
    print("사용자 답변: ", answer_text)

    # 3. AI 평가
    prompt = f"""
    너는 면접관이야.
    질문: {question}
    지원자 답변: {answer_text}
    답변이 질문을 얼마나 잘 이해하고 정확히 답했는지 0~100 점으로 숫자만 출력해줘.
    점수는 최대한 후하게 잘 주었으면 좋겠어.
    """
    response = model.generate_content(prompt)
    try:
        score = int(''.join(filter(str.isdigit, response.text)))
    except:
        score = 0

    print("AI가 판단한 점수:", score)

    return score