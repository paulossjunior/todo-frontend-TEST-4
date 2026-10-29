# todo-frontend

Frontend Vue 3 para a aplicação de todo list, consumindo a API Flask (`/api/tasks`).

## Stack

- Vue 3 + Composition API + `<script setup>` + TypeScript
- Pinia (estado das tarefas)
- Vite (dev server e build)
- Vitest + `@vue/test-utils` (testes de componente)
- ESLint 9 (flat config) + Prettier + `vue-tsc`
- CSS puro (variáveis + dark mode via `prefers-color-scheme`)

## Pré-requisitos

- Node.js ≥ 20
- API backend rodando (sub-issue TEST-3). Padrão: `http://localhost:5000`.

## Setup

```bash
npm install
cp .env.example .env
# Edite .env e ajuste VITE_API_URL se precisar
```

## Scripts

| Comando            | O que faz                                      |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Dev server Vite (HMR) em `http://localhost:5173` |
| `npm run build`    | Checagem de tipos (`vue-tsc`) + build de produção |
| `npm run preview`  | Serve o build gerado em `dist/`                |
| `npm run typecheck`| Apenas checagem de tipos                       |
| `npm run lint`     | ESLint em `src/` e `tests/`                    |
| `npm run format`   | Prettier escreve formatação em `src/`          |
| `npm test`         | Rodada única do Vitest                         |
| `npm run test:watch` | Vitest em modo watch                         |

## Estrutura

```
src/
  components/
    TaskForm.vue    # cria/edita tarefa
    TaskItem.vue    # exibe uma tarefa; emite toggle/edit/remove
    TaskList.vue    # lista de TaskItem; estado vazio
  services/
    tasksApi.ts     # cliente HTTP (fetch) para /api/tasks
  stores/
    tasks.ts        # Pinia store (list/create/update/toggle/remove)
  styles/
    main.css        # tema base + variáveis CSS + classes de botão
  types/
    task.ts         # Task, TaskCreateInput, TaskUpdateInput
  App.vue           # layout e orquestração dos componentes
  main.ts           # bootstrap do app + Pinia
```

## Contrato da API consumida

Base URL vem de `VITE_API_URL`. Endpoints esperados:

| Método | Rota               | Corpo                                          | Resposta         |
| ------ | ------------------ | ---------------------------------------------- | ---------------- |
| GET    | `/api/tasks`       | —                                              | `Task[]`         |
| POST   | `/api/tasks`       | `{ title, description? }`                      | `Task` (201)     |
| GET    | `/api/tasks/<id>`  | —                                              | `Task`           |
| PATCH  | `/api/tasks/<id>`  | `{ title?, description?, completed? }`         | `Task`           |
| DELETE | `/api/tasks/<id>`  | —                                              | 204 No Content   |

Formato de `Task`:

```ts
interface Task {
  id: number
  title: string
  description: string | null
  completed: boolean
  created_at: string // ISO-8601
  updated_at: string // ISO-8601
}
```

CORS precisa estar habilitado no backend para a origem do dev server
(`http://localhost:5173`) e para a origem usada em produção.

## Dev loop

1. Suba o backend Flask (sub-issue TEST-3) em `http://localhost:5000`.
2. `npm run dev` neste repo.
3. Abra `http://localhost:5173`.
4. Crie, edite, marque como concluída e remova tarefas.

## Testes

`npm test` roda `tests/TaskItem.spec.ts`, que cobre render, estado concluído e os
três eventos emitidos (`toggle`, `edit`, `remove`). Suíte ampliada e integração
ficam a cargo do QA (sub-issue TEST-5).
