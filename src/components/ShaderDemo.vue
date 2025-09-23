<template>
  <div class="shader-demo">
    <!-- Custom Cursor -->
    <div ref="cursor" class="custom-cursor" :style="{ left: cursorX + 'px', top: cursorY + 'px' }"></div>

    <!-- P5.js Canvas Container (배경) -->
    <div ref="p5Container" class="p5-container"></div>

    <!-- Main Content (위에 올라감) -->
    <div class="container">
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
            <!-- <div class="speech left">그럼 면접 상황에 따라 내 면접 상태를</div>
            <div class="speech left">AI 로 체크할 수 있는 모의 면접 서비스를</div>
            <br>
            <br>
            <div class="speech left">사용해봐!</div>
            <div class="speech right">면접 준비 어떻게 해야할지 모르겠어 ㅠㅠ</div> -->

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
      </div>
    </div>
  </div>
</template>

<script>
// Import p5.js
import p5 from 'p5'

export default {
  name: 'ShaderDemo',
  data() {
    return {
      p5Instance: null,
      cursorX: 0,
      cursorY: 0,
      mouseX: 0,
      mouseY: 0,
      colors: ["#225ee1", "#28d7bf", "#ac53cf", "#e7a39c"],
      backgroundColor: "#31AFD4",
      shader: null
    }
  },
  mounted() {
    this.initCursor()
    this.initP5()
  },
  beforeUnmount() {
    if (this.p5Instance) {
      this.p5Instance.remove()
    }
    this.removeEventListeners()
  },
  methods: {
    initCursor() {
      document.addEventListener('mousemove', this.handleMouseMove)
      this.animateCursor()
    },

    handleMouseMove(e) {
      this.mouseX = e.clientX
      this.mouseY = e.clientY
    },

    animateCursor() {
      const speed = 0.2
      this.cursorX += (this.mouseX - this.cursorX) * speed
      this.cursorY += (this.mouseY - this.cursorY) * speed

      requestAnimationFrame(this.animateCursor)
    },

    onLinkHover() {
      const cursor = this.$refs.cursor
      cursor.style.transform = 'translate(-50%, -50%) scale(1.5)'
      cursor.style.background = 'rgba(172, 83, 207, 0.8)'
      cursor.style.borderColor = 'rgba(172, 83, 207, 0.5)'
    },

    onLinkLeave() {
      const cursor = this.$refs.cursor
      cursor.style.transform = 'translate(-50%, -50%) scale(1)'
      cursor.style.background = 'rgba(255, 255, 255, 0.8)'
      cursor.style.borderColor = 'rgba(255, 255, 255, 0.5)'
    },

    goToIntro() {
      // Navigate to intro page - adjust according to your routing
      this.$router?.push('/intro')
    },

    removeEventListeners() {
      document.removeEventListener('mousemove', this.handleMouseMove)
    },

    hex2rgb(hex) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return [r / 255, g / 255, b / 255]
    },

    initP5() {
      const sketch = (p) => {
        let s
        let canvasWidth
        let canvasHeight

        // Shader source code
        const vertShader = `
          attribute vec3 aPosition;
          uniform mat4 uModelViewMatrix;
          uniform mat4 uProjectionMatrix;

          void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
          }
        `

        const fragShader = `
          #ifdef GL_ES
          precision highp float;
          #endif

          uniform float uTime;
          uniform float uSpeedColor;
          uniform vec2 uResolution;

          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform vec3 uColor3;
          uniform vec3 uColor4;
          uniform vec3 uColor5;

          const int AMOUNT = 2;
          const float scale = 2.0;

          // Blend functions
          vec3 blendLinearBurn(vec3 base, vec3 blend) {
            return max(base + blend - vec3(1.0), vec3(0.0));
          }

          vec3 blendOverlay(vec3 base, vec3 blend) {
            return vec3(
              base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
              base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
              base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
            );
          }

          float rand(vec2 co) {
            return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
          }

          float createLen() {
            float time = 10.0 + uTime / 1.0;
            vec2 coord = scale * (gl_FragCoord.xy - uResolution.xy) / min(uResolution.y, uResolution.x);
            float len;
            for(int i = 0; i < AMOUNT; i++) {
              len = length(vec2(coord.x, coord.y));
              coord.x = coord.x + cos(coord.y - sin(len)) - cos(time / 9.1);
              coord.y = coord.y + sin(coord.y + cos(len)) + sin(time / 12.0);
            }
            return len;
          }

          float createLen2(float x, float y, float speed, float offset) {
            float time = offset + uTime / speed;
            vec2 coord = scale * (gl_FragCoord.xy - uResolution.xy) / min(uResolution.y, uResolution.x);
            float len;
            for(int i = 0; i < AMOUNT; i++) {
              len = length(vec2(coord.x, coord.y));
              coord.x = coord.x + sin(coord.y + cos(len) * cos(len)) + sin(time / x);
              coord.y = coord.y - cos(coord.y + sin(len) * sin(len)) + cos(time / y);
            }
            return len;
          }

          float createLen3(float x, float y, float speed, float offset) {
            float time = offset + uTime / speed;
            vec2 coord = scale * (gl_FragCoord.xy - uResolution.xy) / min(uResolution.y, uResolution.x);
            float len;
            for(int i = 0; i < AMOUNT; i++) {
              len = length(vec2(coord.x, coord.y));
              coord.y = coord.y + sin(coord.y + cos(len)) + sin(time / y);
            }
            return len;
          }

          float createLen4(float x, float y, float speed, float offset) {
            float time = offset + uTime / speed;
            vec2 coord = scale * (gl_FragCoord.xy - uResolution.xy) / min(uResolution.y, uResolution.x);
            float len;
            for(int i = 0; i < AMOUNT; i++) {
              len = length(vec2(coord.x, coord.y));
              coord.x = coord.x - cos(coord.y + sin(len)) + cos(time / x);
            }
            return len;
          }

          // rgb2hsv & hsv2rgb from https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
          vec3 rgb2hsv(vec3 c) {
            vec4 K = vec4(0., -1./3., 2./3., -1.);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
            float d = q.x - min(q.w, q.y);
            float e = 1e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.*d + e)), d / (q.x + e), q.x);
          }

          vec3 hsv2rgb(vec3 c) {
            vec4 K = vec4(1., 2./3., 1./3., 3.);
            vec3 p = abs(fract(c.xxx + K.xyz) * 6. - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0., 1.), c.y);
          }

          void main() {
            float len = createLen();
            float len2 = createLen2(10.0, 10.0, 8.0, 20.0);
            float len3 = createLen3(2.0, 2.0, 10.0, 30.0);
            float len4 = createLen4(5.0, 20.0, 5.0, 40.0);

            vec3 blue = uColor1 + cos(len) * 0.25 + 0.25;
            vec3 turquoise = uColor2 + cos(len2) * 0.5 + 0.75;
            vec3 pink = uColor3 + cos(len3) * 0.5 + 0.75;
            vec3 peach = uColor4 + cos(len4) * 0.75 + 0.95;

            float pinkValue = min(1.0, max(0.0, 1.2 - (pink[0] / 1.2)));
            float peachValue = min(1.0, max(0.0, 1.5 - (peach[0] / 1.2)));
            float turquoiseValue = min(1.0, max(0.0, 1.5 - (turquoise[2] / 1.1)));

            vec3 blend = blue;
            blend = mix(blend, turquoise, turquoiseValue);
            blend = mix(blend, peach, peachValue);
            blend = mix(blend, pink, pinkValue);

            vec3 lightercolor = blendLinearBurn(blend, peach);
            blend = mix(blend, lightercolor, max(1.0 - lightercolor[0], 0.0));

            blend = blendOverlay(blend, vec3(0.0, 0.0, 0.0));
            blend = blendLinearBurn(blend, vec3(1.0, 0.7, 0.1));

            vec3 color = blend;

            float r = color[0];
            float g = color[1];
            float b = color[2];

            vec3 hsb = rgb2hsv(vec3(r, g, b));
            hsb[1] -= rand(scale * (gl_FragCoord.xy - uResolution.xy) / min(uResolution.y, uResolution.x)) * 0.4;
            vec3 rgb = hsv2rgb(hsb);

            gl_FragColor = vec4(rgb, 1.0);
          }
        `

        p.setup = () => {
          canvasWidth = window.innerWidth
          canvasHeight = window.innerHeight
          p.createCanvas(canvasWidth, canvasHeight, p.WEBGL)
          p.noiseSeed(20)
          p.rectMode(p.CENTER)
          p.noStroke()

          s = p.createShader(vertShader, fragShader)
        }

        p.draw = () => {
          p.background(this.backgroundColor)
          p.shader(s)

          s.setUniform('uResolution', [canvasWidth, canvasHeight])
          s.setUniform('uTime', p.millis() / 100)
          s.setUniform('uSpeedColor', 20.0)

          s.setUniform('uColor1', this.hex2rgb(this.colors[0]))
          s.setUniform('uColor2', this.hex2rgb(this.colors[1]))
          s.setUniform('uColor3', this.hex2rgb(this.colors[2]))
          s.setUniform('uColor4', this.hex2rgb(this.colors[3]))
          s.setUniform('uColor5', [0, 0, 0])

          p.rect(0, 0, canvasWidth, canvasHeight)
        }

        p.windowResized = () => {
          canvasWidth = window.innerWidth
          canvasHeight = window.innerHeight
          p.resizeCanvas(canvasWidth, canvasHeight)
        }
      }

      this.p5Instance = new p5(sketch, this.$refs.p5Container)
    }
  }
}
</script>

