// Walk a Google Docs API document response and produce one paragraph per line.
// Skips empty paragraphs. Preserves order. Strips trailing newlines on each
// paragraph (Docs API includes them inside textRun.content).
export function extractText(doc) {
  const lines = [];
  for (const elem of doc.body?.content || []) {
    if (!elem.paragraph) continue;
    const text = (elem.paragraph.elements || [])
      .map((e) => e.textRun?.content || '')
      .join('')
      .replace(/\n+$/, '');
    if (text.trim()) lines.push(text);
  }
  return lines.join('\n') + '\n';
}
