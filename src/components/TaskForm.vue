<script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'

  const props = defineProps<{
    editing?: Task | null
    submitting?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'submit', payload: TaskCreateInput | TaskUpdateInput): void
    (e: 'cancel'): void
  }>()

  const title = ref('')
  const description = ref('')

  watch(
    () => props.editing,
    (task) => {
      title.value = task?.title ?? ''
      description.value = task?.description ?? ''
    },
    { immediate: true },
  )

  function handleSubmit() {
    const trimmedTitle = title.value.trim()
    if (!trimmedTitle) return
    emit('submit', {
      title: trimmedTitle,
      description: description.value.trim() || null,
    })
    if (!props.editing) {
      title.value = ''
      description.value = ''
    }
  }
</script>

<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <h2 class="task-form__title">{{ editing ? 'Editar tarefa' : 'Nova tarefa' }}</h2>

    <label class="field">
      <span class="field__label">Título</span>
      <input
        v-model="title"
        type="text"
        required
        maxlength="200"
        placeholder="Comprar pão"
        class="field__input"
      />
    </label>

    <label class="field">
      <span class="field__label">Descrição</span>
      <textarea
        v-model="description"
        rows="3"
        placeholder="Opcional"
        class="field__input field__input--textarea"
      />
    </label>

    <div class="task-form__actions">
      <button
        type="submit"
        class="btn btn--primary"
        :disabled="submitting || !title.trim()"
      >
        {{ editing ? 'Salvar' : 'Adicionar' }}
      </button>
      <button
        v-if="editing"
        type="button"
        class="btn btn--ghost"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        Cancelar
      </button>
    </div>
  </form>
</template>

<style scoped>
  .task-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
  }

  .task-form__title {
    margin: 0;
    font-size: 1.1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .field__label {
    font-size: 0.85rem;
    color: var(--muted);
  }

  .field__input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    font: inherit;
    background: var(--bg);
    color: inherit;
  }

  .field__input--textarea {
    resize: vertical;
    min-height: 60px;
  }

  .task-form__actions {
    display: flex;
    gap: 0.5rem;
  }
</style>