<style scoped>
@font-face {
  font-family: "Freesentation-9Black";
  src: url("https://fastly.jsdelivr.net/gh/projectnoonnu/2404@1.0/Freesentation-9Black.woff2") format("woff2");
  font-weight: 900;
  font-style: normal;
}

@font-face {
  font-family: 'Pretendard-Regular';
  src: url('https://fastly.jsdelivr.net/gh/Project-Noonnu/noonfonts_2107@1.1/Pretendard-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'GmarketSansMedium';
  src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/GmarketSansMedium.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

.shader-demo {
  font-family: 'Pretendard-Regular';
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  background: #1b2021;
  cursor: none;
  height: 100vh;
  position: relative;
}

.custom-cursor {
  position: fixed;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: all 0.1s ease;
  backdrop-filter: blur(5px);
}

.custom-cursor::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  background: #37ff30e6;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

/* P5 캔버스는 배경 레이어 (z-index: 1) */
.p5-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 콘텐츠 컨테이너는 위 레이어 (z-index: 2) */
.container {
  position: relative;
  z-index: 2;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

/* 앱 전체가 P5 위에 올라감 */
.app {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
}

h1 {
  color: white;
  font-size: 5rem;
  font-family: 'GmarketSansMedium';
}

h4 {
  color: white;
  margin-bottom: 40px;
  font-weight: 100;
}

.button {
  border: none;
  background: transparent;
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.4rem 2.2rem;
  overflow: hidden;
  border-radius: 100vmax;
  box-shadow: var(--shadow-elevation-high);
  transition: box-shadow 0.2s ease-in-out;
}

.button:not(:last-child) {
  margin-bottom: 2rem;
}

:root {
  --shadow-color: 208deg 22% 58%;
  --shadow-elevation-low:
    0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.34),
    0.4px 0.8px 1px -1.2px hsl(var(--shadow-color) / 0.34),
    1px 2px 2.5px -2.5px hsl(var(--shadow-color) / 0.34);
  --shadow-elevation-medium:
    0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.36),
    0.8px 1.6px 2px -0.8px hsl(var(--shadow-color) / 0.36),
    2.1px 4.1px 5.2px -1.7px hsl(var(--shadow-color) / 0.36),
    5px 10px 12.6px -2.5px hsl(var(--shadow-color) / 0.36);
  --shadow-elevation-high:
    0.3px 0.5px 0.7px hsl(var(--shadow-color) / 0.34),
    1.5px 2.9px 3.7px -0.4px hsl(var(--shadow-color) / 0.34),
    2.7px 5.4px 6.8px -0.7px hsl(var(--shadow-color) / 0.34),
    4.5px 8.9px 11.2px -1.1px hsl(var(--shadow-color) / 0.34),
    7.1px 14.3px 18px -1.4px hsl(var(--shadow-color) / 0.34),
    11.2px 22.3px 28.1px -1.8px hsl(var(--shadow-color) / 0.34),
    17px 33.9px 42.7px -2.1px hsl(var(--shadow-color) / 0.34),
    25px 50px 62.9px -2.5px hsl(var(--shadow-color) / 0.34);
}

@keyframes scroll {
  to {
    transform: translateX(-50%);
  }
}

/* 브라우저 모양 - 리퀴드 글래스 효과 */
.browser {
  width: 1000px;
  /* max-width:  */
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.05)
  );
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.browser:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.browser::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: liquidMove 3s ease-in-out infinite;
  pointer-events: none;
}

