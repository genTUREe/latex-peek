const mathEnvironments = [
  'align', 'align*', 'alignat', 'alignat*', 'aligned', 'alignedat', 'array',
  'Bmatrix', 'bmatrix', 'cases', 'CD', 'eqnarray', 'eqnarray*', 'equation',
  'equation*', 'gather', 'gather*', 'gathered', 'matrix', 'multline',
  'multline*', 'pmatrix', 'smallmatrix', 'split', 'subarray', 'Vmatrix', 'vmatrix'
];

interface MathRange {
  start: number;
  end: number;
}

export function getMathAtPosition(text: string, position: number): string | undefined {
  const ranges = [
    ...findDelimitedMath(text, /\$\$([\s\S]*?)\$\$/g, 2),
    ...findDelimitedMath(text, /(?<!\\)\$(?!\$)([\s\S]*?)(?<!\\)\$(?!\$)/g, 1),
    ...findDelimitedMath(text, /\\\[([\s\S]*?)\\\]/g, 2),
    ...findDelimitedMath(text, /\\\(([\s\S]*?)\\\)/g, 2),
    ...findMathEnvironments(text)
  ];

  const match = ranges
    .filter((range) => position >= range.start && position <= range.end)
    .sort((left, right) => (left.end - left.start) - (right.end - right.start))[0];

  return match ? text.slice(match.start, match.end).trim() : undefined;
}

function findDelimitedMath(text: string, pattern: RegExp, openingLength: number): MathRange[] {
  const matches: MathRange[] = [];
  for (const match of text.matchAll(pattern)) {
    const content = match[1];
    if (content === undefined || match.index === undefined) {
      continue;
    }

    const start = match.index + openingLength;
    matches.push({ start, end: start + content.length });
  }
  return matches;
}

function findMathEnvironments(text: string): MathRange[] {
  const environmentNames = mathEnvironments
    .map((name) => name.replace('*', '\\*'))
    .join('|');
  const beginPattern = new RegExp(`\\\\begin\\{(${environmentNames})\\}`, 'g');
  const ranges: MathRange[] = [];
  let match: RegExpExecArray | null;

  while ((match = beginPattern.exec(text)) !== null) {
    const environment = match[1];
    if (!environment) {
      continue;
    }

    const contentStart = beginPattern.lastIndex;
    const endMarker = `\\end{${environment}}`;
    const contentEnd = text.indexOf(endMarker, contentStart);
    if (contentEnd < 0) {
      continue;
    }

    ranges.push({ start: contentStart, end: contentEnd });
    beginPattern.lastIndex = contentEnd + endMarker.length;
  }

  return ranges;
}
