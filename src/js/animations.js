/**
 * Скрипт для анимаций
 */

// Простые анимации появления для всех секций
function animateSection(sectionQuery, itemsQuery, delay = 150) {
  const section = document.querySelector(sectionQuery);
  if (!section) return;
  
  const items = section.querySelectorAll(itemsQuery);
  if (!items.length) return;
  
  const rect = section.getBoundingClientRect();
  
  // Проверяем, видима ли секция
  if (rect.top < window.innerHeight) {
    // Анимируем элементы с указанной задержкой
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('animate');
      }, index * delay);
    });
  }
}

// Функция для обработки анимаций при прокрутке
function handleScroll() {
  // Анимация отзывов
  animateSection('.testimonials-section', '.testimonial-cloud', 80);
  
  // Анимация проблем
  animateSection('.problems-section', '.problem-container');
  
  // Анимация преимуществ
  animateSection('.benefits-section', '.benefit-card', 150);
  
  // Анимация таймлайна
  animateSection('.how-it-works', '.timeline-step', 300);
  
  // Анимация карточек с ценами
  animateSection('.pricing-section', '.pricing-card', 200);
  
  // Принудительно делаем видимой фиолетовую карточку
  const purpleCard = document.querySelector('.purple-card');
  if (purpleCard) {
    purpleCard.style.opacity = '1';
    purpleCard.style.visibility = 'visible';
    purpleCard.style.display = 'flex';
  }
}

