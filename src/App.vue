<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import TaskForm from '@/components/TaskForm.vue'
  import TaskList from '@/components/TaskList.vue'
  import { useTasksStore } from '@/stores/tasks'
  import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'

  const store = useTasksStore()
  const { pending, completed, loading, error } = storeToRefs(store)

  const editing = ref<Task | null>(null)
  const submitting = ref(false)

  onMounted(() => {
    store.fetchAll()
  })

  async function handleSubmit(payload: TaskCreateInput | TaskUpdateInput) {
    submitting.value = true
    try {
      if (editing.value) {
        await store.updateTask(editing.value.id, payload as TaskUpdateInput)
        editing.value = null
      } else {
        await store.createTask(payload as TaskCreateInput)
      }
    } finally {
      submitting.value = false
    }
  }

  function handleEdit(task: Task) {
    editing.value = task
  }

  function handleCancelEdit() {
    editing.value = null
  }
</script>

<template>
  <main class="app">
    <header class="app__header">
      <h1>Todo List</h1>
      <p class="app__subtitle">Vue 3 + Pinia · consumindo API Flask</p>
    </header>

    <section class="app__panel">
      <TaskForm
        :editing="editing"
        :submitting="submitting"
        @submit="handleSubmit"
        @cancel="handleCancelEdit"
      />
    </section>

    <p v-if="error" class="app__error" role="alert">{{ error }}</p>
    <p v-if="loading" class="app__loading">Carregando…</p>

    <section class="app__panel">
      <h2 class="app__section-title">Pendentes ({{ pending.length }})</h2>
      <TaskList
        :tasks="pending"
        empty-label="Nenhuma tarefa pendente."
        @toggle="store.toggleTask"
        @remove="store.removeTask($event.id)"
        @edit="handleEdit"
      />
    </section>

    <section class="app__panel">
      <h2 class="app__section-title">Concluídas ({{ completed.length }})</h2>
      <TaskList
        :tasks="completed"
        empty-label="Nenhuma tarefa concluída."
        @toggle="store.toggleTask"
        @remove="store.removeTask($event.id)"
        @edit="handleEdit"
      />
    </section>
  </main>
</template>

<style scoped>
  .app {
    max-width: 720px;
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .app__header h1 {
    margin: 0 0 0.25rem;
    font-size: 1.75rem;
  }

  .app__subtitle {
    margin: 0;
    color: var(--muted);
  }

  .app__panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .app__section-title {
    font-size: 1rem;
    margin: 0;
    color: var(--muted);
  }

  .app__error {
    color: #c0392b;
    background: #fdecea;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    margin: 0;
  }

  .app__loading {
    margin: 0;
    color: var(--muted);
  }
</style>
