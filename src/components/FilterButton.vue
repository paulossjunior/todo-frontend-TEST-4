<script setup lang="ts">
  const active = defineModel<boolean>({ required: true })

  defineProps<{
    label: string
  }>()

  function toggle() {
    active.value = !active.value
  }
</script>

<template>
  <button
    type="button"
    class="filter-button"
    :class="{ 'filter-button--active': active }"
    :aria-pressed="active"
    @click="toggle"
  >
    {{ label }}
  </button>
</template>

<style scoped>
  .filter-button {
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.4rem 0.75rem;
    font: inherit;
    cursor: pointer;
    background: transparent;
    color: inherit;
  }

  .filter-button:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  .filter-button:hover {
    background: var(--border);
  }

  .filter-button--active {
    background: var(--primary);
    color: #ffffff;
    border-color: var(--primary);
  }

  .filter-button--active:hover {
    background: var(--primary-hover);
    border-color: var(--primary-hover);
  }
</style>
