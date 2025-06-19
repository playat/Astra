<template>
  <div class="bg-white-0.5 rounded-full py-2 px-4 w-1/8 hover:w-1/5 transition-all absolute z-10 left-1/2 top-1/8 -translate-x-1/2 backdrop-blur-md border border-gray-400">
    <input class="w-full" @input="searchInput"/>
  </div>
</template>

<script setup lang="ts">
const searchInput = (e) => {
  console.log(e.target.value);
}
</script>
