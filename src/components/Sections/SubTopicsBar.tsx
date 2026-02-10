import { useSheetStore } from '../../store'
import { SortableList } from '../../components/DndList'

export function SubTopicsBar() {
  const { topics, selectedTopicId, selectedSubTopicId, selectSubTopic, editSubTopic, deleteSubTopic, reorderSubTopics } = useSheetStore()
  const topic = topics.find((t) => t.id === selectedTopicId)
  if (!topic) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SortableList
        ids={topic.subTopics.map((s) => s.id)}
        onReorder={(a, b) => reorderSubTopics(topic.id, a, b)}
        renderItem={(id) => {
          const st = topic.subTopics.find((x) => x.id === id)!
          const count = st.questions.length
          const solved = st.questions.filter((q) => q.isSolved).length
          const active = st.id === selectedSubTopicId
          return (
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm border ${active ? 'bg-primary/20' : 'hover:bg-muted-light dark:hover:bg-muted-dark'}`}>
              <button onClick={() => selectSubTopic(st.id)} title={`${solved}/${count} solved`}>
                {st.name} ({count})
              </button>
              <button
                className="rounded border px-2 py-0.5 text-xs"
                onClick={() => {
                  const nn = prompt('Rename sub-topic', st.name)
                  if (nn && nn.trim()) editSubTopic(topic.id, st.id, nn.trim())
                }}
                title="Rename sub-topic"
                aria-label="Rename sub-topic"
              >
                Edit
              </button>
              <button
                className="rounded border px-2 py-0.5 text-xs"
                onClick={() => {
                  if (confirm('Delete this sub-topic?')) deleteSubTopic(topic.id, st.id)
                }}
                title="Delete sub-topic"
                aria-label="Delete sub-topic"
              >
                Delete
              </button>
            </div>
          )
        }}
      />
    </div>
  )
}
