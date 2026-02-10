import './App.css'
import { ThemeToggle } from './components/ThemeToggle'
import { useEffect, useMemo, useState } from 'react'
import { useSheetStore } from './store'
import type { Difficulty } from './types'
import { SortableList } from './components/DndList'
import { CodolioLogo } from './components/UI/CodolioLogo'
import { RightPanel } from './components/Layout/RightPanel'
import { SubTopicsBar } from './components/Sections/SubTopicsBar'
import { QuestionCard } from './components/Cards/QuestionCard'

function App() {
  const {
    topics,
    selectedTopicId,
    selectedSubTopicId,
    loadInitialData,
    selectTopic,
    selectSubTopic,
    addTopic,
    addSubTopic,
    addQuestion,
    toggleSolved,
    setSearchQuery,
    searchQuery,
    setSolvedFilter,
    filters,
    setDifficultyFilter,
    revision,
    toggleRevision,
    reorderTopics,
    resetToApi,
  } = useSheetStore()

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  const [newTopic, setNewTopic] = useState('')
  const [newSub, setNewSub] = useState('')
  const [newQuestion, setNewQuestion] = useState({ name: '', difficulty: 'Medium' as Difficulty })

  const selectedTopic = useMemo(
    () => topics.find((t) => t.id === selectedTopicId) ?? topics[0],
    [topics, selectedTopicId],
  )
  const selectedSub = useMemo(
    () => selectedTopic?.subTopics.find((s) => s.id === selectedSubTopicId) ?? selectedTopic?.subTopics[0],
    [selectedTopic, selectedSubTopicId],
  )
  const [order, setOrder] = useState<'original' | 'diffAsc' | 'diffDesc'>('original')

  const diffRank: Record<Difficulty, number> = { Basic: 0, Easy: 1, Medium: 2, Hard: 3 }

  const allQuestions = useMemo(() => {
    return topics.flatMap((t) => t.subTopics).flatMap((st) => st.questions)
  }, [topics])

  const visibleQuestions = useMemo(() => {
    let qs =
      searchQuery.trim().length > 0
        ? allQuestions
        : selectedSub?.questions ?? []
    if (searchQuery) {
      const ql = searchQuery.toLowerCase()
      qs = qs.filter(
        (q) =>
          q.name.toLowerCase().includes(ql) ||
          (q.notes ?? '').toLowerCase().includes(ql) ||
          q.topics.join(' ').toLowerCase().includes(ql) ||
          (selectedTopic?.name.toLowerCase().includes(ql) ?? false),
      )
    }
    if (filters.solved !== 'all') {
      qs = qs.filter((q) => (filters.solved === 'solved' ? q.isSolved : !q.isSolved))
    }
    if (filters.difficulty) {
      qs = qs.filter((q) => q.difficulty === filters.difficulty)
    }
    if (order !== 'original') {
      qs = [...qs].sort((a, b) =>
        order === 'diffAsc'
          ? diffRank[a.difficulty] - diffRank[b.difficulty]
          : diffRank[b.difficulty] - diffRank[a.difficulty],
      )
    }
    return qs
  }, [selectedSub, searchQuery, filters, order, allQuestions, selectedTopic])

  const [tab, setTab] = useState<'overview' | 'revision'>('overview')
  const [randomCount, setRandomCount] = useState(1)
  const [randomPicks, setRandomPicks] = useState<string[]>([])
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [topicsOpen, setTopicsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSelectedQuestion, setMobileSelectedQuestion] = useState<string | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/60 backdrop-blur dark:bg-gray-900/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <CodolioLogo className="h-6 w-6" />
            <span className="font-semibold">Question Manager</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="rounded-md border px-2 py-1 text-sm"
              onClick={() => resetToApi()}
              title="Reload from API"
            >
              Reload
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 xl:grid-cols-5">
          <aside className={`lg:col-span-1 rounded-lg border p-3 transition-all duration-300 ${topicsOpen ? 'block' : 'hidden'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  className="rounded-md border p-1"
                  onClick={() => setTopicsOpen((v) => !v)}
                  title={topicsOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                  aria-label="Toggle sidebar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="4.5" y="7" width="4" height="10" rx="1" fill="currentColor" />
                    <rect x="9.5" y="7" width="10" height="3" rx="1" fill="currentColor" opacity="0.25" />
                    <rect x="9.5" y="11.5" width="10" height="5.5" rx="1" fill="currentColor" opacity="0.25" />
                  </svg>
                </button>
                <span className="text-sm font-semibold">Topics</span>
              </div>
              <span className="text-xs text-gray-500">{topics.length}</span>
            </div>
            <div className="mt-3">
              <SortableList
                ids={topics.map((t) => t.id)}
                onReorder={(a, b) => reorderTopics(a, b)}
                renderItem={(id) => {
                  const t = topics.find((x) => x.id === id)!
                  const total = t.subTopics.reduce((a, st) => a + st.questions.length, 0)
                  const solved = t.subTopics.reduce((a, st) => a + st.questions.filter((q) => q.isSolved).length, 0)
                  const pct = total ? Math.round((solved / total) * 100) : 0
                  return (
                    <li>
                      <button
                        className={`w-full rounded-lg border px-3 py-2 text-left ${t.id === selectedTopic?.id ? 'bg-blue-500/15 ring-1 ring-cyan-400/40' : 'hover:bg-blue-500/10'}`}
                        onClick={() => selectTopic(t.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</span>
                          <span className="text-xs text-gray-400">{solved}/{total}</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded bg-gray-700">
                          <div
                            className="h-2 rounded"
                            style={{
                              width: `${pct}%`,
                              background: 'linear-gradient(90deg, #3B82F6, #06B6D4)',
                            }}
                          />
                        </div>
                      </button>
                    </li>
                  )
                }}
              />
            </div>
          </aside>
          <section className="lg:col-span-3 rounded-lg border p-3">
              <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded-md border p-1 text-sm shrink-0"
                onClick={() => setTopicsOpen((v) => !v)}
                title={topicsOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                aria-label="Toggle sidebar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="4.5" y="7" width="4" height="10" rx="1" fill="currentColor" />
                  <rect x="9.5" y="7" width="10" height="3" rx="1" fill="currentColor" opacity="0.25" />
                  <rect x="9.5" y="11.5" width="10" height="5.5" rx="1" fill="currentColor" opacity="0.25" />
                </svg>
              </button>
              <input
                placeholder="Search questions or notes..."
                className="min-w-[200px] flex-1 rounded-md border px-2 py-1 text-sm bg-transparent"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="rounded-md border px-2 py-1 text-sm bg-transparent shrink-0"
                onChange={(e) => setSolvedFilter(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
              <select
                className="rounded-md border px-2 py-1 text-sm bg-transparent shrink-0"
                onChange={(e) => setDifficultyFilter((e.target.value || undefined) as Difficulty | undefined)}
              >
                <option value="">Any difficulty</option>
                {['Basic', 'Easy', 'Medium', 'Hard'].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                className="rounded-md border px-2 py-1 text-sm bg-transparent shrink-0"
                value={order}
                onChange={(e) => setOrder(e.target.value as any)}
              >
                <option value="original">Original order</option>
                <option value="diffAsc">Difficulty asc</option>
                <option value="diffDesc">Difficulty desc</option>
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  className="w-16 rounded-md border px-2 py-1 text-sm bg-transparent shrink-0"
                  value={randomCount}
                  onChange={(e) => setRandomCount(Math.max(1, Number(e.target.value)))}
                />
                <button
                  className="rounded-md border px-2 py-1 text-sm shrink-0"
                  onClick={() => {
                    const pool = [...visibleQuestions]
                    const picks: string[] = []
                    const n = Math.min(randomCount, pool.length)
                    while (picks.length < n && pool.length > 0) {
                      const idx = Math.floor(Math.random() * pool.length)
                      const [q] = pool.splice(idx, 1)
                      if (q) picks.push(q.id)
                    }
                    setRandomPicks(picks)
                    setTab('overview')
                  }}
                >
                  Random
                </button>
 
              </div>
              <button
                className={`rounded-md border px-2 py-1 text-sm ${tab === 'overview' ? 'bg-primary/20' : ''}`}
                onClick={() => setTab('overview')}
              >
                Overview
              </button>
              <button
                className={`rounded-md border px-2 py-1 text-sm ${tab === 'revision' ? 'bg-primary/20' : ''}`}
                onClick={() => setTab('revision')}
              >
                Revision ({revision.length})
              </button>
            </div>

              <div className="mt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{selectedTopic?.name}</h3>
                <div className="flex gap-2">
                  <input
                    value={newSub}
                    onChange={(e) => setNewSub(e.target.value)}
                    placeholder="New sub-topic"
                    className="rounded-md border px-2 py-1 text-sm bg-transparent"
                  />
                  <button
                    className="rounded-md border px-2 text-sm"
                    onClick={() => {
                      if (!newSub.trim() || !selectedTopic) return
                      addSubTopic(selectedTopic.id, newSub.trim())
                      setNewSub('')
                    }}
                  >
                    Add Sub-topic
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <SubTopicsBar />
                {isMobile ? (
                  <div className="mt-3">
                    <ul className="divide-y rounded-md border">
                      {visibleQuestions.map((q) => (
                        <li key={q.id}>
                          <button
                            className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-blue-500/10"
                            onClick={() => setMobileSelectedQuestion(q.id)}
                          >
                            <span className="text-sm font-medium">{q.name}</span>
                            <span className="text-xs text-gray-500">{q.difficulty}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {(() => {
                      const activeId = mobileSelectedQuestion ?? visibleQuestions[0]?.id
                      const q = visibleQuestions.find((x) => x.id === activeId)
                      return q ? (
                        <div className="mt-3">
                          <QuestionCard
                            q={q}
                            topicId={selectedTopic!.id}
                            subId={selectedSub!.id}
                            highlight={randomPicks.includes(q.id)}
                          />
                        </div>
                      ) : null
                    })()}
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {visibleQuestions.map((q) => (
                      <QuestionCard
                        key={q.id}
                        q={q}
                        topicId={selectedTopic!.id}
                        subId={selectedSub!.id}
                        highlight={randomPicks.includes(q.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-2">
                <input
                  value={newQuestion.name}
                  onChange={(e) => setNewQuestion((q) => ({ ...q, name: e.target.value }))}
                  placeholder="New question title"
                  className="flex-1 rounded-md border px-2 py-1 text-sm bg-transparent"
                />
                <select
                  value={newQuestion.difficulty}
                  className="rounded-md border px-2 py-1 text-sm bg-transparent"
                  onChange={(e) =>
                    setNewQuestion((q) => ({ ...q, difficulty: e.target.value as Difficulty }))
                  }
                >
                  {['Basic', 'Easy', 'Medium', 'Hard'].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <button
                  className="rounded-md border px-2 text-sm"
                  onClick={() => {
                    if (!selectedTopic || !selectedSub || !newQuestion.name.trim()) return
                    addQuestion(selectedTopic.id, selectedSub.id, {
                      name: newQuestion.name.trim(),
                      difficulty: newQuestion.difficulty,
                      isSolved: false,
                      topics: [],
                    })
                    setNewQuestion({ name: '', difficulty: 'Medium' })
                  }}
                >
                  Add Question
                </button>
              </div>
              {tab === 'overview' && (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <button
                      className={`rounded-md border px-2 py-1 text-sm ${selectMode ? 'bg-primary/20' : ''}`}
                      onClick={() => {
                        setSelectMode((v) => !v)
                        setSelectedIds([])
                      }}
                    >
                      Custom List
                    </button>
                    {selectMode && (
                      <button
                        className="rounded-md border px-2 py-1 text-sm"
                        onClick={() => {
                          const name = prompt('Custom list name') || 'My List'
                          if (selectedIds.length > 0) {
                            useSheetStore.getState().addCustomList(name.trim(), selectedIds)
                            setSelectMode(false)
                            setSelectedIds([])
                          }
                        }}
                      >
                        Save List
                      </button>
                    )}
                  </div>
                  {useSheetStore.getState().customLists?.length ? (
                    <div className="mt-2 text-xs text-gray-500">
                      {useSheetStore.getState().customLists!.map((l) => (
                        <span key={l.id} className="mr-2 inline-block rounded border px-2 py-1">
                          {l.name} ({l.questionIds.length})
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
              {tab === 'revision' && (
                <ul className="mt-3 divide-y rounded-md border">
                  {revision.map((id) => {
                    const q =
                      topics
                        .flatMap((t) => t.subTopics)
                        .flatMap((st) => st.questions)
                        .find((x) => x.id === id)
                    if (!q) return null
                    return (
                      <li key={id} className="flex items-center justify-between px-3 py-2">
                        <div>
                          <p className="text-sm font-medium">{q.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{q.difficulty}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-md border px-2 py-1 text-xs"
                            onClick={() => toggleRevision(id)}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              <div className="mt-6">
                <h4 className="text-sm font-semibold">Topic-wise progress</h4>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {topics.map((t) => {
                    const total = t.subTopics.reduce((acc, st) => acc + st.questions.length, 0)
                    const solved = t.subTopics.reduce(
                      (acc, st) => acc + st.questions.filter((q) => q.isSolved).length,
                      0,
                    )
                    const ratio = total ? solved / total : 0
                    const shade =
                      ratio > 0.8
                        ? 'bg-green-600'
                        : ratio > 0.6
                        ? 'bg-green-500'
                        : ratio > 0.4
                        ? 'bg-green-400'
                        : ratio > 0.2
                        ? 'bg-green-300'
                        : 'bg-green-200'
                    return (
                      <div key={t.id} className="rounded-md border p-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{t.name}</span>
                          <span className="text-xs">
                            {solved}/{total}
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded bg-gray-200 dark:bg-gray-700">
                          <div
                            className={`h-2 rounded ${shade}`}
                            style={{ width: `${Math.round(ratio * 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
          <RightPanel />
        </div>
      </main>
    </div>
  )
}

export default App