.browser::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 0.1) 0%,
    transparent 70%
  );
  animation: liquidPulse 4s ease-in-out infinite;
  pointer-events: none;
}

/* @keyframes liquidMove {
  0%, 100% { transform: translateX(-100%) rotate(0deg); }
  50% { transform: translateX(100%) rotate(180deg); }
}

@keyframes liquidPulse {
  0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.3; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.1; }
} */

.header {
  display: flex;
  align-items: center;
  padding: 12px;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
}

.dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.dot:hover {
  transform: scale(1.2);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

.red { 
  background: linear-gradient(135deg, #ff6b5a, #ff3d2e);
}
.yellow { 
  background: linear-gradient(135deg, #ffce3d, #ffb000);
}
.green { 
  background: linear-gradient(135deg, #32d74b, #28a745);
}

/* 콘텐츠 */
.content {
  text-align: center;
  padding: 40px 20px;
  position: relative;
  background: linear-gradient(180deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  backdrop-filter: blur(10px);
}

.content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
}

h1 {
  font-size: clamp(20px, 5vw, 36px); /* 반응형 글씨 */
  font-weight: bold;
  color: #75b8ff;
}

.highlight {
  color: #ff5733;
}

.subtitle {
  margin-top: 10px;
  color: #4a90e2;
  font-size: clamp(14px, 3vw, 20px);
}

/* 말풍선 - 리퀴드 글래스 효과 */
.speech {
  position: absolute;
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  backdrop-filter: blur(15px);
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 12px 18px;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  font-size: 14px;
  max-width: 60%;
  word-wrap: break-word;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  transition: all 0.3s ease;
}

.speech:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 35px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.speech::before {
  content: '';
  position: absolute;
  bottom: -8px;
  width: 16px;
  height: 16px;
  background: inherit;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.left::before { left: 20px; }
.right::before { right: 20px; }

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
  padding: 15px;
  border-radius: 30px;
  border: none;
  font-size: 16px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.play {
  background: linear-gradient(135deg, 
    rgba(0, 123, 255, 0.8),
    rgba(0, 86, 179, 0.9)
  );
  color: white;
  box-shadow: 
    0 8px 25px rgba(0, 123, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.play:hover {
  background: linear-gradient(135deg, 
    rgba(0, 123, 255, 0.9),
    rgba(0, 86, 179, 1)
  );
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 15px 35px rgba(0, 123, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.login {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.15),
    rgba(255, 255, 255, 0.05)
  );
  color: rgba(255, 255, 255, 0.9);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.login:hover {
  background: linear-gradient(135deg,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0.1)
  );
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

button::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, 
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  animation: buttonShimmer 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes buttonShimmer {
  0% { transform: translateX(-100%) rotate(0deg); }
  100% { transform: translateX(100%) rotate(360deg); }
}
</style>