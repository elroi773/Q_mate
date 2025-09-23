<template>
  <div class="app">
    <!-- 브라우저 창 모양 -->
    <div class="browser">
      <div class="header">
        <div class="dots">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
      </div>

      <!-- 메인 콘텐츠 -->
      <div class="content">
        <div class="speech left">그럼 면접 상황에 따라 내 면접 상태를</div>
        <div class="speech left">AI 로 체크할 수 있는 모의 면접 서비스를</div>
        <br>
        <br>
        <div class="speech left">사용해봐!</div>
        <div class="speech right">면접 준비 어떻게 해야할지 모르겠어 ㅠㅠ</div>

        <h1>
          INTERVIEW WITH ME<br />
          <span class="highlight">AND AI</span>
        </h1>
        <p class="subtitle">모의 면접 연습 플랫폼</p>

        <div class="buttons">
          <button class="play">Play</button>
          <button class="login">Login</button>
        </div>
      </div>
    </div>

    <!-- Dock 하단
    <div class="dock">
      <img src="/icons/finder.png" alt="Finder" />
      <img src="/icons/safari.png" alt="Safari" />
      <img src="/icons/mail.png" alt="Mail" />
      <img src="/icons/messages.png" alt="Messages" />
      <img src="/icons/calendar.png" alt="Calendar" />
      <img src="/icons/vscode.png" alt="VS Code" />
      <img src="/icons/trash.png" alt="Trash" />
    </div> -->
  </div>
</template>

<script>
export default {
  name: "InterviewLanding",
};
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f3f3f3;
  padding: 20px;
  box-sizing: border-box;
}

/* 브라우저 모양 */
.browser {
  width: 100%;
  max-width: 800px;   /* 데스크탑에서 최대 크기 */
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  padding: 8px;
  background: #ececec;
}

.dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}
.red { background: #ff5f57; }
.yellow { background: #ffbd2e; }
.green { background: #28c840; }

/* 콘텐츠 */
.content {
  text-align: center;
  padding: 40px 20px;
  position: relative;
}

h1 {
  font-size: clamp(20px, 5vw, 36px); /* 반응형 글씨 */
  font-weight: bold;
  color: #0071eb;
}

.highlight {
  color: #ff5733;
}

.subtitle {
  margin-top: 10px;
  color: #4a90e2;
  font-size: clamp(14px, 3vw, 20px);
}

/* 말풍선 */
.speech {
  position: absolute;
  background: white;
  border-radius: 20px;
  padding: 10px 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  max-width: 60%;
  word-wrap: break-word;
}

.left { left: 10px; }
.right { right: 10px; top: 60px; }

/* 버튼 */
.buttons {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

button {
  width: 80%;
  max-width: 250px;
  padding: 12px;
  border-radius: 25px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  font-weight: bold;
}

.play {
  background: #007bff;
  color: white;
}
.login {
  background: #d3d3d3;
  color: #333;
}

/* 반응형 */
@media (max-width: 600px) {
  .speech {
    font-size: 12px;
    padding: 8px 12px;
  }
  .buttons {
    gap: 10px;
  }
}
</style>
