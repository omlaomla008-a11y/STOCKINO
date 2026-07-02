export type TextareaInsertTarget = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

export function applyTextareaEdit(
  current: string,
  target: TextareaInsertTarget,
  replacement: string,
  selectionStart: number,
  selectionEnd: number,
): { value: string; selectionStart: number; selectionEnd: number } {
  const before = current.slice(0, target.selectionStart);
  const after = current.slice(target.selectionEnd);
  return {
    value: before + replacement + after,
    selectionStart,
    selectionEnd,
  };
}

/** Entoure la sélection (ou un libellé par défaut) avec des délimiteurs. */
export function wrapSelection(
  current: string,
  target: TextareaInsertTarget,
  before: string,
  after: string,
  placeholder = "texte",
): { value: string; selectionStart: number; selectionEnd: number } {
  const selected = current.slice(target.selectionStart, target.selectionEnd) || placeholder;
  const replacement = `${before}${selected}${after}`;
  const start = target.selectionStart + before.length;
  const end = start + selected.length;
  return applyTextareaEdit(current, target, replacement, start, end);
}

/** Préfixe chaque ligne sélectionnée (ex. liste à puces). */
export function prefixLines(
  current: string,
  target: TextareaInsertTarget,
  prefix: string,
): { value: string; selectionStart: number; selectionEnd: number } {
  const selected = current.slice(target.selectionStart, target.selectionEnd);
  const block = selected || "élément";
  const lines = block.split("\n").map((line) => `${prefix}${line || "élément"}`);
  const replacement = lines.join("\n");
  const start = target.selectionStart;
  const end = start + replacement.length;
  return applyTextareaEdit(current, target, replacement, start, end);
}

export function insertAtCursor(
  current: string,
  target: TextareaInsertTarget,
  snippet: string,
): { value: string; selectionStart: number; selectionEnd: number } {
  const pos = target.selectionStart;
  return applyTextareaEdit(current, target, snippet, pos + snippet.length, pos + snippet.length);
}
