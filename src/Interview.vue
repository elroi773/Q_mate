<template>
  <div class="interview-container">
    <div class="interview-page">
      <header class="topbar">
        <h1 class="brand">면접 연습하기</h1>

        <div class="status-pill" :class="{ on: micOn }">
          <span class="dot" />
          <span>{{ micOn ? '마이크 ON' : '마이크 OFF' }}</span>
        </div>
      </header>

      <main class="stage">
        <!-- 면접관 화면 -->
        <section class="panel interviewers">
          <PanelHeader />

          <div class="panel-body">
            <img
              v-if="interviewerImageSrc"
              :src="interviewerImageSrc"
              alt="면접관 화면"
            />

            <div v-else class="img-placeholder">
              <UserIcon />
              <p>면접관 영상 자리 (이미지로 교체)</p>
            </div>
          </div>
        </section>

        <!-- 내 카메라 화면 -->
        <section class="panel mycam">
          <PanelHeader />

          <div class="panel-body cam-body">
            <div v-if="cameraOn" class="cam-stream">
              <video
                ref="videoRef"
                autoplay
                playsinline
                class="cam-video"
              />

              <button type="button" class="cam-cta small" @click="stopCamera">
                카메라 끄기
              </button>
            </div>

            <button
              v-else
              type="button"
              class="cam-cta"
              @click="startCamera"
            >
              <CameraIcon />
              내 카메라 화면 켜기
            </button>
          </div>
        </section>

        <!-- TIP + AI 조언 -->
        <section class="tip-session">
          <aside class="tip">
            <div class="tip-head">
              <TipIcon />
              <span>TIP</span>
            </div>
            <p>말을 더듬지 않고, 또박또박 말해요!</p>
          </aside>

          <div ref="chatAdviceContainer" class="chat-advice">
            <div
              v-for="(advice, index) in adviceMessages"
              :key="index"
              class="advice-msg"
            >
              {{ advice }}
            </div>
          </div>
        </section>
      </main>

      <!-- 질문 영역 -->
      <footer class="qa-bar">
        <span class="badge">면접관</span>

        <div class="question">
          <span class="label">AI 질문</span>

          <div :class="['qtext', questionClass]">
            <template v-if="loading">
              <span class="skeleton" />
              <span class="skeleton" />
              <span class="skeleton short" />
            </template>

            <span v-else>
              {{ questionText || '질문을 받아오는 중입니다…' }}
            </span>
          </div>
        </div>

        <button class="mic" @click="handleMicClick" :aria-pressed="micOn">
          <div class="pulse" :class="{ active: micOn }" />
          <MicIcon />
        </button>

        <button class="refresh" @click="refreshQuestion">
          <RefreshIcon />
          새 질문
        </button>
      </footer>

      <div class="next-wrap">
        <button class="next-btn" @click="goResultPage">
          면접 종료하기 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import InterviewerImg from './img/Interview.png'

const API_BASE_URL = 'http://localhost:8000/api'
const MAX_QUESTIONS = 5
const RECORDING_LIMIT_MS = 60_000

const route = useRoute()
const router = useRouter()

const props = defineProps<{
  cameraOn?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-mic', value: boolean): void
  (e: 'start-camera'): void
  (e: 'stop-camera'): void
  (e: 'refresh-question'): void
}>()

const position = ref(String(route.query.position || '일반'))

const interviewerImageSrc = InterviewerImg

const micOn = ref(false)
const cameraOn = ref(Boolean(props.cameraOn))

const videoRef = ref<HTMLVideoElement | null>(null)
const cameraStream = ref<MediaStream | null>(null)

const isRecording = ref(false)
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioStream = ref<MediaStream | null>(null)
const recordingTimer = ref<number | null>(null)

const questionText = ref('질문을 받아오는 중입니다...')
const loading = ref(false)

const scores = ref<number[]>([])
const questionCount = ref(0)
const adviceMessages = ref<string[]>([])
const chatAdviceContainer = ref<HTMLElement | null>(null)

const questionClass = computed(() => {
  if (loading.value) return 'loading'
  if (questionText.value.includes('오류')) return 'error'
  return 'normal'
})

watch(
  () => props.cameraOn,
  (value) => {
    if (value !== undefined) {
      cameraOn.value = value
    }
  }
)

