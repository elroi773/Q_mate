<template>
    <div class="login-container">
      <h2>회원가입</h2>
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
    name: "Join",
    data() {
      return {
        id: "",
        password: "",
        message: "",
      };
    },
    methods: {
      
    },
  };
  </script>
  
  