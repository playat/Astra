<template>
  <div
    ref="containerRef"
    class="login-container"
  >
    <!-- Animated grid background -->
    <div class="grid-bg" />

    <!-- Floating particles -->
    <div class="particles">
      <div
        v-for="i in 20"
        :key="i"
        class="particle"
        :style="{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
        }"
      />
    </div>

    <!-- Glow orbs -->
    <div class="glow-orb glow-orb-1" />
    <div class="glow-orb glow-orb-2" />

    <!-- Login card -->
    <div
      ref="cardRef"
      class="login-card"
    >
      <!-- Top accent line -->
      <div class="accent-line" />

      <!-- Logo / Brand -->
      <div class="brand-section">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <h1 class="brand-title">ASTRA</h1>
        <p class="brand-subtitle">SYSTEM ACCESS</p>
      </div>

      <!-- Divider -->
      <div class="divider">
        <div class="divider-line" />
        <div class="divider-dot" />
        <div class="divider-line" />
      </div>

      <!-- Form -->
      <form @submit.prevent="loginFn" class="form-section">
        <div class="input-wrapper">
          <input
            ref="inputRef"
            v-model="pwd"
            :type="showPwd ? 'text' : 'password'"
            class="login-input"
            placeholder="ENTER PASSWORD"
            autocomplete="off"
            autocorrect="off"
            spellcheck="false"
            :disabled="loading"
          />
          <div class="input-glow" />
          <div class="input-border" />
          <button
            type="button"
            class="toggle-pwd"
            @click="showPwd = !showPwd"
            tabindex="-1"
          >
            <svg v-if="!showPwd" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :class="{ 'is-loading': loading }"
          :disabled="loading || !pwd.trim()"
        >
          <span v-if="!loading" class="btn-text">AUTHENTICATE</span>
          <span v-else class="btn-loading">
            <span class="spinner" />
            <span>VERIFYING</span>
          </span>
        </button>
      </form>

      <!-- Bottom info -->
      <div class="footer-info">
        <span class="status-dot" :class="{ 'is-active': !loading }" />
        <span>{{ loading ? 'CONNECTING...' : 'READY' }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getPublicKey, login } from "@/api/auth";
import CoverMessage from "@/components_ui/CoverMessage";
import useApp from "@/store/app";
import useAuthStore from "@/store/auth";
import { encryptData } from "@/utils/CryptoJS";
import gsap from "gsap";
import { onMounted, onUnmounted, ref } from "vue";

const authStore = useAuthStore();
const appStore = useApp();

const containerRef = ref<HTMLDivElement>();
const cardRef = ref<HTMLDivElement>();
const inputRef = ref<HTMLInputElement>();
const pwd = ref("");
const showPwd = ref(false);
const loading = ref(false);

let publicKey = "";
let animTimeline: gsap.core.Timeline | null = null;

const loadPublicKey = () => {
  getPublicKey().then((res) => {
    publicKey = res.data;
  });
};

const loginFn = async () => {
  if (loading.value || !pwd.value.trim()) return;

  loading.value = true;

  try {
    const encryptRes = await encryptData({ pwd: pwd.value }, publicKey);
    const res = await login(encryptRes);

    if (res.data.token) {
      // Success animation
      gsap.to(cardRef.value, {
        scale: 0.95,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          authStore.setToken(res.data.token);
          appStore.loadAppList();
        },
      });
    } else {
      // Shake animation on failure
      gsap.to(cardRef.value, {
        x: [-10, 10, -8, 8, -4, 4, 0],
        duration: 0.5,
        ease: "power2.out",
      });
      new CoverMessage({ message: "登录失败" }).open();
      loading.value = false;
    }
  } catch {
    gsap.to(cardRef.value, {
      x: [-10, 10, -8, 8, -4, 4, 0],
      duration: 0.5,
      ease: "power2.out",
    });
    new CoverMessage({ message: "登录失败" }).open();
    loading.value = false;
  }
};

