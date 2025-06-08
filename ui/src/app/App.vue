<script setup lang="ts">
// No logic needed in App.vue now
</script>

<template>
  <header>
    <h1>MTG Higher or Lower</h1>
  </header>
  <main>
    <RouterView />
  </main>
</template>

<style scoped lang="css">
header {
  line-height: 1.5;
  max-width: 100vw;
  background: #f8fafc;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

header h1 {
  margin: 0 0 0.5rem 1rem;
  font-size: 2rem;
  font-weight: 700;
  color: #2563eb;
}

nav > a {
  padding-left: 1rem;
  padding-right: 1rem;
  color: #2563eb;
  text-decoration: none;
}
nav > a.router-link-active {
  font-weight: bold;
  text-decoration: underline;
}
main {
  padding: 2rem 1rem;
}
</style>
