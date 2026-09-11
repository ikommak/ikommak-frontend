export function normalizePersian(value) {
  if (value === null || value === undefined) return ''
  return String(value)
    .normalize('NFKC')
    .replace(/[يى]/gu, 'ی')
    .replace(/ك/gu, 'ک')
    .replace(/[\u200c\u200d\ufeff]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
}

export const formatPersianNumber = value => new Intl.NumberFormat('fa-IR').format(value)
