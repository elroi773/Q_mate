// src/supabase.js
import { createClient } from '@supabase/supabase-js'

// 1) 클라이언트 생성 (프로젝트 전체에서 공용으로 사용)
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// 2) 로그인 유저 가져오기
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  return user
}

// 3) 면접 폼 + 질문 저장 함수
export async function saveInterviewFormToSupabase({ position, photo, questions }) {
  // 1) 로그인 유저 가져오기
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('로그인 정보가 없습니다. (user가 null)')
  }

  // 2) interview_forms에 한 건 insert
  const { data: formRows, error: formError } = await supabase
    .from('interview_forms')
    .insert([
      {
        user_id: user.id,   // ✅ 로그인한 유저의 id
        position,           // '취업' 등
        photo,              // base64 문자열 or 스토리지 경로
      },
    ])
    .select('id')           // insert 후 id 받고 싶음

  if (formError) throw formError

  const form = formRows?.[0]
  if (!form) throw new Error('폼 저장은 되었는데 id를 못 가져왔습니다.')

  const formId = form.id

  // 3) questions 배열을 DB형태로 변환
  const questionPayload = questions.map((q, idx) => ({
    form_id: formId,
    order_no: q.id ?? idx + 1,  // 화면에서 쓰던 question.id
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
