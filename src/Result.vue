<template>
    <div class="result-wrap">
      <h1 class="title">모의 면접 결과</h1>
  
      <section class="top">
        <!-- 좌측: 증명사진 + 기본 정보 -->
        <div class="left">
          <div class="photo-box">
            <img v-if="photo" :src="photo" alt="증명사진" class="photo" />
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
                :style="{ transition: `stroke-dashoffset ${duration}ms ease` }"
              />
            </svg>
            <div class="score">
              <div class="percent">{{ Math.round(animatedScore) }}%</div>
              <div class="caption">모의 면접 점수</div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- 하단: 이해를 돕는 이미지 + 설명 -->
      <section class="bottom">
        <h3 class="sub-title">면접 AI 가 캐치한 내 태도</h3>
  
        <div class="gallery">
          <img :src="helperImg1" alt="예시 이미지 1" class="helper" />
          <img :src="helperImg2" alt="예시 이미지 2" class="helper" />
  
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
  import { computed, onMounted, ref, nextTick } from 'vue'
  import './Result.css'
  
  const STORAGE_KEY = 'interviewForm'
  
  // ===== 화면 상태 =====
  const photo = ref(null)
  const position = ref('취업')
  const intro = ref('안녕하세요! 저는 어제보다 더 나은 내일을 만드는 FE 개발자 입니다!')
  // 이름 저장 로직이 별도라면 동일 방식으로 불러오세요. 여기서는 임시값.
  const name = ref('김이레')
  
  // ===== 게이지/숫자 애니메이션 =====
  const score = ref(50)            // 목표 점수 (필요시 갱신)
  const animatedScore = ref(0)     // 0 → score까지 증가
  const duration = 1000            // 애니메이션 시간(ms)
  
  const size = 220
  const stroke = 12
  const center = computed(() => size / 2)
  const radius = computed(() => center.value - stroke / 2)
  const circumference = computed(() => 2 * Math.PI * radius.value)
  const dashoffset = computed(() => {
    const ratio = Math.max(0, Math.min(100, animatedScore.value)) / 100
    return circumference.value * (1 - ratio)
  })
  
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
  }
  
  async function startAnimation() {
    // DOM이 그려진 뒤 시작해야 transition이 보임
    await nextTick()
    const start = performance.now()
  
    function frame(now) {
      const raw = Math.min((now - start) / duration, 1)
      const eased = easeOutCubic(raw)
      animatedScore.value = score.value * eased
      if (raw < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }
  
  // ===== 데이터 로드 + 애니메이션 시작 =====
  onMounted(async () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.photo) photo.value = parsed.photo
        if (parsed?.position) position.value = parsed.position
        const first = Array.isArray(parsed?.questions) ? parsed.questions[0] : null
        if (first?.content?.trim()) intro.value = first.content.trim()
      }
    } catch (e) {
      console.error('결과 로드 실패:', e)
    }
    startAnimation()
  })
  
  // ===== 예시 이미지(원하시는 로컬/프로젝트 자산으로 교체하세요) =====
  const helperImg1 = ref('https://picsum.photos/seed/hand-talk/480/320')
  const helperImg2 = ref('https://picsum.photos/seed/hand-pose/480/320')
  </script>
  <style  src="./Result.css" scoped></style>