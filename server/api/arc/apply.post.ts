import { spawnSync } from 'node:child_process'

// Run the HIBERNO-ARC apply pass from the /arc UI. DRY-RUN BY DEFAULT — the Drive
// doc is only written when the request explicitly sets apply:true (the "Apply to
// Drive" button), and only on fixes the author has accepted. commit:true also
// rebuilds the epub + commits. Mirrors scripts/hiberno-apply.mjs flags.
export default defineEventHandler(async (event) => {
  const body = await readBody<{ apply?: boolean; commit?: boolean }>(event)
  const flags: string[] = []
  if (body?.apply) flags.push('--apply')
  if (body?.apply && body?.commit) flags.push('--commit')
  const res = spawnSync('node', ['scripts/hiberno-apply.mjs', ...flags], {
    cwd: process.cwd(), encoding: 'utf8',
  })
  return {
    applied: !!body?.apply,
    ok: res.status === 0,
    output: (res.stdout || '') + (res.stderr || ''),
  }
})
