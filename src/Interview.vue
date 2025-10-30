<template>
    <div class="interview-page">
      <!-- Header strip -->
      <header class="topbar">
        <h1 class="brand">면접 연습하기</h1>
        <div class="status-pill" :class="{ on: micOn }">
          <span class="dot" />
          <span>{{ micOn ? '마이크 ON' : '마이크 OFF' }}</span>
        </div>
      </header>
  
      <main class="stage">
        <!-- Left: Interviewers window -->
        <section class="panel interviewers">
          <div class="panel-head">
            <span class="win-dot" />
            <span class="win-dot" />
            <span class="win-dot" />
          </div>
          <div class="panel-body">
            <img
              v-if="interviewerImageSrc"
              :src="interviewerImageSrc"
              alt="면접관 화면"
            />
            <div v-else class="img-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="56" height="56">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z"/>
              </svg>
              <p>면접관 영상 자리 (이미지로 교체)</p>
            </div>
          </div>
        </section>
  
        <!-- Right: My camera window -->
        <section class="panel mycam">
          <div class="panel-head">
            <span class="win-dot" />
            <span class="win-dot" />
            <span class="win-dot" />
          </div>
          <div class="panel-body cam-body">
            <div v-if="cameraOn" class="cam-stream">
              <!-- 실제 카메라 연결은 추후 MediaDevices로 구현 -->
              <div class="fake-stream">내 카메라 미리보기</div>
            </div>
            <button v-else class="cam-cta" @click="$emit('start-camera')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="44" height="44">
                <path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7c0-1.1-.9-2-2-2zm0 14H4V7h4.05l1.83-2h4.24l1.83 2H20v12z"/>
              </svg>
              내 카메라 화면 켜기
            </button>
          </div>
        </section>
  
        <!-- Tip card -->
        <aside class="tip">
          <div class="tip-head">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18"><path d="M9 21h6v-1H9v1zm3-20C6.48 1 2 5.48 2 11c0 3.53 1.84 6.62 4.6 8.4V21h10.8v-1.6C20.16 17.62 22 14.53 22 11 22 5.48 17.52 1 12 1zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
            <span>TIP</span>
          </div>
          <p>말을 더듬지 않고, 또박또박 말해요!</p>
        </aside>
      </main>
  
      <!-- Bottom: AI Question Bar -->
      <footer class="qa-bar">
        <span class="badge">면접관</span>
  
        <div class="question">
          <span class="label">AI 질문</span>
          <div class="qtext">
            <template v-if="loading">
              <span class="skeleton" />
              <span class="skeleton" />
              <span class="skeleton short" />
            </template>
            <span v-else>{{ questionText || '질문을 받아오는 중입니다…' }}</span>
          </div>
        </div>
  
        <button class="mic" @click="toggleMic" :aria-pressed="micOn">
          <div class="pulse" :class="{ active: micOn }" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
            <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zM11 19h2v3h-2z" />
          </svg>
        </button>
  
        <button class="refresh" @click="$emit('refresh-question')">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M12 6V3L8 7l4 4V8c2.76 0 5 2.24 5 5a5 5 0 0 1-8.66 3.54l-1.42 1.42A7 7 0 0 0 19 13c0-3.87-3.13-7-7-7z"/></svg>
          새 질문
        </button>
      </footer>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, watchEffect } from 'vue'
  import InterviewerImg from './img/Interview.png'

  
  // ✅ props: 백엔드에서 내려줄 값들만 유지
  const props = defineProps<{
    questionText?: string
    loading?: boolean
    cameraOn?: boolean
  }>()
  
  // ✅ 면접관 이미지는 내부 import 사용
  const interviewerImageSrc = InterviewerImg
  
  // Local UI states
  const micOn = ref(false)
  
  // mirror prop to local computed for simple truthy checks
  const cameraOn = ref(!!props.cameraOn)
  watchEffect(() => (cameraOn.value = !!props.cameraOn))
  
  const emit = defineEmits<{
    (e: 'toggle-mic', value: boolean): void
    (e: 'start-camera'): void
    (e: 'refresh-question'): void
  }>()
  
  function toggleMic() {
    micOn.value = !micOn.value
    emit('toggle-mic', micOn.value)
  }
  </script>
  
  <!-- ✅ 외부 CSS 분리 -->
  <style src="./Interview.css"></style>
  