const playEntrance = () => {
  animTimeline = gsap.timeline();

  animTimeline
    .fromTo(
      cardRef.value,
      {
        opacity: 0,
        y: 40,
        scale: 0.9,
        filter: "blur(10px)",
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1,
        ease: "power3.out",
      }
    )
    .fromTo(
      ".brand-icon",
      { opacity: 0, scale: 0.5, rotateY: 180 },
      { opacity: 1, scale: 1, rotateY: 0, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.6"
    )
    .fromTo(
      ".brand-title",
      { opacity: 0, letterSpacing: "0.5em" },
      { opacity: 1, letterSpacing: "0.3em", duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(
      ".brand-subtitle",
      { opacity: 0 },
      { opacity: 0.5, duration: 0.4 },
      "-=0.2"
    )
    .fromTo(
      ".divider",
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    )
    .fromTo(
      ".input-wrapper",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
      "-=0.2"
    )
    .fromTo(
      ".submit-btn",
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      "-=0.2"
    );

  // Focus input after animation
  setTimeout(() => {
    inputRef.value?.focus();
  }, 800);
};

onMounted(() => {
  loadPublicKey();
  playEntrance();
});

onUnmounted(() => {
  animTimeline?.kill();
});
</script>

<style scoped>
.login-container {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #070b14;
  overflow: hidden;
}

/* Grid background */
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridScroll 40s linear infinite;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 70%);
}

@keyframes gridScroll {
  0% { transform: translate(0, 0); }
  100% { transform: translate(-60px, -60px); }
}

/* Particles */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(142, 111, 247, 0.6);
  border-radius: 50%;
  animation: particleFloat 5s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(142, 111, 247, 0.4);
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  25% {
    opacity: 1;
  }
  50% {
    transform: translateY(-30px) translateX(15px);
    opacity: 0.8;
  }
  75% {
    opacity: 0.4;
  }
}

/* Glow orbs */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.glow-orb-1 {
  width: 400px;
  height: 400px;
  background: rgba(59, 130, 246, 0.15);
  top: -100px;
  right: -100px;
  animation: orbFloat1 8s ease-in-out infinite;
}

.glow-orb-2 {
  width: 300px;
  height: 300px;
  background: rgba(142, 111, 247, 0.12);
  bottom: -80px;
  left: -80px;
  animation: orbFloat2 10s ease-in-out infinite;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-30px, 20px) scale(1.1); }
}

@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -30px) scale(1.15); }
}

/* Login card */
.login-card {
  position: relative;
  width: 380px;
  max-width: calc(100vw - 48px);
  padding: 40px 36px 32px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03),
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Accent line */
.accent-line {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #8e6ff7, #3b82f6, transparent);
  border-radius: 2px;
}

/* Brand section */
.brand-section {
  text-align: center;
  margin-bottom: 24px;
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(142, 111, 247, 0.2));
  border: 1px solid rgba(142, 111, 247, 0.3);
  border-radius: 16px;
  color: #8e6ff7;
  box-shadow:
    0 0 20px rgba(142, 111, 247, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.brand-icon svg {
  width: 28px;
  height: 28px;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: 0.3em;
  color: #e2e8f0;
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}

.brand-subtitle {
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  color: rgba(148, 163, 184, 0.5);
  margin: 8px 0 0;
  text-transform: uppercase;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
}

.divider-dot {
  width: 4px;
  height: 4px;
  background: #8e6ff7;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(142, 111, 247, 0.5);
}

/* Form */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Input */
.input-wrapper {
  position: relative;
}

.login-input {
  width: 100%;
  height: 52px;
  padding: 0 48px 0 20px;
  background: rgba(30, 41, 59, 0.5);
  border: none;
  border-radius: 12px;
  color: #e2e8f0;
  font-size: 0.9rem;
  letter-spacing: 0.15em;
  outline: none;
  transition: all 0.3s ease;
}

.login-input::placeholder {
  color: rgba(148, 163, 184, 0.3);
  letter-spacing: 0.2em;
  font-size: 0.75rem;
}

.login-input:focus {
  background: rgba(30, 41, 59, 0.7);
}

.login-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Input glow */
.input-glow {
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(142, 111, 247, 0.3));
  opacity: 0;
  z-index: -1;
  transition: opacity 0.3s ease;
  filter: blur(4px);
}

.login-input:focus ~ .input-glow {
  opacity: 1;
}

/* Input border */
.input-border {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: none;
  transition: border-color 0.3s ease;
}

.login-input:focus ~ .input-border {
  border-color: rgba(142, 111, 247, 0.4);
}

/* Toggle password */
.toggle-pwd {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(148, 163, 184, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-pwd:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.05);
}

.toggle-pwd svg {
  width: 18px;
  height: 18px;
}

/* Submit button */
.submit-btn {
  position: relative;
  height: 52px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(142, 111, 247, 0.2));
  border: 1px solid rgba(142, 111, 247, 0.3);
  border-radius: 12px;
  color: #e2e8f0;
  font-size: 0.8rem;
  letter-spacing: 0.25em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(142, 111, 247, 0.3));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-btn:hover:not(:disabled)::before {
  opacity: 1;
}

.submit-btn:hover:not(:disabled) {
  border-color: rgba(142, 111, 247, 0.5);
  box-shadow: 0 0 20px rgba(142, 111, 247, 0.2);
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.99);
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-text,
.btn-loading {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(226, 232, 240, 0.2);
  border-top-color: #e2e8f0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Footer info */
.footer-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: rgba(148, 163, 184, 0.3);
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(148, 163, 184, 0.3);
  transition: all 0.3s ease;
}

.status-dot.is-active {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}
</style>
