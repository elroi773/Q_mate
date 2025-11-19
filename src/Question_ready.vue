<!-- src/Question_ready.vue -->
<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- 제목 -->
      <h1 class="text-3xl font-bold mb-8">면접 연습하기</h1>

      <!-- 면접 상황 선택 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">면접 상황</h2>
        <div class="flex flex-wrap gap-3">
          <button v-for="pos in positions" :key="pos" @click="position = pos" :class="[
            'px-6 py-2 rounded-full font-medium transition-all',
            position === pos
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
          ]">
            {{ pos }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 증명사진 섹션 -->
        <div class="bg-white rounded-lg shadow p-6 h-fit">
          <h3 class="text-lg font-semibold mb-4">증명사진</h3>
          <div @click="photoInputRef && photoInputRef.click()"
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors">
            <div v-if="photo" class="relative">
              <img :src="photo" alt="증명사진" class="w-full h-64 object-cover rounded" />
              <button @click.stop="photo = null"
                class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                <X :size="20" />
              </button>
            </div>
            <div v-else class="text-gray-500">
              <p class="text-sm mb-2">클릭하여 사진 업로드</p>
              <p class="text-xs text-gray-400">또는 드래그하여 추가</p>
            </div>
          </div>
          <input ref="photoInputRef" type="file" accept="image/*" @change="handlePhotoChange" class="hidden" />
        </div>

        <!-- 자소서 질문 섹션 -->
        <div class="lg:col-span-2">
          <h3 class="text-lg font-semibold mb-4">자소서 질문</h3>
          <p class="text-gray-600 text-sm mb-6">
            자소서 질문이 있다면 질문 문항과 답변을 적어주세요
          </p>

          <div class="relative">
            <button v-if="questions.length > 1" @click="scroll('left')"
              class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow hover:shadow-lg transition-shadow">
              <ChevronLeft :size="24" class="text-gray-600" />
            </button>

            <button v-if="questions.length > 1" @click="scroll('right')"
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow hover:shadow-lg transition-shadow">
              <ChevronRight :size="24" class="text-gray-600" />
            </button>

            <div ref="scrollContainerRef" class="overflow-x-auto scroll-smooth pb-4" style="scroll-behavior: smooth;">
              <div class="flex gap-4 min-w-min px-2">
                <div v-for="question in questions" :key="question.id"
                  class="bg-white rounded-lg shadow p-6 w-96 flex-shrink-0">
                  <div class="flex justify-between items-start mb-4">
                    <h4 class="font-semibold text-gray-700">질문 {{ question.id }}</h4>
                    <button v-if="questions.length > 1" @click="removeQuestion(question.id)"
                      class="text-red-500 hover:text-red-700 transition-colors">
                      <X :size="20" />
                    </button>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        질문 문항
                      </label>
                      <input type="text" placeholder="자소서 질문을 입력하세요" v-model="question.title"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        응답 내용
                      </label>
                      <textarea placeholder="답변을 입력하세요" v-model="question.content" rows="8"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>

                <!-- 추가 버튼 -->
                <button @click="addQuestion"
                  class="w-96 flex-shrink-0 bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all flex flex-col items-center justify-center gap-3 p-6 group">
                  <div class="bg-white/20 rounded-full p-3 group-hover:bg-white/30 transition-colors">
                    <Plus :size="32" />
                  </div>
                  <span class="font-semibold text-lg">질문 추가</span>
                  <span class="text-sm opacity-90">클릭하여 새 질문 추가</span>
                </button>
              </div>
            </div>
          </div>

          <p class="text-xs text-gray-500 mt-4">
            💡 팁: + 버튼을 눌러 계속 질문을 추가할 수 있습니다
          </p>
          <div class="next-wrap">
            <button class="next-btn" @click="goNext">다음으로 →</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template><script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { supabase, saveInterviewFormToSupabase, getCurrentUser } from '../supabaseClient'
import './Question_ready.css'

const router = useRouter()

// 상태
const position = ref('취업')
const photo = ref(null)
const questions = ref([{ id: 1, title: '', content: '' }])

// DOM ref
const scrollContainerRef = ref(null)
const photoInputRef = ref(null)

// 면접 상황 옵션
const positions = ['취업', '동아리', '알바', '입시', '기타']

// ✅ 이걸로 Supabase에 저장할 user_id 를 갖고 있을 거임
const currentUserId = ref(null)

// 🔍 MyPage랑 똑같이 getCurrentUser()로 로그인 유저 확인
onMounted(async () => {
  console.log('===== 🔍 QuestionReady.vue Mounted =====')

  const user = await getCurrentUser()
  console.log('[QuestionReady] getCurrentUser:', user)

  if (!user) {
    console.warn('[QuestionReady] 로그인 유저 없음 → 세션 없음')
    alert('로그인 정보가 없습니다. 다시 로그인 후 이용해 주세요.')
    return
  }

  currentUserId.value = user.id
  console.log('🟢 [QuestionReady] 로그인된 유저 ID:', currentUserId.value)

  // 🔽 DB에서 photo_url 가져오기
  try {
    const { data, error } = await supabase
      .from('users')                 // ✅ from
      .select('photo_url')
      .eq('id', currentUserId.value) // ✅ currentUserId
      .single()

    if (error) {
      console.error('[QuestionReady] 지정한 사진이 없습니다:', error)
    } else if (data?.photo_url) {
      photo.value = data.photo_url
      console.log('🖼 [QuestionReady] DB에 저장된 photo_url 사용:', photo.value)
    } else {
      console.log('[QuestionReady] photo_url 없음 → 기본 업로드 영역 노출')
    }
  } catch (e) {
    console.error('[QuestionReady] 프로필 사진 조회 중 예외 발생:', e)
  }
})

// 사진 업로드
function handlePhotoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    photo.value = event.target?.result || null
  }
  reader.readAsDataURL(file)
}

