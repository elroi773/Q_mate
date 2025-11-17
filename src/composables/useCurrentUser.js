// src/composables/useCurrentUser.js
import { ref } from 'vue'

const currentUser = ref(null)

// 로그인 후에 호출해서 현재 유저를 저장
export function setCurrentUser(user) {
  currentUser.value = user
  try {
    localStorage.setItem('currentUser', JSON.stringify(user))
  } catch (e) {
    console.error('currentUser 저장 실패:', e)
  }
}

// 앱 실행 후 어딘가에서/사용 시 자동으로 복원
function loadFromStorageOnce() {
  if (currentUser.value) return
  try {
    const raw = localStorage.getItem('currentUser')
    if (raw) {
      currentUser.value = JSON.parse(raw)
    }
  } catch (e) {
    console.error('currentUser 로드 실패:', e)
  }
}

export function useCurrentUser() {
  loadFromStorageOnce()
  return { currentUser }
}
