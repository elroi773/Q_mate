<template>
  <div class="join-container">
    <h2 class="title">회원가입</h2>

    <form class="form" @submit.prevent="onSubmit">
      <!-- 이름 -->
      <label class="label" for="name">이름</label>
      <input
        id="name"
        v-model.trim="name"
        type="text"
        class="input"
        placeholder="이름을 입력하세요"
        autocomplete="name"
        required
      />

      <!-- 비밀번호 -->
      <label class="label" for="password">비밀번호</label>
      <input
        id="password"
        v-model="password"
        type="password"
        class="input"
        placeholder="8자 이상 권장"
        autocomplete="new-password"
        required
      />

      <!-- 한줄 자기소개 -->
      <label class="label" for="bio">한줄 자기소개</label>
      <input
        id="bio"
        v-model.trim="bio"
        type="text"
        class="input"
        placeholder="예: 호기심 많은 프론트엔드 개발자입니다"
        maxlength="80"
      />

      <!-- 증명사진(선택) -->
      <div class="photo-row">
        <div class="photo-left">
          <span class="label">증명사진 (선택)</span>
          <p class="sub">JPG/PNG, 5MB 이하</p>
        </div>

        <div class="photo-right">
          <div class="photo-preview" v-if="photoUrl">
            <img :src="photoUrl" alt="증명사진 미리보기" />
            <button type="button" class="btn-light" @click="removePhoto">삭제</button>
          </div>

          <div class="photo-actions">
            <input
              id="photo"
              ref="fileInput"
              class="hidden-file"
              type="file"
              accept="image/png, image/jpeg"
              @change="onFileChange"
            />
            <button type="button" class="btn-outline" @click="triggerFile">
              사진 선택
            </button>
            <span class="file-name" v-if="photoFile">{{ photoFile.name }}</span>
          </div>
        </div>
      </div>

      <!-- 가입 버튼 -->
      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? '처리 중...' : '가입하기' }}
      </button>
    </form>

    <!-- 하단: 로그인하기(작게) -->
    <div class="login-cta">
      <a href="/login" class="btn-link">로그인하기</a>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import { supabase } from "../supabaseClient";
import bcrypt from "bcryptjs";

export default {
  name: "Join",
  data() {
    return {
      name: "",
      password: "",
      bio: "",
      photoFile: null,
      photoUrl: "",
      message: "",
      submitting: false,
    };
  },
  methods: {
    triggerFile() {
      if (this.$refs.fileInput) this.$refs.fileInput.click();
    },
    onFileChange(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const isImage = /^image\/(png|jpeg)$/.test(file.type);
      const under5MB = file.size <= 5 * 1024 * 1024;

      if (!isImage) {
        this.message = "PNG 또는 JPG 이미지만 업로드 가능합니다.";
        return;
      }
      if (!under5MB) {
        this.message = "파일 크기는 5MB 이하여야 합니다.";
        return;
      }

      this.photoFile = file;
      if (this.photoUrl) URL.revokeObjectURL(this.photoUrl);
      this.photoUrl = URL.createObjectURL(file);
      this.message = "";
    },
    removePhoto() {
      if (this.photoUrl) URL.revokeObjectURL(this.photoUrl);
      this.photoFile = null;
      this.photoUrl = "";
      if (this.$refs.fileInput) this.$refs.fileInput.value = "";
    },

    async onSubmit() {
      if (this.name.length < 2) {
        this.message = "이름은 2자 이상 입력해주세요.";
        return;
      }
      if (this.password.length < 8) {
        this.message = "비밀번호는 8자 이상 입력해주세요.";
        return;
      }

      this.submitting = true;
      this.message = "";

      try {
        // 1) (선택) 아바타 업로드
        let uploadedUrl = null;
        if (this.photoFile) {
          const key = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

          const { error: upErr } = await supabase.storage
            .from("avatars")
            .upload(key, this.photoFile, {
              cacheControl: "3600",
              upsert: true,
              contentType: this.photoFile.type || "image/jpeg",
            });

          if (upErr) {
            console.error("Upload error:", upErr);
            // 업로드 실패 시 가입 자체를 중단하려면 다음 줄의 주석을 해제하세요.
            // throw upErr;
          } else {
            const { data: pub } = supabase.storage.from("avatars").getPublicUrl(key);
            uploadedUrl = pub?.publicUrl ?? null;
          }
        }

        // 2) 비밀번호 해시
        const passwordHash = await bcrypt.hash(this.password, 10);

        // 3) DB insert
        const { error: insErr } = await supabase.from("users").insert({
          name: this.name.trim(),
          bio: this.bio.trim() || null,
          photo_url: uploadedUrl,
          password_hash: passwordHash,
        });

        if (insErr) {
          console.error("Insert error:", insErr);
          throw insErr;
        }

        this.message = "가입 완료! 환영합니다 🙌";
        this.password = "";
        // 필요 시 폼 초기화
        // this.name = ""; this.bio = ""; this.removePhoto();
      } catch (e) {
        this.message = e?.message || "가입 중 오류가 발생했습니다.";
      } finally {
        this.submitting = false;
      }
    },
  },
  beforeUnmount() {
    if (this.photoUrl) URL.revokeObjectURL(this.photoUrl);
  },
};
</script>

<!-- 분리된 CSS 파일을 불러오기 -->
<style src="./Join.css" scoped></style>
