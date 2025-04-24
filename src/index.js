// Монтирование React-приложения
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Основной компонент приложения
function App() {
  return (
    <div className="container">
      <HeroSection />
    </div>
  );
}

// Главная секция
function HeroSection() {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          ЧАРМИ — цифровой инструмент для салонов красоты, который превращает силу сарафанного радио в измеримые результаты
        </h1>
        
        <p className="hero-subtitle">
          Первый инструмент, который делает измеримыми рекомендации клиентов, представляет мастеров через 
          профессиональные портфолио и увеличивает продажи косметики — всё в одном решении без 
          дополнительных интеграций
        </p>
        
        <div className="features-list">
          <Feature text="Внедрение за 1 день без прерывания работы салона" />
          <Feature text="Измеримые показатели эффективности каждого мастера" />
          <Feature text="Увеличение продаж косметики и средств для ухода" />
        </div>
        
        <a href="#" className="cta-button">Запросить демонстрацию</a>
      </div>
      
      <div className="image-container">
        <img 
          src="src/assets/hero-image.png" 
          alt="Косметика салона красоты" 
          className="mockup-image"
        />
        
        <div className="results-card">
          <div className="results-icon">📈</div>
          <div className="results-content">
            <div className="results-title">Доказанные результаты</div>
            <div className="results-subtitle">в более чем 30 салонах-лидерах</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент преимущества
function Feature({ text }) {
  return (
    <div className="feature-item">
      <div className="feature-icon">✓</div>
      <div className="feature-text">{text}</div>
    </div>
  );
}
