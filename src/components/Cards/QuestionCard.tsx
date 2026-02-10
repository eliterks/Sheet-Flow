import React from 'react'
import { useSheetStore } from '../../store'
import type { Question } from '../../types'

export function QuestionCard({
  q,
  topicId,
  subId,
  highlight = false,
}: {
  q: Question
  topicId: string
  subId: string
  highlight?: boolean
}) {
  const { toggleSolved, toggleRevision } = useSheetStore()
  const solvedClass = q.isSolved ? 'bg-green-600 text-white' : ''
  const diffClass =
    q.difficulty === 'Easy'
      ? 'bg-green-500 text-white'
      : q.difficulty === 'Medium'
      ? 'bg-yellow-400 text-black'
      : q.difficulty === 'Hard'
      ? 'bg-red-500 text-white'
      : 'bg-gray-500 text-white'
  const accent =
    q.difficulty === 'Easy'
      ? 'linear-gradient(90deg, #10B981, #059669)'
      : q.difficulty === 'Medium'
      ? 'linear-gradient(90deg, #F59E0B, #D97706)'
      : q.difficulty === 'Hard'
      ? 'linear-gradient(90deg, #EF4444, #DC2626)'
      : 'linear-gradient(90deg, #3B82F6, #06B6D4)'
  return (
    <div className={`rounded-lg border p-0 shadow-sm ${highlight ? 'bg-yellow-100 dark:bg-yellow-900/40' : ''}`}>
      <div className="h-1 w-full rounded-t" style={{ background: accent }} />
      <div className="p-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">{q.name}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {q.difficulty}
            {q.platform ? ` • ${q.platform}` : ''}
            {q.topics?.length ? ` • ${q.topics.join(', ')}` : ''}
          </p>
        </div>
        <span className={`rounded px-2 py-1 text-xs ${diffClass}`}>{q.difficulty}</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          className={`rounded-md border px-2 py-1 text-xs ${solvedClass}`}
          onClick={() => toggleSolved(topicId, subId, q.id)}
        >
          {q.isSolved ? 'Mark Unsolved' : 'Mark Solved'}
        </button>
        <button
          className={`rounded-md border px-2 py-1 text-xs`}
          onClick={() => toggleRevision(q.id)}
        >
          Add Revision
        </button>
        <button
          className="rounded-md border px-2 py-1 text-xs"
          onClick={() => {
            const nn = prompt('Notes', q.notes ?? '')
            if (nn === null) return
            useSheetStore.getState().editQuestion(topicId, subId, q.id, { notes: nn })
          }}
        >
          Notes
        </button>
        {q.problemUrl && (
          <a
            className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
            href={q.problemUrl}
            target="_blank"
            title="Open in LeetCode"
          >
            <img
              src="https://codolio.com/icons/leetcode_light.png"
              alt="LeetCode"
              className="h-5 w-5 dark:hidden"
            />
            <img
              src="https://codolio.com/icons/leetcode_dark.png"
              alt="LeetCode"
              className="hidden h-5 w-5 dark:block"
            />
            <span className="underline">LeetCode</span>
          </a>
        )}
        {q.resource && (
          <a
            className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
            href={q.resource}
            target="_blank"
            title="Video resource"
          >
            <svg
              width="24"
              height="20"
              viewBox="0 0 26 20"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-600 dark:text-red-500"
            >
              <path d="M10.4 14.403L17.147 10.3651L10.4 6.3272V14.403ZM25.428 3.86409C25.597 4.49669 25.714 5.34465 25.792 6.42142C25.883 7.49819 25.922 8.4269 25.922 9.23448L26 10.3651C26 13.3127 25.792 15.4797 25.428 16.8661C25.103 18.0774 24.349 18.8581 23.179 19.1946C22.568 19.3696 21.45 19.4907 19.734 19.5715C18.044 19.6657 16.497 19.706 15.067 19.706L13 19.7868C7.553 19.7868 4.16 19.5715 2.821 19.1946C1.651 18.8581 0.897 18.0774 0.572 16.8661C0.403 16.2335 0.286 15.3855 0.208 14.3087C0.117 13.232 0.0779999 12.3033 0.0779999 11.4957L0 10.3651C0 7.41743 0.208 5.25043 0.572 3.86409C0.897 2.65273 1.651 1.87207 2.821 1.53558C3.432 1.36061 4.55 1.23947 6.266 1.15871C7.956 1.0645 9.503 1.02412 10.933 1.02412L13 0.943359C18.447 0.943359 21.84 1.15871 23.179 1.53558C24.349 1.87207 25.103 2.65273 25.428 3.86409Z" />
            </svg>
            <span className="underline">YouTube</span>
          </a>
        )}
      </div>
      </div>
    </div>
  )
}
