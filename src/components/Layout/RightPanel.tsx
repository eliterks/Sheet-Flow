import { useMemo } from 'react'
import { useSheetStore } from '../../store'

export function RightPanel() {
  const { topics, revision } = useSheetStore()

  const stats = useMemo(() => {
    const all = topics.flatMap((t) => t.subTopics).flatMap((st) => st.questions)
    const total = all.length
    const solvedQs = all.filter((q) => q.isSolved)
    const solved = solvedQs.length
    const pct = total ? Math.round((solved / total) * 100) : 0
    const easy = solvedQs.filter((q) => q.difficulty === 'Easy').length
    const medium = solvedQs.filter((q) => q.difficulty === 'Medium').length
    const hard = solvedQs.filter((q) => q.difficulty === 'Hard').length
    const denom = solved || 1
    const easyPct = Math.round((easy / denom) * 100)
    const medPct = Math.round((medium / denom) * 100)
    const hardPct = Math.round((hard / denom) * 100)
    return { total, solved, pct, easyPct, medPct, hardPct }
  }, [topics])

  const ring = `conic-gradient(#22c55e ${stats.pct * 3.6}deg, #1f2937 0)`

  return (
    <aside className="hidden lg:block rounded-lg border p-3 lg:col-span-1">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">Revision ({revision.length})</h3>
        <ul className="mt-2 space-y-2">
          {revision.map((id) => {
            const q =
              topics
                .flatMap((t) => t.subTopics)
                .flatMap((st) => st.questions)
                .find((x) => x.id === id)
            if (!q) return null
            return (
              <li key={id} className="rounded-md border px-2 py-1">
                <div className="text-sm">{q.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{q.difficulty}</div>
              </li>
            )
          })}
          {revision.length === 0 && (
            <li className="text-xs text-gray-500">No items added to revision</li>
          )}
        </ul>
      </div>

      <div className="rounded-lg border p-3">
        <h3 className="text-sm font-semibold">Progress</h3>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="h-20 w-20 rounded-full"
            style={{ background: ring }}
            aria-label={`Progress ${stats.pct}%`}
            role="img"
            title={`${stats.pct}% solved`}
          />
          <div className="text-xs w-full">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded bg-green-500" />
              Easy {stats.easyPct}%
            </div>
            <div className="mt-1 h-2 w-full rounded bg-gray-700">
              <div className="h-2 rounded bg-green-500" style={{ width: `${stats.easyPct}%` }} />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded bg-yellow-400" />
              Medium {stats.medPct}%
            </div>
            <div className="mt-1 h-2 w-full rounded bg-gray-700">
              <div className="h-2 rounded bg-yellow-400" style={{ width: `${stats.medPct}%` }} />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded bg-red-500" />
              Hard {stats.hardPct}%
            </div>
            <div className="mt-1 h-2 w-full rounded bg-gray-700">
              <div className="h-2 rounded bg-red-500" style={{ width: `${stats.hardPct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
