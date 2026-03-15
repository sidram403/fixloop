import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Save } from 'lucide-react'
import { addFix, updateFix, getAllFixes } from '../db/db'
import { useToast } from '../context/ToastContext'
import TagInput from '../components/TagInput'

const DRAFT_KEY = 'fixloop-log-draft'
const DRAFT_INTERVAL_MS = 20_000

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return {
      errorMessage: typeof data.errorMessage === 'string' ? data.errorMessage : '',
      fix: typeof data.fix === 'string' ? data.fix : '',
      tags: Array.isArray(data.tags) ? data.tags : [],
      timeLost: data.timeLost !== undefined && data.timeLost !== '' ? String(data.timeLost) : '',
    }
  } catch {
    return null
  }
}

function saveDraft({ errorMessage, fix, tags, timeLost }) {
  try {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ errorMessage, fix, tags, timeLost: timeLost === '' ? '' : Number(timeLost) })
    )
  } catch (_) {}
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch (_) {}
}

export default function LogFix() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const editFix = location.state?.edit
  const prefilledError = location.state?.errorMessage ?? ''

  const [errorMessage, setErrorMessage] = useState(
    editFix?.errorMessage ?? prefilledError ?? ''
  )
  const [fix, setFix] = useState(editFix?.fix ?? '')
  const [tags, setTags] = useState(editFix?.tags ?? [])
  const [timeLost, setTimeLost] = useState(
    editFix?.timeLost != null ? String(editFix.timeLost) : ''
  )
  const [saving, setSaving] = useState(false)
  const [tagSuggestions, setTagSuggestions] = useState([])
  const [errors, setErrors] = useState({ errorMessage: '', fix: '' })

  useEffect(() => {
    if (editFix || prefilledError) return
    const draft = loadDraft()
    if (draft) {
      setErrorMessage(draft.errorMessage)
      setFix(draft.fix)
      setTags(draft.tags)
      setTimeLost(draft.timeLost)
    }
  }, [editFix, prefilledError])

  useEffect(() => {
    getAllFixes().then((fixes) => {
      const all = fixes.flatMap((f) => f.tags || []).filter(Boolean)
      setTagSuggestions([...new Set(all)])
    })
  }, [])

  useEffect(() => {
    if (editFix) return
    const interval = setInterval(() => {
      saveDraft({ errorMessage, fix, tags, timeLost })
    }, DRAFT_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [editFix, errorMessage, fix, tags, timeLost])

  const validate = useCallback(() => {
    const err = {
      errorMessage: !errorMessage.trim() ? 'Required' : '',
      fix: !fix.trim() ? 'Required' : '',
    }
    setErrors(err)
    return !err.errorMessage && !err.fix
  }, [errorMessage, fix])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setErrors({ errorMessage: '', fix: '' })
    try {
      if (editFix?.id != null) {
        await updateFix(editFix.id, {
          errorMessage: errorMessage.trim(),
          fix: fix.trim(),
          tags,
          timeLost: timeLost === '' ? undefined : parseInt(timeLost, 10),
        })
        clearDraft()
        toast('Fix updated')
        setTimeout(() => navigate('/logs'), 600)
      } else {
        await addFix({
          errorMessage: errorMessage.trim(),
          fix: fix.trim(),
          tags,
          timeLost: timeLost === '' ? undefined : parseInt(timeLost, 10),
        })
        clearDraft()
        setErrorMessage('')
        setFix('')
        setTags([])
        setTimeLost('')
        toast('✅ Fix logged!')
        setTimeout(() => navigate('/logs'), 800)
      }
    } catch (err) {
      toast(err?.message || 'Something went wrong', 'error')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        const form = document.querySelector('#log-fix-form')
        if (form && !saving) form.requestSubmit()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [saving])

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">
        {editFix ? 'Edit Fix' : 'Log a Fix'}
      </h1>
      <p className="mb-6 text-[var(--text-secondary)]">
        {editFix ? 'Update the fix below.' : 'Record an error and the solution that worked.'}
      </p>

      <form
        id="log-fix-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label htmlFor="errorMessage" className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            What was the error? <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            id="errorMessage"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            rows={5}
            className={`font-mono w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 placeholder:text-[var(--text-muted)] ${errors.errorMessage ? 'focus:border-[var(--danger)] focus:ring-[var(--danger)]' : 'focus:border-[var(--accent)] focus:ring-[var(--accent)]'}`}
            style={{
              borderColor: errors.errorMessage ? 'var(--danger)' : 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
            }}
            placeholder="Paste the exact error message..."
          />
          {errors.errorMessage && (
            <p className="mt-1 text-sm text-[var(--danger)]">{errors.errorMessage}</p>
          )}
        </div>

        <div>
          <label htmlFor="fix" className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            What fixed it? <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            id="fix"
            value={fix}
            onChange={(e) => setFix(e.target.value)}
            rows={4}
            className={`font-mono w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 placeholder:text-[var(--text-muted)] ${errors.fix ? 'focus:border-[var(--danger)] focus:ring-[var(--danger)]' : 'focus:border-[var(--accent)] focus:ring-[var(--accent)]'}`}
            style={{
              borderColor: errors.fix ? 'var(--danger)' : 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
            }}
            placeholder="Paste the solution that worked..."
          />
          {errors.fix && (
            <p className="mt-1 text-sm text-[var(--danger)]">{errors.fix}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            Tags
          </label>
          <TagInput
            value={tags}
            onChange={setTags}
            suggestions={tagSuggestions}
            placeholder="react, async, css, sql..."
          />
        </div>

        <div className="max-w-[140px]">
          <label htmlFor="timeLost" className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
            How many minutes did this cost you?
          </label>
          <input
            id="timeLost"
            type="number"
            min={0}
            value={timeLost}
            onChange={(e) => setTimeLost(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:border-[var(--accent)] focus:ring-[var(--accent)]"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--btn-primary-text)' }}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : editFix ? 'Update fix' : 'Save fix'}
        </button>
      </form>

      <p className="mt-4 text-xs text-[var(--text-muted)]">
        <kbd className="rounded border px-1.5 py-0.5 font-mono" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>⌘</kbd> + <kbd className="rounded border px-1.5 py-0.5 font-mono" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>Enter</kbd> to submit
      </p>
    </div>
  )
}
