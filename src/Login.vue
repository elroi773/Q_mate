<template>
  <!-- 전체 화면을 채우는 래퍼 추가 -->
  <div class="login-page">
    <div class="login-container">
      <h2 class="title">로그인</h2>

      <form class="form" @submit.prevent="login">
        <label class="label" for="id">아이디 (이름)</label>
        <input
          id="id"
          v-model.trim="id"
          type="text"
          class="input"
          placeholder="가입 시 입력한 이름"
          autocomplete="username"
          required
        />

        <label class="label" for="password">비밀번호</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="input"
          placeholder="비밀번호를 입력하세요"
          autocomplete="current-password"
          required
        />

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? "확인 중..." : "로그인" }}
        </button>
      </form>

      <div class="login-cta">
        <a href="/join" class="btn-link">회원가입</a>
      </div>

      <p v-if="message" class="message">{{ message }}</p>
    </div>
  </div>
</template>

<script>
import { supabase } from "../supabaseClient";
import bcrypt from "bcryptjs";

export default {
  name: "Login",
  data() {
    return {
      id: "", // Join.vue의 name 필드와 동일
      password: "",
      message: "",
      loading: false,
    };
  },
  methods: {
    async login() {
      this.message = "";
      if (!this.id || !this.password) {
        this.message = "이름과 비밀번호를 모두 입력해주세요.";
        return;
      }

      this.loading = true;

      try {
        // 1️⃣ users 테이블에서 name 일치하는 사용자 조회
        const { data: users, error: fetchErr } = await supabase
          .from("users")
          .select("id, name, password_hash")
          .eq("name", this.id)
          .limit(1)
          .single();

        if (fetchErr || !users) {
          this.message = "존재하지 않는 사용자입니다.";
          this.loading = false;
          return;
        }

        // 2️⃣ bcrypt로 비밀번호 확인
        const match = await bcrypt.compare(this.password, users.password_hash);
        if (!match) {
          this.message = "비밀번호가 일치하지 않습니다.";
          this.loading = false;
          return;
        }

        // 3️⃣ 로그인 성공
        this.message = `${this.id}님, 환영합니다! 🎉`;

        // ✅ 로그인 세션 로컬스토리지 저장
        localStorage.setItem("loginUser", JSON.stringify({
          id: users.id,
          name: users.name,
        }));

        // ✅ 페이지 이동 (예시)
        this.$router.push("/myPage");
      } catch (e) {
        console.error("Login error:", e);
        this.message = "로그인 중 오류가 발생했습니다.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style src="./Login.css" scoped></style>
