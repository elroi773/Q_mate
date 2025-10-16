<template>
  <div class="login-container">
    <h2>로그인</h2>
    <input
      v-model="id"
      type="text"
      placeholder="아이디"
    />
    <input
      v-model="password"
      type="password"
      placeholder="비밀번호"
    />
    <button @click="login">로그인</button>
    <p v-if="message">{{ message }}</p>
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
        // 예: 메인 페이지로 이동
        // this.$router.push("/home");
      } else {
        this.message = "아이디 또는 비밀번호가 잘못되었습니다.";
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  font-family: "GmarketSansMedium", sans-serif;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  padding: 40px;
  width: 320px;
  margin: 100px auto;
  text-align: center;
}

h2 {
  color: #4cae4f;
  margin-bottom: 20px;
}

input {
  width: 90%;
  padding: 10px;
  margin: 8px 0;
  border: none;
  border-radius: 10px;
  outline: none;
  background: #f5f5f5;
}

button {
  width: 95%;
  padding: 10px;
  margin-top: 15px;
  background-color: #4cae4f;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

button:hover {
  background-color: #3a8c3f;
}

p {
  color: #ffdddd;
  font-size: 0.9em;
  margin-top: 10px;
}
</style>
