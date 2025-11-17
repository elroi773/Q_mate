// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ✅ 1) localStorage에서 로그인 유저 가져오기 (동기 함수)
export function getLocalLoginUser() {
  try {
    const raw = localStorage.getItem("loginUser");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.id) return null; // id 없으면 로그인 실패로 간주
    return parsed;               // { id, name, ... }
  } catch (e) {
    console.error("getLocalLoginUser parse error:", e);
    return null;
  }
}

// ✅ 2) 기존 인터페이스 유지 (async)
export async function getCurrentUser() {
  return getLocalLoginUser();
}

// ✅ 3) 면접 폼 + 질문 저장
export async function saveInterviewFormToSupabase({
  userId,
  position,
  photo,
  questions,
}) {
  // 0) userId 최종 확정
  let finalUserId = userId;
  if (!finalUserId) {
    const loginUser = getLocalLoginUser();
    finalUserId = loginUser?.id;
  }
  if (!finalUserId) {
    throw new Error("로그인된 사용자를 찾을 수 없습니다.(userId 없음)");
  }

  // 1) interview_forms 에 헤더 정보 먼저 저장
  const { data: form, error: formError } = await supabase
    .from("interview_forms")
    .insert({
      user_id: finalUserId,
      position,   // ⚠️ enum 값(취업/동아리/알바/입시/기타)이랑 DB enum이 일치해야 함
      photo,
    })
    .select("id")
    .single();

  if (formError) {
    console.error("🔴 interview_forms insert error:", formError);
    throw formError;
  }

  const formId = form.id;

  // 2) interview_form_questions 에 질문들 저장
  //    title/내용 비어있는 카드들은 필터링
  const questionRows =
    (questions || [])
      .filter(
        (q) =>
          (q.title && q.title.trim().length > 0) ||
          (q.content && q.content.trim().length > 0)
      )
      .map((q, idx) => ({
        form_id: formId,
        order_no: idx + 1,
        title: q.title || "",
        content: q.content || "",
      }));

  if (questionRows.length > 0) {
    const { error: qError } = await supabase
      .from("interview_form_questions")
      .insert(questionRows);

    if (qError) {
      console.error("🔴 interview_form_questions insert error:", qError);
      throw qError;
    }
  }

  return formId;
}
