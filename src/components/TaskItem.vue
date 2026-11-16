<script setup lang="ts">
  import type { Task } from '@/types/task'

  defineProps<{ task: Task }>()

  const emit = defineEmits<{
    (e: 'toggle', task: Task): void
    (e: 'remove', task: Task): void
    (e: 'edit', task: Task): void
  }>()
</script>

<template>
  <li class="task-item" :class="{ 'is-completed': task.completed }">
    <label class="task-item__check">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="emit('toggle', task)"
      />
    </label>
    <div class="task-item__body">
      <h3 class="task-item__title">{{ task.title }}</h3>
      <p v-if="task.description" class="task-item__desc">{{ task.description }}</p>
    </div>
    <div class="task-item__actions">
      <button type="button" class="btn btn--ghost" @click="emit('edit', task)">Editar</button>
      <button type="button" class="btn btn--danger" @click="emit('remove', task)">Remover</button>
    </div>
  </li>
</template>

<style scoped>
  .task-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
  }

  .task-item.is-completed .task-item__title,
  .task-item.is-completed .task-item__desc {
    text-decoration: line-through;
    opacity: 0.6;
  }

  .task-item__check {
    display: flex;
    align-items: center;
    padding-top: 0.25rem;
  }

  .task-item__body {
    flex: 1;
    min-width: 0;
  }

  .task-item__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  .task-item__desc {
    margin: 0.25rem 0 0;
    font-size: 0.9rem;
    color: var(--muted);
    white-space: pre-wrap;
    word-break: break-word;
  }

  .task-item__actions {
    display: flex;
    gap: 0.5rem;
  }
</style>
