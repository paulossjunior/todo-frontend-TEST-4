import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { tasksApi } from '@/services/tasksApi'
import type { Task, TaskCreateInput, TaskUpdateInput } from '@/types/task'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const pending = computed(() => tasks.value.filter((t) => !t.completed))
  const completed = computed(() => tasks.value.filter((t) => t.completed))

  function setError(e: unknown) {
    error.value = e instanceof Error ? e.message : 'Erro desconhecido'
  }

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      tasks.value = await tasksApi.list()
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  async function createTask(payload: TaskCreateInput) {
    error.value = null
    try {
      const task = await tasksApi.create(payload)
      tasks.value = [task, ...tasks.value]
      return task
    } catch (e) {
      setError(e)
      throw e
    }
  }

  async function updateTask(id: number, payload: TaskUpdateInput) {
    error.value = null
    try {
      const updated = await tasksApi.update(id, payload)
      tasks.value = tasks.value.map((t) => (t.id === id ? updated : t))
      return updated
    } catch (e) {
      setError(e)
      throw e
    }
  }

  async function toggleTask(task: Task) {
    return updateTask(task.id, { completed: !task.completed })
  }

  async function removeTask(id: number) {
    error.value = null
    try {
      await tasksApi.remove(id)
      tasks.value = tasks.value.filter((t) => t.id !== id)
    } catch (e) {
      setError(e)
      throw e
    }
  }

  return {
    tasks,
    loading,
    error,
    pending,
    completed,
    fetchAll,
    createTask,
    updateTask,
    toggleTask,
    removeTask,
  }
})