watch(adviceMessages, async () => {
  await nextTick()

  if (chatAdviceContainer.value) {
    chatAdviceContainer.value.scrollTop = chatAdviceContainer.value.scrollHeight
  }
})

// -----------------------------
// 질문 관련
// -----------------------------
async function refreshQuestion() {
  if (questionCount.value >= MAX_QUESTIONS) return

  loading.value = true
  questionText.value = '질문 생성 중…'

  try {
    const { data } = await axios.get(`${API_BASE_URL}/interview-question`, {
      params: {
        position: position.value,
      },
      withCredentials: true,
    })

    questionText.value = data.question || '질문을 불러오지 못했습니다.'
    emit('refresh-question')
  } catch (error) {
    console.error('질문 생성 오류:', error)
    questionText.value = '질문을 불러오는 중 오류가 발생했습니다.'
  } finally {
    loading.value = false
  }
}

// -----------------------------
// 마이크 / 녹음 관련
// -----------------------------
async function handleMicClick() {
  if (isRecording.value) {
    stopRecording()
    return
  }

  await startRecording()
}

async function startRecording() {
  if (isRecording.value) return

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })

    audioStream.value = stream

    const recorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, {
        type: 'audio/webm',
      })

      await evaluateAnswer(audioBlob)
      cleanupAudioStream()
    }

    mediaRecorder.value = recorder
    recorder.start()

    isRecording.value = true
    setMicState(true)

    recordingTimer.value = window.setTimeout(() => {
      stopRecording()
    }, RECORDING_LIMIT_MS)
  } catch (error) {
    console.error('마이크 실행 오류:', error)
    alert('마이크 권한을 허용했는지 확인해주세요.')
  }
}

function stopRecording() {
  if (!mediaRecorder.value || !isRecording.value) return

  mediaRecorder.value.stop()
  mediaRecorder.value = null

  isRecording.value = false
  setMicState(false)

  clearRecordingTimer()
}

function setMicState(value: boolean) {
  micOn.value = value
  emit('toggle-mic', value)
}

function clearRecordingTimer() {
  if (recordingTimer.value) {
    clearTimeout(recordingTimer.value)
    recordingTimer.value = null
  }
}

function cleanupAudioStream() {
  audioStream.value?.getTracks().forEach((track) => track.stop())
  audioStream.value = null
}

// -----------------------------
// AI 답변 평가 관련
// -----------------------------
async function evaluateAnswer(blob: Blob) {
  if (!blob) return

  const formData = new FormData()
  formData.append('file', blob)
  formData.append('question', questionText.value)

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/evaluate-answer`,
      formData
    )

    const score = Number(data.score || 0)
    const advice = String(data.advice || '')

    scores.value.push(score)
    questionCount.value += 1

    if (advice) {
      adviceMessages.value.push(advice)
    }

    if (questionCount.value >= MAX_QUESTIONS) {
      goResultPage()
      return
    }

    await refreshQuestion()
  } catch (error) {
    console.error('답변 평가 오류:', error)
    alert('답변 평가 중 오류가 발생했습니다.')
  }
}

// -----------------------------
// 카메라 관련
// -----------------------------
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    })

    cameraStream.value = stream
    cameraOn.value = true

    await nextTick()

    if (videoRef.value) {
      videoRef.value.srcObject = stream
    }

    emit('start-camera')
  } catch (error) {
    console.error('카메라 실행 오류:', error)
    alert('카메라 권한을 허용했는지, 브라우저/HTTPS 환경인지 확인해주세요.')
  }
}

function stopCamera() {
  cameraStream.value?.getTracks().forEach((track) => track.stop())
  cameraStream.value = null
  cameraOn.value = false

  emit('stop-camera')
}

// -----------------------------
// 결과 이동
// -----------------------------
function getAverageScore() {
  if (scores.value.length === 0) return 0

  const total = scores.value.reduce((sum, score) => sum + score, 0)
  return Math.round(total / scores.value.length)
}

function goResultPage() {
  router.push({
    path: '/result',
    query: {
      avgScore: getAverageScore(),
      position: position.value,
    },
  })
}

// -----------------------------
// 라이프사이클
// -----------------------------
onMounted(() => {
  refreshQuestion()
})

onBeforeUnmount(() => {
  stopCamera()
  stopRecording()
  cleanupAudioStream()
  clearRecordingTimer()
})
</script>

<style src="./Interview.css" scoped></style>
