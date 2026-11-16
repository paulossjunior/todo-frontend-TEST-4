<script setup lang="ts">
  import type { Task } from '@/types/task'
  import TaskItem from './TaskItem.vue'

  defineProps<{
    tasks: Task[]
    emptyLabel?: string
  }>()

  const emit = defineEmits<{
    (e: 'toggle', task: Task): void
    (e: 'remove', task: Task): void
    (e: 'edit', task: Task): void
  }>()
</script>

<template>
  <section class="task-list">
    <p v-if="tasks.length === 0" class="task-list__empty">
      {{ emptyLabel ?? 'Nenhuma tarefa.' }}
    </p>
    <ul v-else class="task-list__items">
      <TaskItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @toggle="emit('toggle', $event)"
        @remove="emit('remove', $event)"
        @edit="emit('edit', $event)"
      />
    </ul>
  </section>
</template>

<style scoped>
  .task-list__empty {
    margin: 0;
    padding: 1rem;
    text-align: center;
    color: var(--muted);
    border: 1px dashed var(--border);
    border-radius: 8px;
  }

  .task-list__items {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
