<!-- src/pages/MyPage.vue -->
<template>
  <div class="mypage-root">
    <div class="mypage-shell">
      <!-- 상단 프로필 영역 -->
      <section class="mypage-header-card">
        <!-- 로딩 상태 -->
        <div v-if="status === 'loading'" class="mypage-skeleton">
          <div class="skeleton-avatar" />
          <div class="skeleton-text-block">
            <div class="skeleton-line short" />
            <div class="skeleton-line" />
            <div class="skeleton-line" />
          </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="status === 'error'" class="mypage-error">
          정보를 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.
        </div>

        <!-- 로그인 안 된 상태 -->
        <div v-else-if="status === 'empty'" class="mypage-empty">
          로그인된 사용자를 찾을 수 없어요.
          <span>로그인 후 다시 접속해주세요.</span>
        </div>

        <!-- 실제 프로필 -->
        <div v-else-if="status === 'ready' && profile" class="mypage-profile">
          <!-- 왼쪽 프로필 사진 -->
          <div class="mypage-avatar-wrap">
            <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="`${profile.name} 증명사진`"
              class="mypage-avatar" />
            <div v-else class="mypage-avatar-placeholder">
              <span>{{ profile.name?.[0] || "U" }}</span>
            </div>
          </div>

          <!-- 오른쪽 텍스트 영역 -->
          <div class="mypage-info">
            <div class="mypage-goal-row">
              <span class="mypage-goal-label">목적</span>
              <span class="mypage-goal-pill">{{ profile.goal }}</span>
            </div>

            <div class="mypage-name-row">
              <h1 class="mypage-name">{{ profile.name }}</h1>
              <span class="mypage-name-tag">나의 마이페이지</span>
            </div>

            <div class="mypage-intro-block">
              <div class="mypage-intro-title">한줄 자기소개</div>
              <p class="mypage-intro-text">
                {{
                  profile.intro ||
                  "아직 자기소개가 없어요. 설정 화면에서 한 줄 소개를 작성해보세요!"
                }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 하단 기록 영역 -->
      <section class="mypage-records-section">
        <div class="mypage-section-header">
          <div>
            <h2>기록</h2>
            <span class="mypage-section-sub">
              최근 면접 연습 결과와 히스토리가 여기에 쌓여요.
            </span>
          </div>

          <!-- ⭐ 여기 버튼 추가 -->
          <button class="mypage-cta-btn" @click="goInterview">
            면접 연습하러가기
          </button>
        </div>

        <div class="mypage-record-grid">
          <!-- 기록 없을 때 -->
          <template v-if="!records.length">
            <div class="mypage-record-card empty">
              <div class="empty-label">아직 기록이 없어요</div>
              <p class="empty-text">
                첫 면접 연습을 시작하면 이곳에 결과가 저장됩니다.
              </p>
            </div>
            <div class="mypage-record-card placeholder" />
            <div class="mypage-record-card placeholder" />
          </template>

          <!-- 기록 있을 때 -->
          <article v-for="item in records" :key="item.id" class="mypage-record-card">
            <div class="record-header">
              <span class="record-badge">{{ item.type || "면접" }}</span>
              <span class="record-date">{{ item.date }}</span>
            </div>
            <h3 class="record-title">{{ item.title }}</h3>
            <div v-if="item.score != null" class="record-score">
              점수 <span>{{ item.score }}</span> 점
            </div>
            <p class="record-desc">{{ item.memo }}</p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase, getCurrentUser } from "../supabaseClient";

const profile = ref(null);
const status = ref("loading"); // loading | ready | empty | error
const records = ref([]);
const router = useRouter();

// 면접 연습 페이지로 이동
const goInterview = () => {
  // 상태가 ready가 아니면 일단 막긴 막되, 로그인 페이지로는 안 튕기고 경고만
  if (status.value !== "ready" || !profile.value) {
    alert("프로필 정보를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.");
    return;
  }

  router.push("/question-ready");
};

onMounted(async () => {
  try {
    status.value = "loading";

    // ✅ 1) 로그인된 유저 확인 (세션 없으면 null 리턴)
    const user = await getCurrentUser();
    console.log("🔎 [MyPage] current user:", user);

    if (!user) {
      // 로그인 세션이 진짜 없는 상태
      status.value = "empty";
      // ❌ 일단 자동으로 /login 보내지 말고, 화면에 "로그인 후 다시 접속"만 표시
      return;
    }

    // ✅ 2) users 테이블에서 프로필 정보 조회
    const { data, error } = await supabase
      .from("users")
      .select("name, bio, photo_url, goal")
      .eq("id", user.id)
      .single();

    if (error) throw error;

    profile.value = {
      name: data?.name || loginUser.name,
      avatarUrl: data?.photo_url || null,  // 없으면 기본 아바타 보여줌
      intro: data?.bio || "",               // 한 줄 자기소개
      goal: data?.goal || "취업",
    };

    status.value = "ready";
  } catch (err) {
    console.error("Profile load error:", err);
    status.value = "error";
  }
});
</script>



<style scoped src="./MyPage.css"></style>