// Функция для наблюдения за появлением элементов
function setupIntersectionObserver() {
  // Создаем наблюдатель
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Если элемент становится видимым
      if (entry.isIntersecting) {
        // Принудительно отображаем все элементы таймлайна по всему документу
        if (document.querySelector('.how-it-works') || document.getElementById('timeline-section')) {
          forceVisibleTimeline();
        }
        
        // Запускаем анимацию для конкретной секции
        const sectionClass = entry.target.classList[0];
        
        if (sectionClass === 'testimonials-section') {
          // Получаем все облака отзывов
          const clouds = entry.target.querySelectorAll('.testimonial-cloud');
          
          // Распределяем задержку в зависимости от их положения в колонках
          // Сначала анимируем первые элементы в каждой колонке, затем вторые и т.д.
          for (let i = 0; i < Math.ceil(clouds.length / 3); i++) {
            for (let j = 0; j < 3; j++) {
              const index = i * 3 + j;
              if (index < clouds.length) {
                setTimeout(() => {
                  clouds[index].classList.add('animate');
                }, 100 + i * 120); // Более плавная задержка между строками
              }
            }
          }
        }
        else if (sectionClass === 'problems-section') {
          const containers = entry.target.querySelectorAll('.problem-container');
          containers.forEach((container, index) => {
            setTimeout(() => {
              container.classList.add('animate');
            }, index * 150);
          });
        }
        else if (sectionClass === 'how-it-works' || entry.target.id === 'timeline-section') {
          // Немедленно активировать все элементы таймлайна
          forceVisibleTimeline();
        }
        else if (sectionClass === 'benefits-section') {
          const cards = entry.target.querySelectorAll('.benefit-card');
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('animate');
            }, index * 150);
          });
        }
        else if (sectionClass === 'pricing-section' || entry.target.id === 'pricing-section') {
          // Применяем стили для карточек с ценами
          const cards = document.querySelectorAll('.pricing-card');
          cards.forEach((card) => {
            card.style.opacity = '1';
            card.style.visibility = 'visible';
            card.style.display = 'flex';
            card.style.position = 'static';
            card.style.zIndex = '5';
            
            // Обрабатываем все элементы внутри карточки
            card.querySelectorAll('*').forEach(el => {
              el.style.opacity = '1';
              el.style.visibility = 'visible';
              el.style.zIndex = '5';
            });
          });
          
          // Особый фокус на фиолетовую карточку
          const purpleCard = document.querySelector('.purple-card');
          if (purpleCard) {
            purpleCard.style.opacity = '1';
            purpleCard.style.visibility = 'visible';
            purpleCard.style.display = 'flex';
            purpleCard.style.flexDirection = 'column';
            purpleCard.style.position = 'static';
            purpleCard.style.zIndex = '5';
            
            // Принудительно показываем все элементы внутри фиолетовой карточки
            purpleCard.querySelectorAll('*').forEach(el => {
              el.style.opacity = '1';
              el.style.visibility = 'visible';
              el.style.zIndex = '5';
              
              if (el.classList.contains('pricing-card-title') || 
                  el.classList.contains('pricing-card-subtitle') ||
                  el.classList.contains('price') ||
                  el.classList.contains('period')) {
                el.style.display = 'block';
              } else if (el.classList.contains('features-list')) {
                el.style.display = 'block';
              } else if (el.tagName === 'LI' || el.classList.contains('check-icon')) {
                el.style.display = 'flex';
              } else if (el.classList.contains('price-button')) {
                el.style.display = 'block';
              } else if (el.classList.contains('price-block')) {
                el.style.display = 'flex';
              }
            });
          }
        }
        
        // Прекращаем наблюдение после анимации
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1 // Срабатывает, когда 10% секции в поле зрения
  });
  
  // Глобальная функция для принудительного отображения всех элементов таймлайна
  function forceVisibleTimeline() {
    // Находим таймлайн в любом месте документа
    const timelineContainer = document.querySelector('.how-it-works') || document.getElementById('timeline-section');
    if (!timelineContainer) return;
    
    function forceVisible(items) {
      if (!items) return;
      Array.from(items).forEach(item => {
        item.style.opacity = '1';
        item.style.visibility = 'visible';
        item.style.display = item.tagName === 'LI' ? 'flex' : (item.tagName === 'UL' ? 'block' : (item.classList.contains('timeline-item') ? 'flex' : item.style.display || 'block'));
        item.style.height = 'auto';
        item.style.overflow = 'visible';
        
        // Проверить также вложенные элементы
        item.querySelectorAll('*').forEach(child => {
          child.style.opacity = '1';
          child.style.visibility = 'visible';
          child.style.overflow = 'visible';
          if (child.tagName === 'LI') {
            child.style.display = 'flex';
          } else if (child.tagName === 'UL') {
            child.style.display = 'block';
          }
        });
      });
    }
    
    // Принудительно отобразить все элементы таймлайна
    forceVisible(document.querySelectorAll('.timeline-item'));
    forceVisible(document.querySelectorAll('.timeline-content'));
    forceVisible(document.querySelectorAll('.step-list'));
    forceVisible(document.querySelectorAll('.step-list li'));
    forceVisible(document.querySelectorAll('.feature-card'));
    
    // Особое внимание к третьему разделу таймлайна
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length >= 3) {
      const thirdItem = timelineItems[2]; // Третий элемент (индекс 2)
      thirdItem.style.opacity = '1';
      thirdItem.style.visibility = 'visible';
      thirdItem.style.display = 'flex';
      thirdItem.style.position = 'static';
      thirdItem.style.zIndex = '5';
      
      const content = thirdItem.querySelector('.timeline-content');
      if (content) {
        content.style.opacity = '1';
        content.style.visibility = 'visible';
        content.style.height = 'auto';
        content.style.overflow = 'visible';
        content.style.position = 'static';
        content.style.zIndex = '5';
        
        const list = content.querySelector('.step-list');
        if (list) {
          list.style.opacity = '1';
          list.style.visibility = 'visible';
          list.style.display = 'block';
          list.style.height = 'auto';
          list.style.overflow = 'visible';
          list.style.position = 'static';
          list.style.zIndex = '5';
          
          const items = list.querySelectorAll('li');
          items.forEach(item => {
            item.style.opacity = '1';
            item.style.visibility = 'visible';
            item.style.display = 'flex';
            item.style.height = 'auto';
            item.style.overflow = 'visible';
            item.style.position = 'static';
            item.style.zIndex = '5';
          });
        }
        
        const card = content.querySelector('.feature-card');
        if (card) {
          card.style.opacity = '1';
          card.style.visibility = 'visible';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.position = 'static';
          card.style.zIndex = '5';
          
          // Специально обработаем текст карточки
          const cardTitle = card.querySelector('.card-title');
          if (cardTitle) {
            cardTitle.style.opacity = '1';
            cardTitle.style.visibility = 'visible';
            cardTitle.style.display = 'block';
            cardTitle.style.position = 'static';
            cardTitle.style.zIndex = '5';
            cardTitle.style.color = 'black';
            cardTitle.style.fontSize = '22px';
            cardTitle.style.marginBottom = '10px';
          }
          
          const cardDesc = card.querySelector('.card-description');
          if (cardDesc) {
            cardDesc.style.opacity = '1';
            cardDesc.style.visibility = 'visible';
            cardDesc.style.display = 'block';
            cardDesc.style.position = 'static';
            cardDesc.style.zIndex = '5';
            cardDesc.style.color = '#333';
            cardDesc.style.fontSize = '16px';
            cardDesc.style.lineHeight = '1.4';
          }
        }
      }
    }
  }
  
  // Наблюдаем за секциями
  const sections = document.querySelectorAll('.testimonials-section, .problems-section, .how-it-works, .benefits-section, #timeline-section, .pricing-section, #pricing-section');
  sections.forEach(section => observer.observe(section));
  
  // Принудительно делаем видимой фиолетовую карточку в блоке с ценами
  setTimeout(function() {
    const purpleCard = document.querySelector('.purple-card');
    if (purpleCard) {
      purpleCard.style.opacity = '1';
      purpleCard.style.visibility = 'visible';
      purpleCard.style.display = 'flex';
      purpleCard.style.flexDirection = 'column';
      purpleCard.style.position = 'static';
      purpleCard.style.zIndex = '5';
      
      const elements = purpleCard.querySelectorAll('*');
      elements.forEach(el => {
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.style.zIndex = '5';
        
        if (el.classList.contains('pricing-card-title') || 
            el.classList.contains('pricing-card-subtitle') ||
            el.classList.contains('price') ||
            el.classList.contains('period')) {
          el.style.display = 'block';
        } else if (el.classList.contains('features-list')) {
          el.style.display = 'block';
        } else if (el.tagName === 'LI' || el.classList.contains('check-icon')) {
          el.style.display = 'flex';
        } else if (el.classList.contains('price-button')) {
          el.style.display = 'block';
        } else if (el.classList.contains('price-block')) {
          el.style.display = 'flex';
        }
      });
    }
  }, 1000);
  
  // Принудительно вызываем функцию для таймлайна при загрузке
  setTimeout(forceVisibleTimeline, 500);
}