// 질문 추가
function addQuestion() {
  const newId = Math.max(...questions.value.map((q) => q.id), 0) + 1
  questions.value.push({ id: newId, title: '', content: '' })
  setTimeout(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.scrollLeft = scrollContainerRef.value.scrollWidth
    }
  }, 100)
}

// 질문 삭제
function removeQuestion(id) {
  if (questions.value.length <= 1) return
  questions.value = questions.value.filter((q) => q.id !== id)
}

// 스크롤 이동
function scroll(direction) {
  if (!scrollContainerRef.value) return
  const scrollAmount = 400
  scrollContainerRef.value.scrollBy({
    left: direction === 'left' ? -scrollAmount : scrollAmount,
    behavior: 'smooth'
  })
}

// 다음 단계로 이동
async function goNext() {
  console.log('[QuestionReady] goNext 호출, userId:', currentUserId.value)

  if (!currentUserId.value) {
    alert('로그인 정보를 찾을 수 없습니다. 다시 로그인 후 시도해주세요.')
    console.warn('[QuestionReady] currentUserId 없음 — getCurrentUser()에서 유저를 못받은 상태')
    return
  }

  try {
    console.log('[QuestionReady] Supabase 저장 요청 데이터:', {
      userId: currentUserId.value,
      position: position.value,
      photo: photo.value,
      questions: questions.value
    })

    const formId = await saveInterviewFormToSupabase({
      userId: currentUserId.value,
      position: position.value,
      photo: photo.value,
      questions: questions.value
    })

    console.log('[QuestionReady] Supabase에 저장된 form id:', formId)
    router.push({
      path: '/interview',
      query: { position: position.value } // 상황 쿼리로 전달
    })
  } catch (err) {
    console.error('[QuestionReady] 면접 폼 저장 실패:', err)
    alert('면접 폼 저장 중 오류가 발생했습니다. 다시 시도해주세요.')
  }
}
</script>
