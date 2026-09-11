const messages = Object.freeze({
  NETWORK_ERROR: 'ارتباط با سرور برقرار نشد.',
  TIMEOUT: 'زمان پاسخ‌گویی سرور تمام شد.',
  MALFORMED_RESPONSE: 'پاسخ سرور معتبر نیست.',
  SHOP_NOT_FOUND: 'این تعمیرگاه پیدا نشد.',
  REVIEW_NOT_FOUND: 'این نظر پیدا نشد.',
  RESERVATION_NOT_FOUND: 'این درخواست رزرو پیدا نشد.',
  RATE_LIMITED: 'درخواست‌های زیادی ارسال شده است. کمی بعد دوباره تلاش کنید.',
  AUTH_INVALID: 'نام کاربری یا رمز عبور نادرست است.',
  AUTH_REQUIRED: 'نشست مدیریت پایان یافته است. دوباره وارد شوید.',
  UNAUTHENTICATED: 'نشست مدیریت پایان یافته است. دوباره وارد شوید.',
  INVALID_STATUS_TRANSITION: 'این تغییر وضعیت مجاز نیست. اطلاعات را دوباره دریافت کنید.',
  REVIEW_STATUS_CONFLICT: 'وضعیت این نظر قبلاً تغییر کرده است. اطلاعات را دوباره دریافت کنید.',
  PAYLOAD_TOO_LARGE: 'اطلاعات ارسالی بیش از اندازه مجاز است.',
  INVALID_JSON: 'اطلاعات ارسالی معتبر نیست.',
  NOT_READY: 'سرویس موقتاً آماده نیست. کمی بعد دوباره تلاش کنید.',
})

export function persianErrorMessage(error, fallback = 'عملیات انجام نشد. لطفاً دوباره تلاش کنید.') {
  return messages[error?.code] || fallback
}

export function persianFieldErrors(error) {
  if (error?.code !== 'VALIDATION_ERROR' || !isPlainObject(error.fields)) return {}
  return Object.fromEntries(Object.entries(error.fields).filter(([, message]) => typeof message === 'string'))
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
}
