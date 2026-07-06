<!-- src/pages/MyPage.vue -->
<template>
  <div class="mypage-root">
    <div class="mypage-shell">
      <!-- 상단 프로필 영역 -->
      <section class="mypage-header-card">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="mypage-skeleton">
          <div class="skeleton-avatar" />
          <div class="skeleton-text-block">
            <div class="skeleton-line short" />
            <div class="skeleton-line" />
            <div class="skeleton-line" />
          </div>
        </div>

        <!-- 에러 상태 -->
        <div v-else-if="isError" class="mypage-error">
          정보를 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.
        </div>

        <!-- 로그인 안 된 상태 -->
        <div v-else-if="isEmpty" class="mypage-empty">
          로그인된 사용자를 찾을 수 없어요.
          <span>로그인 후 다시 접속해주세요.</span>
        </div>

        <!-- 실제 프로필 -->
        <div v-else-if="isReady && profile" class="mypage-profile">
          <div class="mypage-avatar-wrap">
            <img
              v-if="profile.avatarUrl"
              :src="profile.avatarUrl"
              :alt="`${profile.name} 증명사진`"
              class="mypage-avatar"
            />

            <div v-else class="mypage-avatar-placeholder">
              <span>{{ profileInitial }}</span>
            </div>
          </div>

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
                {{ profileIntro }}
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

          <button class="mypage-cta-btn" @click="goInterview">
            면접 연습하러가기
          </button>
        </div>

        <div class="mypage-record-grid">
          <template v-if="hasNoRecords">
            <div class="mypage-record-card empty">
              <div class="empty-label">아직 기록이 없어요</div>
              <p class="empty-text">
                첫 면접 연습을 시작하면 이곳에 결과가 저장됩니다.
              </p>
            </div>

            <div class="mypage-record-card placeholder" />
            <div class="mypage-record-card placeholder" />
          </template>

          <article
            v-for="record in records"
            v-else
            :key="record.id"
            class="mypage-record-card"
          >
            <div class="record-header">
              <span class="record-badge">{{ record.type }}</span>
              <span class="record-date">{{ record.date }}</span>
            </div>

            <h3 class="record-title">{{ record.title }}</h3>

            <div v-if="record.score != null" class="record-score">
              점수 <span>{{ record.score }}</span> 점
            </div>

            <p class="record-desc">{{ record.memo }}</p>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase, getCurrentUser } from "../supabaseClient";

const PROFILE_STATUS = {
  LOADING: "loading",
  READY: "ready",
  EMPTY: "empty",
  ERROR: "error",
};

const DEFAULT_PROFILE = {
  name: "사용자",
  goal: "취업",
  intro: "",
  avatarUrl: null,
};

const DEFAULT_INTRO_MESSAGE =
  "아직 자기소개가 없어요. 설정 화면에서 한 줄 소개를 작성해보세요!";

const MEMO_MAX_LENGTH = 80;

const router = useRouter();

const profile = ref(null);
const status = ref(PROFILE_STATUS.LOADING);
const records = ref([]);

const isLoading = computed(() => status.value === PROFILE_STATUS.LOADING);
const isReady = computed(() => status.value === PROFILE_STATUS.READY);
const isEmpty = computed(() => status.value === PROFILE_STATUS.EMPTY);
const isError = computed(() => status.value === PROFILE_STATUS.ERROR);

const hasNoRecords = computed(() => records.value.length === 0);

const profileInitial = computed(() => {
  return profile.value?.name?.[0] || "U";
});

const profileIntro = computed(() => {
  return profile.value?.intro || DEFAULT_INTRO_MESSAGE;
});

const goInterview = () => {
  if (!isReady.value || !profile.value) {
    alert("프로필 정보를 불러오지 못했어요. 새로고침 후 다시 시도해 주세요.");
    return;
  }

  router.push("/question-ready");
};

const formatDate = (isoString) => {
  if (!isoString) return "";

  return new Date(isoString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const truncateText = (text, maxLength = MEMO_MAX_LENGTH) => {
  if (!text) return "";

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const createProfile = (user, data) => {
  return {
    name: data?.name || user?.name || DEFAULT_PROFILE.name,
    avatarUrl: data?.photo_url || DEFAULT_PROFILE.avatarUrl,
    intro: data?.bio || DEFAULT_PROFILE.intro,
    goal: data?.goal || DEFAULT_PROFILE.goal,
  };
};

const createRecord = (row) => {
  const title = row.position ? `${row.position} 모의 면접` : "모의 면접 결과";

  const memoSource =
    row.feedback_title ||
    row.intro?.trim() ||
    "작성된 피드백이 없습니다.";

  return {
    id: row.id,
    type: "모의 면접",
    date: formatDate(row.created_at),
    title,
    score: row.score,
    memo: truncateText(memoSource),
  };
};

const fetchProfile = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("name, bio, photo_url, goal")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return data;
};

const fetchInterviewResults = async (userId) => {
  const { data, error } = await supabase
    .from("interview_results")
    .select("id, position, score, intro, feedback_title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data || [];
};

const loadMyPageData = async () => {
  status.value = PROFILE_STATUS.LOADING;

  try {
    const user = await getCurrentUser();

    if (!user) {
      status.value = PROFILE_STATUS.EMPTY;
      return;
    }

    const [profileData, resultData] = await Promise.all([
      fetchProfile(user.id),
      fetchInterviewResults(user.id),
    ]);

    profile.value = createProfile(user, profileData);
    records.value = resultData.map(createRecord);

    status.value = PROFILE_STATUS.READY;
  } catch (error) {
    console.error("[MyPage] Failed to load my page data:", error);
    status.value = PROFILE_STATUS.ERROR;
  }
};

onMounted(loadMyPageData);
</script>

<style scoped src="./MyPage.css"></style>
