import Icon from './Icon.jsx'

const steps = [
  { number: '۰۱', icon: '🔎', title: 'مشکل را بگو', text: 'وسیله یا مشکل را جستجو کن و منطقه تهران را انتخاب کن.' },
  { number: '۰۲', icon: '💬', title: 'گزینه‌ها را مقایسه کن', text: 'امتیاز، فاصله، خدمات و حدود قیمت تعمیرکارها را ببین.' },
  { number: '۰۳', icon: '✅', title: 'بهترین گزینه را انتخاب کن', text: 'با تعمیرکار تماس بگیر و قبل از شروع کار قیمت نهایی را هماهنگ کن.' },
]

export default function HowItWorks() {
  return (
    <section className="section how-section" id="how">
      <div className="container">
        <div className="section-heading centered-heading">
          <span className="section-kicker">ساده و سریع</span>
          <h2>در سه مرحله تعمیرکار پیدا کن</h2>
          <p>اول مقایسه کن، بعد تماس بگیر. انتخاب نهایی همیشه با خودت است.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div className="step-card" key={step.number}>
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {index < steps.length - 1 && <div className="step-connector"><Icon name="arrow" size={18} /></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
