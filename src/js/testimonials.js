// Скрипт для работы карусели отзывов
// Немедленно инициализируем карусель, чтобы не зависеть от других скриптов
(function() {
  console.log('Сразу пытаемся инициализировать карусель отзывов');
  
  // Инициализация через последовательные попытки, чтобы гарантировать запуск
  setTimeout(function() {
    console.log('Попытка 1: инициализация карусели');
    tryInitCarousel();
  }, 100);
  
  setTimeout(function() {
    console.log('Попытка 2: инициализация карусели');
    tryInitCarousel();
  }, 500);
  
  setTimeout(function() {
    console.log('Попытка 3: инициализация карусели');
    tryInitCarousel();
  }, 1000);
  
  // Также пробуем при полной загрузке страницы
  window.addEventListener('load', function() {
    console.log('Window load: пытаемся инициализировать карусель');
    tryInitCarousel();
  });
  
  let carouselInitialized = false;
  
  function tryInitCarousel() {
    if (carouselInitialized) {
      console.log('Карусель уже инициализирована, пропускаем');
      return;
    }
    initTestimonialsCarousel();
  }
  
  function initTestimonialsCarousel() {
    try {
    const slider = document.querySelector('.testimonials-slider');
    const prevButton = document.getElementById('prev-testimonial');
    const nextButton = document.getElementById('next-testimonial');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const cards = document.querySelectorAll('.testimonial-card');
    
    if (!slider) {
      console.error('Не удалось найти элемент .testimonials-slider');
      return;
    }
    
    if (!prevButton) {
      console.error('Не удалось найти кнопку с ID prev-testimonial');
      return;
    }
    
    if (!nextButton) {
      console.error('Не удалось найти кнопку с ID next-testimonial');
      return;
    }
    
    if (cards.length === 0) {
      console.error('Не найдены карточки с классом .testimonial-card');
      return;
    }
    
    if (indicators.length === 0) {
      console.warn('Не найдены индикаторы с классом .carousel-indicator');
    }
    
    console.log('Инициализация карусели:', {
      slider: slider,
      sliderWidth: slider.offsetWidth,
      prevButton: prevButton,
      nextButton: nextButton,
      indicators: indicators.length,
      cards: cards.length
    });
    
    // Получаем фактическую ширину карточки включая отступы
    const cardStyles = window.getComputedStyle(cards[0]);
    const marginLeft = parseInt(cardStyles.marginLeft) || 0;
    const marginRight = parseInt(cardStyles.marginRight) || 0;
    const gap = 20; // Примерное значение для gap между элементами
    const cardWidth = cards[0].offsetWidth + marginLeft + marginRight + gap;
    
    console.log('Параметры карточки:', {
      width: cards[0].offsetWidth,
      marginLeft: marginLeft,
      marginRight: marginRight,
      gap: gap,
      totalWidth: cardWidth
    });
    
    let currentIndex = 0;
    
    // Функция перемещения к определенному слайду
    function goToSlide(index) {
      // Получаем все карточки в слайдере
      const cards = slider.querySelectorAll('.testimonial-card');
      
      // Проверяем, что индекс в допустимых пределах с цикличностью
      if (index < 0) index = cards.length - 1; // Если меньше 0, переходим к последнему слайду
      if (index >= cards.length) index = 0; // Если больше или равно количеству карточек, переходим к первому слайду
      
      currentIndex = index;
      
      // Получаем целевую карточку
      const targetCard = cards[index];
      if (!targetCard) {
        console.error('Не удалось найти карточку с индексом', index);
        return;
      }
      
      console.log('Переход к слайду:', {
        index: index,
        targetCard: targetCard,
        targetOffsetLeft: targetCard.offsetLeft,
        cardWidth: cardWidth
      });
      
      // Плавно прокручиваем к нужной карточке
      slider.scrollTo({
        left: targetCard.offsetLeft - (slider.offsetWidth / 2 - cardWidth / 2),
        behavior: 'smooth'
      });
      
      // Обновляем состояние индикаторов
      updateIndicators(index);
    }
    
    // Обновление активного индикатора
    function updateIndicators(index) {
      indicators.forEach((indicator, i) => {
        // Определяем, является ли индикатор активным для текущего индекса карточки
        if (i === index) {
          indicator.classList.add('active');
          indicator.style.opacity = '1';
        } else {
          indicator.classList.remove('active');
          indicator.style.opacity = '0.7';
        }
      });
      
      console.log('Обновлен индикатор:', index);
    }
    
    // Обработчики кликов по кнопкам
    prevButton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Клик по кнопке "Предыдущий"');
      goToSlide(currentIndex - 1);
    });
    
    nextButton.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Клик по кнопке "Следующий"');
      goToSlide(currentIndex + 1);
    });
    
    // Обработчики кликов по индикаторам
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Клик по индикатору:', index);
        goToSlide(index);
      });
    });
    
    // Добавляем обработчик скролла для определения активного слайда
    slider.addEventListener('scroll', debounce(function() {
      // Определяем, какой слайд сейчас в центре видимой области
      const scrollPosition = slider.scrollLeft;
      const viewportCenter = slider.offsetWidth / 2;
      
      // Находим карточку, которая находится в центре видимой области
      const cards = slider.querySelectorAll('.testimonial-card');
      let closestCardIndex = 0;
      let closestDistance = Number.MAX_SAFE_INTEGER;
      
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
        const distance = Math.abs(scrollPosition + viewportCenter - cardCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestCardIndex = index;
        }
      });
      
      if (closestCardIndex !== currentIndex) {
        console.log('Обнаружен скролл до слайда:', closestCardIndex);
        currentIndex = closestCardIndex;
        updateIndicators(currentIndex);
      }
    }, 200));
    
    // Функция debounce для оптимизации вызова обработчика скролла
    function debounce(func, wait) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func.apply(context, args);
        }, wait);
      };
    }
    
    // Автоматическая прокрутка карусели каждые 5 секунд
    let autoScrollInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, 5000);
    
    // Останавливаем автопрокрутку при взаимодействии с каруселью
    slider.addEventListener('mouseenter', () => {
      clearInterval(autoScrollInterval);
      console.log('Автопрокрутка остановлена (mouseenter)');
    });
    
    // Возобновляем автопрокрутку после ухода с карусели
    slider.addEventListener('mouseleave', () => {
      clearInterval(autoScrollInterval); // Очищаем предыдущий интервал на всякий случай
      autoScrollInterval = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 5000);
      console.log('Автопрокрутка возобновлена (mouseleave)');
    });
    
    // Поддержка свайпов для мобильных устройств
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      clearInterval(autoScrollInterval); // Останавливаем автопрокрутку при касании
      console.log('Начало свайпа, координата X:', touchStartX);
    });
    
    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      console.log('Конец свайпа, координата X:', touchEndX);
      handleSwipe();
      
      // Возобновляем автопрокрутку после завершения свайпа
      clearInterval(autoScrollInterval);
      autoScrollInterval = setInterval(() => {
        goToSlide(currentIndex + 1);
      }, 5000);
    });
    
    function handleSwipe() {
      const minSwipeDistance = 50;
      const swipeDistance = Math.abs(touchEndX - touchStartX);
      
      console.log('Обработка свайпа:', {
        startX: touchStartX,
        endX: touchEndX,
        distance: swipeDistance,
        minRequired: minSwipeDistance
      });
      
      if (touchEndX < touchStartX && swipeDistance > minSwipeDistance) {
        // Свайп влево
        console.log('Свайп влево, переход к следующему слайду');
        goToSlide(currentIndex + 1);
      } else if (touchEndX > touchStartX && swipeDistance > minSwipeDistance) {
        // Свайп вправо
        console.log('Свайп вправо, переход к предыдущему слайду');
        goToSlide(currentIndex - 1);
      }
    }
    
    // Инициализация - показываем первый слайд
    console.log('Инициализация карусели завершена, показываем первый слайд');
    goToSlide(0);
    carouselInitialized = true;
    console.log('Карусель успешно инициализирована');
    } catch (error) {
      console.error('Ошибка при инициализации карусели:', error);
    }
  }
})();
});