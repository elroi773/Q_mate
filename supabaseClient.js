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
    // 최소한 id는 있어야 "로그인된 유저"로 인정
    if (!parsed.id) return null;
    return parsed; // { id, name }
  } catch (e) {
    console.error("getLocalLoginUser parse error:", e);
    return null;
  }
}

// ✅ 2) 기존 getCurrentUser 인터페이스 유지 (async)
export async function getCurrentUser() {
  // 나중에 Supabase Auth를 섞어 쓸 거면 여기서 조건 분기하면 됨
  return getLocalLoginUser();
}

// ✅ 3) 면접 폼 + 질문 저장 (users 테이블 기준 user_id 사용)
export async function saveInterviewFormToSupabase({
  position,
  photo,
  questions,
}) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(); // <- 여기서 AuthSessionMissingError 발생

  if (userError) throw userError;
  if (!user) throw new Error("로그인된 사용자가 없습니다.");

  const { data, error } = await supabase
    .from("interview_forms")
    .insert({
      user_id: user.id,
      position,
      photo,
      questions,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
