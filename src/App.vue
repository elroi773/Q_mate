<template>
  <div id="app" :class="directionClass">
    <RouterView v-slot="{ Component, route }">
      <Transition name="glide" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const directionClass = ref("forward");
const route = useRoute();
const stack = ref([route.fullPath]);

watch(route, (to) => {
  const i = stack.value.indexOf(to.fullPath);
  if (i !== -1) { directionClass.value = "back"; stack.value = stack.value.slice(0, i + 1); }
  else { directionClass.value = "forward"; stack.value.push(to.fullPath); }
}, { immediate: true });
</script>

<style scoped>
/* ===== 미세조정용 변수 ===== */
:host, #app {
  --route-duration: 760ms;                 /* ← 더 느리게: 700~900ms 사이 추천 */
  --route-ease: cubic-bezier(.25,.8,.25,1);/* ← iOS 스타일의 부드러운 ease-in-out */
  --enter-shift: 8%;                       /* ← 새 페이지 시작 위치 (작을수록 담백) */
  --leave-shift: 4%;                       /* ← 이전 페이지가 밀려나는 거리 */
  --enter-scale: .994;                     /* ← 아주 미세한 깊이감 (0.990~1) */
  --leave-scale: .997;
}

/* 성능 힌트 */
.glide-enter-active,
.glide-leave-active {
  will-change: transform;
  backface-visibility: hidden;
  transition: transform var(--route-duration) var(--route-ease);
}

/* 앞으로 가기: 오른쪽 → 왼쪽 */
.forward .glide-enter-from { transform: translate3d(var(--enter-shift),0,0) scale(var(--enter-scale)); }
.forward .glide-enter-to   { transform: translate3d(0,0,0)                  scale(1);                }
.forward .glide-leave-from { transform: translate3d(0,0,0)                  scale(1);                }
.forward .glide-leave-to   { transform: translate3d(calc(-1 * var(--leave-shift)),0,0) scale(var(--leave-scale)); }

/* 뒤로 가기: 왼쪽 → 오른쪽 */
.back .glide-enter-from { transform: translate3d(calc(-1 * var(--enter-shift)),0,0) scale(var(--enter-scale)); }
.back .glide-enter-to   { transform: translate3d(0,0,0)                                scale(1);                }
.back .glide-leave-from { transform: translate3d(0,0,0)                                scale(1);                }
.back .glide-leave-to   { transform: translate3d(var(--leave-shift),0,0)               scale(var(--leave-scale)); }

/* 모션 최소화 환경 존중 */
@media (prefers-reduced-motion: reduce) {
  :host, #app { --route-duration: 160ms; --enter-shift: 0%; --leave-shift: 0%; --enter-scale: 1; --leave-scale: 1; }
}

/* 겹침 방지 */
#app { background: #fff; overflow: hidden; }
</style>
