<template>
  <div class="fixed top-8 right-8 bg-gray-700 rounded-full p-2">
    <YGImage :src="UserSvg" fit="cover" />
  </div>
</template>

<script setup lang="ts">
import YGImage from "@/components_ui/YGImage.vue";
import UserSvg from "@/assets/svg/user.svg";
</script>
