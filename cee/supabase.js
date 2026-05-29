import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ============================================================
// AUTH HELPERS
// ============================================================
export const auth = {
  signUp: async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },
}

// ============================================================
// PROFILE HELPERS
// ============================================================
export const profiles = {
  getMe: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  update: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  updateRole: async (userId, role) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },
}

// ============================================================
// QUESTIONS HELPERS
// ============================================================
export const questions = {
  list: async (subject = null, chapter = null, limit = 50) => {
    let query = supabase.from('questions').select('*').limit(limit)
    if (subject) query = query.eq('subject', subject)
    if (chapter) query = query.eq('chapter', chapter)
    return await query.order('created_at', { ascending: false })
  },

  getForExam: async (subject, chapter, count = 10) => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .eq('chapter', chapter)
      .limit(count)
    // Shuffle for randomization
    const shuffled = data ? [...data].sort(() => Math.random() - 0.5) : []
    return { data: shuffled, error }
  },

  create: async (question) => {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single()
    return { data, error }
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('questions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },

  delete: async (id) => {
    const { error } = await supabase.from('questions').delete().eq('id', id)
    return { error }
  },

  getSubjects: async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('subject, chapter')
    const subjects = {}
    if (data) {
      data.forEach(({ subject, chapter }) => {
        if (!subjects[subject]) subjects[subject] = new Set()
        subjects[subject].add(chapter)
      })
    }
    return {
      data: Object.entries(subjects).map(([subject, chapters]) => ({
        subject,
        chapters: [...chapters],
      })),
      error,
    }
  },
}

// ============================================================
// ATTEMPTS HELPERS
// ============================================================
export const attempts = {
  create: async (attempt) => {
    const { data, error } = await supabase
      .from('attempts')
      .insert(attempt)
      .select()
      .single()
    return { data, error }
  },

  getMyAttempts: async (userId, limit = 20) => {
    const { data, error } = await supabase
      .from('attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },

  getAll: async (limit = 100) => {
    const { data, error } = await supabase
      .from('attempts')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data, error }
  },
}

// ============================================================
// LEADERBOARD HELPERS
// ============================================================
export const leaderboard = {
  get: async (limit = 50) => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(limit)
    return { data, error }
  },

  subscribeToUpdates: (callback) => {
    const channel = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attempts' }, callback)
      .subscribe()
    return channel
  },
}

// ============================================================
// EXAM SESSIONS HELPERS
// ============================================================
export const examSessions = {
  list: async () => {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*, profiles(full_name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  create: async (session) => {
    const { data, error } = await supabase
      .from('exam_sessions')
      .insert(session)
      .select()
      .single()
    return { data, error }
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('exam_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  },
}

// ============================================================
// ANALYTICS HELPERS
// ============================================================
export const analytics = {
  getSummary: async () => {
    const { data, error } = await supabase.from('analytics_summary').select('*').single()
    return { data, error }
  },

  getUserStats: async (userId) => {
    const { data, error } = await supabase
      .from('attempts')
      .select('score, total, subject, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    return { data, error }
  },
}

// ============================================================
// ACTIVITY LOG HELPERS
// ============================================================
export const activityLogs = {
  log: async (userId, event, metadata = {}) => {
    await supabase.from('activity_logs').insert({ user_id: userId, event, metadata })
  },
}

// ============================================================
// AI EXPLANATION HOOK
// ============================================================
export const getAIExplanation = async (question, options, correctAnswer, userAnswer) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) {
    return 'AI explanations require an OpenAI API key. Set VITE_OPENAI_API_KEY in your environment.'
  }

  const prompt = `
You are an expert tutor. Explain why the correct answer to the following MCQ is correct.

Question: ${question}
Options: ${options.map((o, i) => `${i}. ${o}`).join(', ')}
Correct Answer: Option ${correctAnswer} - "${options[correctAnswer]}"
${userAnswer !== correctAnswer ? `Student selected: Option ${userAnswer} - "${options[userAnswer]}"` : ''}

Provide a clear, educational explanation in 2-3 sentences.
`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    })
    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'Unable to generate explanation.'
  } catch {
    return 'Failed to fetch AI explanation. Please try again.'
  }
}
