import React from 'react'
import { useSheetStore } from '../../store'

export function SubTopicsBar() {
  const { topics, selectedTopicId, selectedSubTopicId, selectSubTopic } = useSheetStore()
  const topic = topics.find((t) => t.id === selectedTopicId)
  if (!topic) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {topic.subTopics.map((st) => {
        const count = st.questions.length
        const solved = st.questions.filter((q) => q.isSolved).length
        const active = st.id === selectedSubTopicId
        return (
          <button
            key={st.id}
            className={`rounded-full px-3 py-1 text-sm border ${active ? 'bg-primary/20' : 'hover:bg-muted-light dark:hover:bg-muted-dark'}`}
            onClick={() => selectSubTopic(st.id)}
            title={`${solved}/${count} solved`}
          >
            {st.name} ({count})
          </button>
        )
      })}
    </div>
  )
}