// Функция для инициализации анимаций
function initAnimations() {
  console.log('Инициализация анимаций...');
  
  // Проверяем поддержку IntersectionObserver
  if ('IntersectionObserver' in window) {
    setupIntersectionObserver();
  } else {
    // Запасной вариант для старых браузеров
    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 500);
  }
}

// Функция для инициализации после загрузки компонентов
function initWhenComponentsLoaded() {
  // Проверяем, загружены ли компоненты
  const testimonials = document.querySelector('.testimonials-section');
  const problems = document.querySelector('.problems-section');
  const timeline = document.querySelector('.how-it-works');
  const benefits = document.querySelector('.benefits-section');
  
  if (testimonials || problems || timeline || benefits) {
    console.log('Компоненты загружены, запуск анимаций');
    initAnimations();
  } else {
    // Если компоненты еще не загружены, ждем и проверяем снова
    console.log('Ожидание загрузки компонентов...');
    setTimeout(initWhenComponentsLoaded, 300);
  }
}

// Обработка клика по выпадающему меню на мобильных устройствах
function setupDropdownMenu() {
  const dropdowns = document.querySelectorAll('.has-dropdown > a');
  
  dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', function(e) {
      // Только для мобильных устройств (ширина экрана < 768px)
      if (window.innerWidth < 768) {
        e.preventDefault();
        const dropdownMenu = this.nextElementSibling;
        
        // Переключаем видимость меню
        if (dropdownMenu.style.display === 'block') {
          dropdownMenu.style.display = 'none';
        } else {
          // Закрываем все другие открытые меню
          document.querySelectorAll('.dropdown-menu').forEach(menu => {
            if (menu !== dropdownMenu) {
              menu.style.display = 'none';
            }
          });
          
          dropdownMenu.style.display = 'block';
        }
      }
    });
  });
  
  // Закрытие выпадающего меню при клике вне его
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (window.innerWidth < 768) {
          menu.style.display = 'none';
        }
      });
    }
  });
}

// Запускаем после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM загружен, ожидание компонентов...');
  setTimeout(initWhenComponentsLoaded, 500);
  
  // Инициализируем выпадающее меню
  setupDropdownMenu();
});