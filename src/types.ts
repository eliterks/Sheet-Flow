export type Difficulty = 'Basic' | 'Easy' | 'Medium' | 'Hard'

export interface Question {
  id: string
  name: string
  difficulty: Difficulty
  problemUrl?: string
  platform?: string
  resource?: string
  topics: string[]
  isSolved: boolean
  notes?: string
  starred?: boolean
}

export interface SubTopic {
  id: string
  name: string
  questions: Question[]
}

export interface Topic {
  id: string
  name: string
  subTopics: SubTopic[]
}

export interface SheetState {
  topics: Topic[]
  selectedTopicId?: string
  selectedSubTopicId?: string
  searchQuery: string
  filters: {
    solved: 'all' | 'solved' | 'unsolved'
    difficulty?: Difficulty
  }
  revision: string[]
  customLists?: { id: string; name: string; questionIds: string[] }[]
}
