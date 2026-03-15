import Dexie from 'dexie'

const db = new Dexie('FixLoopDB')
db.version(1).stores({
  fixes: '++id, createdAt',
})

/**
 * @typedef {Object} Fix
 * @property {number} [id]
 * @property {string} errorMessage
 * @property {string} fix
 * @property {string[]} [tags]
 * @property {number} [timeLost]
 * @property {number} createdAt
 */

/**
 * Add a new fix.
 * @param {Omit<Fix, 'id' | 'createdAt'> & { createdAt?: number }} fix
 * @returns {Promise<number>} New id
 */
export async function addFix(fix) {
  const now = Date.now()
  return db.fixes.add({
    ...fix,
    tags: fix.tags ?? [],
    createdAt: fix.createdAt ?? now,
  })
}

/**
 * Update an existing fix by id.
 * @param {number} id
 * @param {Partial<Fix>} changes
 */
export async function updateFix(id, changes) {
  await db.fixes.update(id, changes)
}

/**
 * Delete a fix by id.
 * @param {number} id
 */
export async function deleteFix(id) {
  await db.fixes.delete(id)
}

/**
 * Get all fixes, newest first.
 * @returns {Promise<Fix[]>}
 */
export async function getAllFixes() {
  const list = await db.fixes.toArray()
  return list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
}

/**
 * Get a single fix by id.
 * @param {number} id
 * @returns {Promise<Fix | undefined>}
 */
export async function getFixById(id) {
  return db.fixes.get(id)
}

/**
 * Seed the database with sample data (idempotent: only if empty).
 * @param {Fix[]} samples
 * @returns {Promise<boolean>} true if data was seeded, false otherwise
 */
export async function seedIfEmpty(samples) {
  const count = await db.fixes.count()
  if (count === 0 && samples?.length) {
    await db.fixes.bulkAdd(samples)
    return true
  }
  return false
}

/**
 * Export all fixes as JSON string (for backup/download).
 * @returns {Promise<string>}
 */
export async function exportAllFixes() {
  const list = await getAllFixes()
  return JSON.stringify(list, null, 2)
}

/**
 * Import fixes from JSON string. Merges with existing (does not clear first).
 * @param {string} json
 * @returns {Promise<{ added: number }>}
 */
export async function importFixes(json) {
  let data
  try {
    data = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON')
  }
  const list = Array.isArray(data) ? data : [data]
  const valid = list.filter(
    (f) => f && typeof f.errorMessage === 'string' && typeof f.fix === 'string'
  )
  const toAdd = valid.map(({ id, ...rest }) => ({
    ...rest,
    tags: rest.tags ?? [],
    createdAt: rest.createdAt ?? Date.now(),
  }))
  if (toAdd.length > 0) await db.fixes.bulkAdd(toAdd)
  return { added: toAdd.length }
}

export { db }
