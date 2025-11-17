// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ✅ 1) localStorage에서 로그인 유저 가져오기 (동기 함수)
export function getLocalLoginUser() {
  try {
    const raw = localStorage.getItem('loginUser')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    // 최소한 id는 있어야 "로그인된 유저"로 인정
    if (!parsed.id) return null
    return parsed       // { id, name }
  } catch (e) {
    console.error('getLocalLoginUser parse error:', e)
    return null
  }
}

// ✅ 2) 기존 getCurrentUser 인터페이스 유지 (async)
export async function getCurrentUser() {
  // 나중에 Supabase Auth를 섞어 쓸 거면 여기서 조건 분기하면 됨
  return getLocalLoginUser()
}

// ✅ 3) 면접 폼 + 질문 저장 (users 테이블 기준 user_id 사용)
export async function saveInterviewFormToSupabase({ position, photo, questions }) {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('로그인이 필요한 기능입니다.')
  }

  // ⛔️ 여기 user.id는 이제 auth.users(id)가 아니라, public.users(id)
  const { data: formRows, error: formError } = await supabase
    .from('interview_forms')
    .insert([
      {
        user_id: user.id,  // ← users 테이블의 PK
        position,
        photo,
      },
    ])
    .select('id')

  if (formError) throw formError

  const form = formRows?.[0]
  if (!form) throw new Error('폼 저장은 되었는데 id를 못 가져왔습니다.')

  const formId = form.id

  const questionPayload = questions.map((q, idx) => ({
    form_id: formId,
    order_no: q.id ?? idx + 1,
    title: q.title || '',
    content: q.content || '',
  }))

  if (questionPayload.length > 0) {
    const { error: qError } = await supabase
      .from('interview_form_questions')
      .insert(questionPayload)

    if (qError) throw qError
  }

  return formId
}
