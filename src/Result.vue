<template>
    <div class="result-wrap">
      <h1 class="title">모의 면접 결과</h1>
  
      <section class="top">
        <!-- 좌측: 증명사진 + 기본 정보 -->
        <div class="left">
          <div class="photo-box">
            <img
              v-if="photo"
              :src="photo"
              alt="증명사진"
              class="photo"
            />
            <div v-else class="photo-empty">사진이 없습니다</div>
          </div>
  
          <div class="info">
            <div class="row">
              <span class="label">이름 :</span>
              <span class="name">{{ name }}</span>
            </div>
  
            <button class="badge">{{ position }}</button>
  
            <div class="intro">
              <h3>한줄 자기소개</h3>
              <p>{{ intro }}</p>
            </div>
          </div>
        </div>
  
        <!-- 우측: 원형 점수 -->
        <div class="right">
          <div class="circle">
            <svg :width="size" :height="size" class="ring">
              <circle
                class="bg"
                :cx="center"
                :cy="center"
                :r="radius"
                fill="transparent"
                :stroke-width="stroke"
              />
              <circle
                class="fg"
                :cx="center"
                :cy="center"
                :r="radius"
                fill="transparent"
                :stroke-width="stroke"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashoffset"
                stroke-linecap="round"
              />
            </svg>
            <div class="score">
              <div class="percent">{{ score }}%</div>
              <div class="caption">모의 면접 점수</div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- 하단: 이해를 돕는 이미지 + 설명 -->
      <section class="bottom">
        <h3 class="sub-title">면접 AI 가 캐치한 내 태도</h3>
  
        <div class="gallery">
          <img
            :src="helperImg1"
            alt="예시 이미지 1"
            class="helper"
          />
          <img
            :src="helperImg2"
            alt="예시 이미지 2"
            class="helper"
          />
  
          <div class="notes">
            <p>
              <strong>면접 도중 과도한 바디 랭귀지, 과도한 손 떨림</strong>이 감지되었어요!
            </p>
            <p class="muted">
              과도한 바디 랭귀지와 손 떨림은 주의가 산만해 보일 수 있어서 보기 안좋아요!
            </p>
            <p class="muted small">(* 이해를 돕기 위한 예시 이미지 입니다)</p>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  import { computed, onMounted, ref } from 'vue'
  
  /**
   * 저장 포맷 가정:
   * localStorage.interviewForm = {
   *   position: "취업",
   *   photo: "data:image/png;base64,...",
   *   questions: [{ id, title, content }, ...],
   *   savedAt: "ISO-STRING"
   * }
   */
  const STORAGE_KEY = 'interviewForm'
  
  // ==== 화면 표시용 상태 ====
  const photo = ref(null)
  const position = ref('취업')
  const intro = ref('안녕하세요! 저는 어제보다 더 나은 내일을 만드는 FE 개발자 입니다!')
  // 이름은 별도의 저장이 없으니 임시 값/props로 대체 (필요 시 바꾸세요)
  const name = ref('김이레')
  
  // 저장 데이터 로드
  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.photo) photo.value = parsed.photo
      if (parsed?.position) position.value = parsed.position
      // 첫 질문의 content를 한줄 자기소개로 사용 (없으면 기존 예시 유지)
      const first = Array.isArray(parsed?.questions) ? parsed.questions[0] : null
      if (first?.content && String(first.content).trim().length > 0) {
        intro.value = first.content
      }
    } catch (e) {
      console.error('결과 로드 실패:', e)
    }
  })
  
  // ====== 점수 원형 게이지 (SVG) ======
  const score = ref(50)             // 기본 50, 필요 시 API/계산값으로 교체
  const size = 220                  // 원형 전체 크기(px)
  const stroke = 12                 // 라인 두께
  const center = computed(() => size / 2)
  const radius = computed(() => center.value - stroke / 2)
  const circumference = computed(() => 2 * Math.PI * radius.value)
  const dashoffset = computed(() => {
    const ratio = Math.max(0, Math.min(100, score.value)) / 100
    return circumference.value * (1 - ratio)
  })
  
  // ====== 예시 이미지(교체 가능) ======
  const helperImg1 = ref('https://picsum.photos/seed/hand-talk/480/320')
  const helperImg2 = ref('https://picsum.photos/seed/hand-pose/480/320')
  </script>
  
  <style src="./Result.css" scoped></style>
  