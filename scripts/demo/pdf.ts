/**
 * A very small PDF writer, used only to give the demo's documents something
 * real to download.
 *
 * The portal serves whatever was uploaded, so a documents tab full of files
 * that fail to open is a worse demo than no documents at all. This produces a
 * valid one-page PDF using the base-14 Helvetica fonts — no dependency, nothing
 * to embed, a couple of kilobytes each.
 */

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 72;
const BODY_SIZE = 11;
const LEADING = 16;
/** Helvetica averages about half its point size per character. */
const WRAP_COLUMNS = Math.floor((PAGE_WIDTH - MARGIN * 2) / (BODY_SIZE * 0.5));

/**
 * The few non-ASCII characters the demo copy actually uses, mapped to their
 * WinAnsi byte. Anything else is dropped rather than mangled.
 */
const WIN_ANSI: Record<string, number> = {
  '—': 0x97,
  '–': 0x96,
  '’': 0x92,
  '‘': 0x91,
  '“': 0x93,
  '”': 0x94,
  '…': 0x85,
  '·': 0xb7
};

function encodeText(value: string) {
  return [...value]
    .map((char) => {
      const mapped = WIN_ANSI[char];
      if (mapped !== undefined) return String.fromCharCode(mapped);
      const code = char.codePointAt(0) ?? 0;
      return code >= 32 && code <= 126 ? char : '';
    })
    .join('')
    .replace(/([\\()])/g, '\\$1');
}

function wrap(text: string): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      if (line && `${line} ${word}`.length > WRAP_COLUMNS) {
        lines.push(line);
        line = word;
      } else {
        line = line ? `${line} ${word}` : word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function contentStream(title: string, body: string, footer: string) {
  const titleY = PAGE_HEIGHT - MARGIN - 12;
  const ruleY = titleY - 18;
  const bodyY = ruleY - 34;

  const bodyLines = wrap(body)
    .map((line) => `(${encodeText(line)}) Tj T*`)
    .join('\n');

  return `BT
/F2 20 Tf
${MARGIN} ${titleY} Td
(${encodeText(title)}) Tj
ET
0.68 0.67 0.65 RG
1.5 w
${MARGIN} ${ruleY} m ${PAGE_WIDTH - MARGIN} ${ruleY} l S
0.25 0.25 0.25 rg
BT
/F1 ${BODY_SIZE} Tf
${LEADING} TL
${MARGIN} ${bodyY} Td
${bodyLines}
ET
0.42 0.42 0.42 rg
BT
/F1 9 Tf
${MARGIN} ${MARGIN} Td
(${encodeText(footer)}) Tj
ET`;
}

export function samplePdf(title: string, body: string, footer: string): Buffer {
  const stream = contentStream(title, body, footer);

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      '/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  ];

  const chunks: Buffer[] = [];
  let offset = 0;
  const write = (value: string) => {
    // latin1 keeps one byte per code unit, so `offset` stays a true byte count
    // and the xref table below points where it says it does.
    const buffer = Buffer.from(value, 'latin1');
    chunks.push(buffer);
    offset += buffer.length;
  };

  write('%PDF-1.4\n');
  // Four high bytes, so anything sniffing the head treats the file as binary.
  write('%âãÏÓ\n');

  const offsets: number[] = [];
  objects.forEach((object, index) => {
    offsets.push(offset);
    write(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });

  const xrefOffset = offset;
  write(`xref\n0 ${objects.length + 1}\n`);
  write('0000000000 65535 f \n');
  for (const entry of offsets) write(`${String(entry).padStart(10, '0')} 00000 n \n`);
  write(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`
  );

  return Buffer.concat(chunks);
}
