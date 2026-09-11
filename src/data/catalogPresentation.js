export const catalogPresentationBySlug = Object.freeze({
  'home-appliances': { icon: '🧺', note: 'لوازم خانه و آشپزخانه', examples: ['لباسشویی', 'یخچال', 'اجاق'] },
  'mobile-tablet': { icon: '📱', note: 'موبایل و تبلت', examples: ['صفحه', 'باتری', 'شارژ'] },
  'computer-laptop': { icon: '💻', note: 'کامپیوتر و لپ‌تاپ', examples: ['سخت‌افزار', 'نرم‌افزار'] },
  'game-console': { icon: '🎮', note: 'کنسول بازی', examples: ['دسته', 'تصویر', 'تعمیر برد'] },
  'shoes-bags-clothing': { icon: '👟', note: 'کفش، کیف و پوشاک', examples: ['کفش', 'کیف', 'لباس'] },
  'watch-jewelry': { icon: '⌚', note: 'ساعت و زیورآلات', examples: ['باتری ساعت', 'بند', 'زیورآلات'] },
  automotive: { icon: '🚗', note: 'خودرو و خدمات خودرویی', examples: ['موتور', 'برق خودرو'] },
  'cooling-heating': { icon: '❄️', note: 'سرمایش و گرمایش', examples: ['کولر', 'پکیج'] },
  plumbing: { icon: '🚰', note: 'لوله‌کشی', examples: ['نشتی', 'شیرآلات'] },
  electrical: { icon: '💡', note: 'برق و روشنایی', examples: ['برق‌کاری', 'روشنایی'] },
  furniture: { icon: '🪑', note: 'مبلمان', examples: ['چوب', 'روکش'] },
})

export function presentShop(shop) {
  const category = Array.isArray(shop?.categories) ? shop.categories[0] : null
  const presentation = category ? catalogPresentationBySlug[category.slug] : null
  return {
    ...shop,
    categoryIcon: presentation?.icon ?? '🔧',
    categoryNote: presentation?.note ?? null,
    categoryExamples: presentation?.examples ?? [],
    serviceNames: Array.isArray(shop?.services) ? shop.services.map(service => service.name).filter(Boolean) : [],
    distanceKm: null,
    googleRating: shop?.googleRating ?? null,
    minPriceToman: Number.isSafeInteger(shop?.minPriceToman) && shop.minPriceToman >= 0 ? shop.minPriceToman : null,
  }
}
