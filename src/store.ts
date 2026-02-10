import { create } from 'zustand'
import type { SheetState, Topic, SubTopic, Question, Difficulty } from './types'

type Actions = {
  loadInitialData: () => Promise<void>
  resetToApi: () => Promise<void>
  setSearchQuery: (q: string) => void
  setSolvedFilter: (f: SheetState['filters']['solved']) => void
  setDifficultyFilter: (d?: Difficulty) => void
  selectTopic: (id?: string) => void
  selectSubTopic: (id?: string) => void
  addTopic: (name: string) => void
  editTopic: (id: string, name: string) => void
  deleteTopic: (id: string) => void
  addSubTopic: (topicId: string, name: string) => void
  editSubTopic: (topicId: string, subId: string, name: string) => void
  deleteSubTopic: (topicId: string, subId: string) => void
  addQuestion: (topicId: string, subId: string, q: Omit<Question, 'id'>) => void
  editQuestion: (topicId: string, subId: string, qId: string, patch: Partial<Question>) => void
  deleteQuestion: (topicId: string, subId: string, qId: string) => void
  toggleSolved: (topicId: string, subId: string, qId: string) => void
  reorderTopics: (activeId: string, overId: string) => void
  reorderSubTopics: (topicId: string, activeId: string, overId: string) => void
  reorderQuestions: (topicId: string, subId: string, activeId: string, overId: string) => void
  toggleRevision: (qId: string) => void
  toggleStar: (topicId: string, subId: string, qId: string) => void
  addCustomList: (name: string, ids: string[]) => void
}

const uid = () => Math.random().toString(36).slice(2, 9)

