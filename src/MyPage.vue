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
              <img
                v-if="profile.avatarUrl"
                :src="profile.avatarUrl"
                :alt="`${profile.name} 증명사진`"
                class="mypage-avatar"
              />
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
            <h2>기록</h2>
            <span class="mypage-section-sub">
              최근 면접 연습 결과와 히스토리가 여기에 쌓여요.
            </span>
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
            <article
              v-for="item in records"
              :key="item.id"
              class="mypage-record-card"
            >
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
  import { supabase } from "../supabaseClient"; 
  const profile = ref(null);
  const status = ref("loading"); // loading | ready | empty | error
  
  // TODO: 나중에 Supabase interview_records 같은 테이블에서 불러오면 됨
  const records = ref([]);
  // 예시용 더미 데이터 쓰고 싶으면 아래 주석 풀기
  /*
  records.value = [
    { id: 1, title: "1차 면접 연습", date: "2025.11.01", score: 82, memo: "시선 처리가 좋았어요." },
    { id: 2, title: "2차 면접 연습", date: "2025.11.05", score: 88, memo: "답변 구조가 훨씬 깔끔해짐." },
  ];
  */
  
  onMounted(async () => {
    try {
      // 1) 로그인된 유저
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
  
      if (userError) throw userError;
      if (!user) {
        status.value = "empty";
        return;
      }
  
      // 2) users 테이블에서 프로필 정보 조회
      //    테이블명/컬럼명은 실제 DB에 맞게 수정
      const { data, error } = await supabase
        .from("users") // 👈 users 테이블
        .select("name, avatar_url, intro, goal")
        .eq("id", user.id)
        .single();
  
      if (error) throw error;
  
      profile.value = {
        name: data?.name || user.email,
        avatarUrl: data?.avatar_url,
        intro: data?.intro || "",
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