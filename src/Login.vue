<template>
  <div class="login-container">
    <h2 class="title">로그인</h2>

    <form class="form" @submit.prevent="login">
      <label class="label" for="id">아이디</label>
      <input
        id="id"
        v-model.trim="id"
        type="text"
        class="input"
        placeholder="아이디를 입력하세요"
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

      <button type="submit" class="btn-primary">로그인</button>
    </form>

    <!-- 하단: 회원가입(작게) -->
    <div class="login-cta">
      <!-- 라우터 쓰면 <router-link to="/join" class="btn-link">회원가입</router-link> -->
      <a href="/join" class="btn-link">회원가입</a>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      id: "",
      password: "",
      message: "",
    };
  },
  methods: {
    login() {
      if (this.id === "admin" && this.password === "1234") {
        this.message = "로그인 성공!";
        alert(`환영합니다, ${this.id}님!`);
        // this.$router.push("/home");
      } else {
        this.message = "아이디 또는 비밀번호가 잘못되었습니다.";
      }
    },
  },
};
</script>

<!-- 분리된 CSS 파일 -->
<style src="./Login.css"></style>