export const useSheetStore = create<SheetState & Actions>((set, get) => ({
  topics: [],
  searchQuery: '',
  filters: { solved: 'all' },
  revision: [],
  customLists: [],
  async loadInitialData() {
    try {
      const persisted = localStorage.getItem('qm-persist')
      const persistedObj = persisted ? JSON.parse(persisted) : undefined

      let topics: Topic[] | undefined
      // Prefer local public/sheet.json if available
      try {
        const localResp = await fetch('/sheet.json', { cache: 'no-store' })
        if (localResp.ok) {
          const localJson = await localResp.json()
          if (Array.isArray((localJson as any).topics)) {
            const tps = (localJson as any).topics as any[]
            topics = tps.map((t) => ({
              id: uid(),
              name: t.name ?? 'Topic',
              subTopics: (t.subTopics ?? []).map((st: any) => ({
                id: uid(),
                name: st.name ?? 'Sub-topic',
                questions: (st.questions ?? []).map((q: any) => ({
                  id: q.id ?? uid(),
                  name: q.name ?? 'Untitled',
                  difficulty: (q.difficulty ?? 'Medium') as Difficulty,
                  problemUrl: q.problemUrl,
                  platform: q.platform,
                  resource: q.resource,
                  topics: Array.isArray(q.topics) ? q.topics : [],
                  isSolved: !!q.isSolved,
                  notes: q.notes ?? '',
                  starred: !!q.starred,
                })),
              })),
            }))
          } else if ((localJson as any)?.data?.questions) {
            const json: any = localJson
            const items: any[] = json?.data?.questions ?? []
            const grouped = new Map<string, Map<string, SubTopic>>()
            for (const item of items) {
              const topicName = item.topic || 'General'
              const subName = item.subTopic || item.title || 'Misc'
              const q: Question = {
                id: item._id ?? uid(),
                name: item.questionId?.name ?? item.title ?? 'Untitled',
                difficulty: (item.questionId?.difficulty ?? 'Medium') as Difficulty,
                problemUrl: item.questionId?.problemUrl,
                platform: item.questionId?.platform,
                resource: item.resource,
                topics: item.questionId?.topics ?? [],
                isSolved: !!item.isSolved,
                notes: '',
                starred: false,
              }
              if (!grouped.has(topicName)) grouped.set(topicName, new Map())
              const subMap = grouped.get(topicName)!
              if (!subMap.has(subName))
                subMap.set(subName, { id: uid(), name: subName, questions: [] })
              subMap.get(subName)!.questions.push(q)
            }
            const order: string[] =
              (json?.data?.sheet?.config?.topicOrder as string[] | undefined) ??
              Array.from(grouped.keys())
            const qOrder: string[] =
              (json?.data?.sheet?.config?.questionOrder as string[] | undefined) ?? []
            const qIndex = new Map<string, number>(qOrder.map((id, i) => [id, i]))
            topics = order.map((tName) => {
              const subMap = grouped.get(tName) ?? new Map<string, SubTopic>()
              const subs = Array.from(subMap.values()).map((st) => ({
                ...st,
                questions: [...st.questions].sort((a, b) => {
                  const ai = qIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER
                  const bi = qIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER
                  return ai - bi
                }),
              }))
              return {
                id: uid(),
                name: tName,
                subTopics: subs,
              }
            })
          }
        }
      } catch (_) {
        // ignore local load failure and fallback to API
      }

      if (!topics) {
        const resp = await fetch(
          'https://node.codolio.com/api/question-tracker/v1/sheet/public/get-sheet-by-slug/striver-sde-sheet',
        )
        const json = await resp.json()
        const items: any[] = json?.data?.questions ?? []
        const grouped = new Map<string, Map<string, SubTopic>>()
        for (const item of items) {
          const topicName = item.topic || 'General'
          const subName = item.subTopic || item.title || 'Misc'
          const q: Question = {
            id: item._id,
            name: item.questionId?.name ?? item.title ?? 'Untitled',
            difficulty: (item.questionId?.difficulty ?? 'Medium') as Difficulty,
            problemUrl: item.questionId?.problemUrl,
            platform: item.questionId?.platform,
            resource: item.resource,
            topics: item.questionId?.topics ?? [],
            isSolved: !!item.isSolved,
            notes: '',
            starred: false,
          }
          if (!grouped.has(topicName)) grouped.set(topicName, new Map())
          const subMap = grouped.get(topicName)!
          if (!subMap.has(subName))
            subMap.set(subName, { id: uid(), name: subName, questions: [] })
          subMap.get(subName)!.questions.push(q)
        }
        const order: string[] =
          (json?.data?.sheet?.config?.topicOrder as string[] | undefined) ??
          Array.from(grouped.keys())
        const qOrder: string[] = (json?.data?.sheet?.config?.questionOrder as string[] | undefined) ?? []
        const qIndex = new Map<string, number>(qOrder.map((id, i) => [id, i]))
        topics = order.map((tName) => {
          const subMap = grouped.get(tName) ?? new Map<string, SubTopic>()
          const subs = Array.from(subMap.values()).map((st) => ({
            ...st,
            questions: [...st.questions].sort((a, b) => {
              const ai = qIndex.get(a.id) ?? Number.MAX_SAFE_INTEGER
              const bi = qIndex.get(b.id) ?? Number.MAX_SAFE_INTEGER
              return ai - bi
            }),
          }))
          return {
            id: uid(),
            name: tName,
            subTopics: subs,
          }
        })
      }
      const finalTopics = topics ?? []
      set({
        topics: finalTopics,
        selectedTopicId: finalTopics[0]?.id,
        selectedSubTopicId: finalTopics[0]?.subTopics[0]?.id,
        revision: persistedObj?.revision ?? [],
        customLists: persistedObj?.customLists ?? [],
      })
    } catch (e) {
      console.error('Failed to load data', e)
    }
  },
  async resetToApi() {
    localStorage.removeItem('qm-persist')
    await get().loadInitialData()
  },
  setSearchQuery(q) {
    set({ searchQuery: q })
  },
  setSolvedFilter(f) {
    set((s) => ({ filters: { ...s.filters, solved: f } }))
  },
  setDifficultyFilter(d) {
    set((s) => ({ filters: { ...s.filters, difficulty: d } }))
  },
  selectTopic(id) {
    set((s) => {
      const t = s.topics.find((x) => x.id === id)
      return {
        selectedTopicId: id,
        selectedSubTopicId: t?.subTopics[0]?.id,
      }
    })
  },
  selectSubTopic(id) {
    set({ selectedSubTopicId: id })
  },
  addTopic(name) {
    const newTopic: Topic = { id: uid(), name, subTopics: [] }
    set((s) => ({ topics: [newTopic, ...s.topics], selectedTopicId: newTopic.id, selectedSubTopicId: undefined }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  editTopic(id, name) {
    set((s) => ({
      topics: s.topics.map((t) => (t.id === id ? { ...t, name } : t)),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  deleteTopic(id) {
    set((s) => ({
      topics: s.topics.filter((t) => t.id !== id),
      selectedTopicId: s.selectedTopicId === id ? undefined : s.selectedTopicId,
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  addSubTopic(topicId, name) {
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === topicId ? { ...t, subTopics: [{ id: uid(), name, questions: [] }, ...t.subTopics] } : t,
      ),
    }))
    const t = get().topics.find((x) => x.id === topicId)
    const first = t?.subTopics[0]?.id
    set({ selectedSubTopicId: first })
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  editSubTopic(topicId, subId, name) {
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === topicId
          ? { ...t, subTopics: t.subTopics.map((st) => (st.id === subId ? { ...st, name } : st)) }
          : t,
      ),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  deleteSubTopic(topicId, subId) {
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === topicId ? { ...t, subTopics: t.subTopics.filter((st) => st.id !== subId) } : t,
      ),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  addQuestion(topicId, subId, q) {
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subTopics: t.subTopics.map((st) =>
                st.id === subId
                  ? { ...st, questions: [{ id: uid(), ...q }, ...st.questions] }
                  : st,
              ),
            }
          : t,
      ),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  editQuestion(topicId, subId, qId, patch) {
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subTopics: t.subTopics.map((st) =>
                st.id === subId
                  ? {
                      ...st,
                      questions: st.questions.map((q) => (q.id === qId ? { ...q, ...patch } : q)),
                    }
                  : st,
              ),
            }
          : t,
      ),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  deleteQuestion(topicId, subId, qId) {
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subTopics: t.subTopics.map((st) =>
                st.id === subId ? { ...st, questions: st.questions.filter((q) => q.id !== qId) } : st,
              ),
            }
          : t,
      ),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  toggleSolved(topicId, subId, qId) {
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subTopics: t.subTopics.map((st) =>
                st.id === subId
                  ? {
                      ...st,
                      questions: st.questions.map((q) =>
                        q.id === qId ? { ...q, isSolved: !q.isSolved } : q,
                      ),
                    }
                  : st,
              ),
            }
          : t,
      ),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  reorderTopics(activeId, overId) {
    set((s) => {
      const arr = [...s.topics]
      const from = arr.findIndex((t) => t.id === activeId)
      const to = arr.findIndex((t) => t.id === overId)
      if (from === -1 || to === -1) return {}
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { topics: arr }
    })
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  reorderSubTopics(topicId, activeId, overId) {
    set((s) => ({
      topics: s.topics.map((t) => {
        if (t.id !== topicId) return t
        const arr = [...t.subTopics]
        const from = arr.findIndex((st) => st.id === activeId)
        const to = arr.findIndex((st) => st.id === overId)
        if (from === -1 || to === -1) return t
        const [moved] = arr.splice(from, 1)
        arr.splice(to, 0, moved)
        return { ...t, subTopics: arr }
      }),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  reorderQuestions(topicId, subId, activeId, overId) {
    set((s) => ({
      topics: s.topics.map((t) => {
        if (t.id !== topicId) return t
        return {
          ...t,
          subTopics: t.subTopics.map((st) => {
            if (st.id !== subId) return st
            const arr = [...st.questions]
            const from = arr.findIndex((q) => q.id === activeId)
            const to = arr.findIndex((q) => q.id === overId)
            if (from === -1 || to === -1) return st
            const [moved] = arr.splice(from, 1)
            arr.splice(to, 0, moved)
            return { ...st, questions: arr }
          }),
        }
      }),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  toggleRevision(qId) {
    set((s) => {
      const exists = s.revision.includes(qId)
      const next = exists ? s.revision.filter((id) => id !== qId) : [qId, ...s.revision]
      return { revision: next }
    })
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  toggleStar(topicId, subId, qId) {
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === topicId
          ? {
              ...t,
              subTopics: t.subTopics.map((st) =>
                st.id === subId
                  ? {
                      ...st,
                      questions: st.questions.map((q) =>
                        q.id === qId ? { ...q, starred: !q.starred } : q,
                      ),
                    }
                  : st,
              ),
            }
          : t,
      ),
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
  addCustomList(name, ids) {
    const id = uid()
    set((s) => ({
      customLists: [{ id, name, questionIds: ids }, ...(s.customLists ?? [])],
    }))
    localStorage.setItem('qm-persist', JSON.stringify({ topics: get().topics, revision: get().revision, customLists: get().customLists }))
  },
}))
