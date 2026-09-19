import { useState } from 'react'
import { ChevronDownIcon, CloseIcon, PlusIcon } from './Icons'

interface FocusTask {
  id: string
  label: string
  done: boolean
}

const INITIAL_TASKS: FocusTask[] = [
  { id: 'created-by-alby', label: 'Created by Alby Jacob Martin', done: false },
  { id: 'open-source-project', label: 'This is a Open Source Project', done: false },
  { id: 'like-this-project', label: 'If you like this project', done: false },
  { id: 'star-on-github', label: 'Giving a star on Github would be great', done: false },
]

export default function FocusQueue() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [newTask, setNewTask] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const remainingTasks = tasks.filter((task) => !task.done).length

  const addTask = () => {
    const label = newTask.trim()
    if (!label) {
      return
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      { id: crypto.randomUUID(), label, done: false },
    ])
    setNewTask('')
  }

  return (
    <aside className="focus-queue" aria-labelledby="tasks-title">
      <h2 id="tasks-title" className="focus-queue__title">
        <button
          className={`focus-queue__header${isCollapsed ? '' : ' focus-queue__header--expanded'}`}
          type="button"
          onClick={() => setIsCollapsed((current) => !current)}
          aria-expanded={!isCollapsed}
          aria-controls="tasks-content"
        >
          <span className="focus-queue__header-copy">
            <span className="focus-queue__heading-text">Tasks</span>
            <span>{remainingTasks} left</span>
          </span>
          <ChevronDownIcon
            className={`focus-queue__chevron${isCollapsed ? ' focus-queue__chevron--collapsed' : ''}`}
            width="14"
            height="14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </button>
      </h2>
      {!isCollapsed && (
        <div id="tasks-content" className="focus-queue__body">
          <div className="focus-queue__list">
            {tasks.map((task) => (
              <div key={task.id} className="focus-queue__task-row">
                <button
                  className={`focus-queue__task${task.done ? ' focus-queue__task--done' : ''}`}
                  type="button"
                  onClick={() => {
                    setTasks((currentTasks) =>
                      currentTasks.map((currentTask) =>
                        currentTask.id === task.id
                          ? { ...currentTask, done: !currentTask.done }
                          : currentTask,
                      ),
                    )
                  }}
                  aria-pressed={task.done}
                >
                  <span className="focus-queue__check" aria-hidden="true">
                    {task.done && (
                      <svg viewBox="0 0 12 12" fill="none">
                        <path d="m2 6 3 3 5-5" />
                      </svg>
                    )}
                  </span>
                  <span>{task.label}</span>
                </button>
                <button
                  className="focus-queue__remove"
                  type="button"
                  onClick={() => {
                    setTasks((currentTasks) =>
                      currentTasks.filter((currentTask) => currentTask.id !== task.id),
                    )
                  }}
                  aria-label={`Remove ${task.label}`}
                  title="Remove task"
                >
                  <CloseIcon
                    width="12"
                    height="12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </button>
              </div>
            ))}
          </div>
          <form
            className="focus-queue__form"
            onSubmit={(event) => {
              event.preventDefault()
              addTask()
            }}
          >
            <label className="visually-hidden" htmlFor="new-task">
              New task
            </label>
            <input
              id="new-task"
              value={newTask}
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="Add a task…"
              maxLength={120}
            />
            <button type="submit" aria-label="Add task" title="Add task" disabled={!newTask.trim()}>
              <PlusIcon width="14" height="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </button>
          </form>
        </div>
      )}
    </aside>
  )
}
