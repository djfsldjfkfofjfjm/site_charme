/**
 * Калькулятор окупаемости ЧАРМИ
 * Отвечает за интерактивную работу калькулятора и расчеты в нем
 */

// Базовые параметры для расчетов
const IMPLEMENTATION_COST = 30000; // Стоимость внедрения (разовая)
const MONTHLY_COST_PER_MASTER = 333; // Ежемесячная плата за одного мастера
const EFFECT_DISTRIBUTION = {
  // Распределение эффекта по месяцам (% от максимального эффекта)
  // На основе реального опыта внедрения ЧАРМИ
  1: 0.3,  // 30% в первый месяц - быстрое внедрение!
  2: 0.95, // 95% во второй месяц - почти полный эффект
  3: 1.0,  // 100% в третий месяц
  4: 1.0,  // 100% в четвертый месяц
  5: 1.0,  // 100% в пятый месяц
  6: 1.0,  // 100% в шестой и последующие месяцы
};

// Ключевые DOM-элементы
let mastersCountElement;
let clientsCountElement;
let topMasterCheckElement;
let juniorMasterCheckElement;
let mastersRatioSliderElement; // Слайдер распределения мастеров
let salonOccupancySliderElement;
let returningClientsPercentSliderElement;
let repeatClientsSliderElement;
let referralClientsSliderElement;
let conversionSliderElement;
let periodButtonsElements;
let roiValueElement;
let effectValueElement;
let additionalClientsElement;
let resultsTableElement;

// Инициализация калькулятора при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  // Получаем ссылки на все нужные элементы
  mastersCountElement = document.getElementById('masters-count');
  clientsCountElement = document.getElementById('clients-count');
  topMasterCheckElement = document.getElementById('top-master-check');
  juniorMasterCheckElement = document.getElementById('junior-master-check');
  mastersRatioSliderElement = document.getElementById('masters-ratio-slider');
  salonOccupancySliderElement = document.getElementById('salon-occupancy-slider');
  returningClientsPercentSliderElement = document.getElementById('returning-clients-percent-slider');
  repeatClientsSliderElement = document.getElementById('repeat-clients-slider');
  referralClientsSliderElement = document.getElementById('referral-clients-slider');
  conversionSliderElement = document.getElementById('conversion-slider');
  periodButtonsElements = document.querySelectorAll('.period-button');
  roiValueElement = document.querySelector('.metric-card.roi .metric-value');
  effectValueElement = document.querySelector('.metric-card.effect .metric-value');
  additionalClientsElement = document.querySelector('.metric-card.clients .metric-value');
  
  // Обновим подсказку о количестве топ-мастеров
  updateMastersHint();
  
  // Настройка обработчиков событий
  setupCalculatorInteractions();
  
  // Инициализация слайдера соотношения мастеров
  mastersRatioSliderElement.addEventListener('input', function() {
    updateMastersHint();
    updateCalculations();
  });
  
  // Первичный расчет
  updateCalculations();
});

// Настройка интерактивных элементов калькулятора
function setupCalculatorInteractions() {
  // Обработчики для кнопок +/- в числовых полях
  document.querySelectorAll('.increment-button').forEach(button => {
    button.addEventListener('click', function() {
      const input = this.parentNode.querySelector('input');
      input.value = parseInt(input.value) + (input.step ? parseInt(input.step) : 1);
      
      // Если это количество мастеров, обновим подсказку
      if (input.id === 'masters-count') {
        updateMastersHint();
      }
      
      updateCalculations();
    });
  });
  
  document.querySelectorAll('.decrement-button').forEach(button => {
    button.addEventListener('click', function() {
      const input = this.parentNode.querySelector('input');
      const newValue = parseInt(input.value) - (input.step ? parseInt(input.step) : 1);
      if (newValue >= parseInt(input.min)) {
        input.value = newValue;
        
        // Если это количество мастеров, обновим подсказку
        if (input.id === 'masters-count') {
          updateMastersHint();
        }
        
        updateCalculations();
      }
    });
  });
  
  // Обработчики для слайдеров
  document.querySelectorAll('.range-slider').forEach(slider => {
    slider.addEventListener('input', function() {
      // Для слайдеров прироста добавляем плюс
      if (this.id === 'repeat-clients-slider' || 
          this.id === 'referral-clients-slider' || 
          this.id === 'conversion-slider') {
        this.parentNode.querySelector('.slider-value').textContent = `+${this.value}%`;
      } else {
        // Для других слайдеров просто показываем процент
        this.parentNode.querySelector('.slider-value').textContent = `${this.value}%`;
      }
      updateCalculations();
    });
  });
  
  // Обработчики для переключателя прогноза
  document.querySelectorAll('.toggle-button').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.toggle-button').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Если выбран оптимистичный прогноз, установим ТОЛЬКО слайдеры прироста на 2%
      if (this.textContent.includes('Оптимистичный')) {
        // Обновляем только 3 слайдера, связанные с приростом
        [repeatClientsSliderElement, referralClientsSliderElement, conversionSliderElement].forEach(slider => {
          slider.value = 2;
          slider.parentNode.querySelector('.slider-value').textContent = '+2%';
        });
      } else {
        // Если выбран консервативный, вернем ТОЛЬКО слайдеры прироста на 1%
        [repeatClientsSliderElement, referralClientsSliderElement, conversionSliderElement].forEach(slider => {
          slider.value = 1;
          slider.parentNode.querySelector('.slider-value').textContent = '+1%';
        });
      }
      
      updateCalculations();
    });
  });
  
  // Обработчики для кнопок периода
  document.querySelectorAll('.period-button').forEach(button => {
    button.addEventListener('click', function() {
      document.querySelectorAll('.period-button').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      updateCalculations();
    });
  });
  
  // Обработчики для числовых полей
  document.querySelectorAll('.number-field').forEach(input => {
    input.addEventListener('change', function() {
      // Если это количество мастеров, обновим подсказку
      if (this.id === 'masters-count') {
        updateMastersHint();
      }
      
      updateCalculations();
    });
  });
  
  // Обработчики для раскрывающихся секций
  document.querySelectorAll('details.explanation-item').forEach(details => {
    details.addEventListener('toggle', function() {
      if (this.open) {
        // Закрыть все остальные секции при открытии текущей
        document.querySelectorAll('details.explanation-item').forEach(other => {
          if (other !== this) {
            other.open = false;
          }
        });
      }
    });
  });
}

// Основная функция расчета экономического эффекта
function updateCalculations() {
  // Получаем значения всех входных данных
  const mastersCount = parseInt(mastersCountElement.value);
  const ratioValue = parseInt(mastersRatioSliderElement.value) / 100; // Процент топ-мастеров
  const topMastersCount = Math.max(1, Math.round(mastersCount * ratioValue));
  const juniorMastersCount = mastersCount - topMastersCount;
  
  const clientsCount = parseInt(clientsCountElement.value);
  const topMasterCheck = parseInt(topMasterCheckElement.value);
  const juniorMasterCheck = parseInt(juniorMasterCheckElement.value);
  const salonOccupancy = parseInt(salonOccupancySliderElement.value) / 100; // Процент загруженности салона (от 0 до 1)
  const returningClientsPercent = parseInt(returningClientsPercentSliderElement.value) / 100; // Процент постоянных клиентов
  
  const repeatClientPercent = parseInt(repeatClientsSliderElement.value) / 100;
  const referralClientPercent = parseInt(referralClientsSliderElement.value) / 100;
  const conversionPercent = parseInt(conversionSliderElement.value) / 100;
  
  // Определение выбранного периода
  let selectedPeriod = 6; // По умолчанию 6 месяцев
  periodButtonsElements.forEach(button => {
    if (button.classList.contains('active')) {
      const periodText = button.textContent.trim();
      // Более точная проверка, чтобы не путать 1 и 12 месяцев
      if (periodText === '1 месяц') selectedPeriod = 1;
      else if (periodText === '3 месяца') selectedPeriod = 3;
      else if (periodText === '12 месяцев') selectedPeriod = 12;
      else if (periodText === '6 месяцев') selectedPeriod = 6;
      
      console.log('Выбран период:', periodText, 'месяцев:', selectedPeriod);
    }
  });
  
  // Расчет базовых параметров
  const monthlyRevenue = (topMastersCount * topMasterCheck + juniorMastersCount * juniorMasterCheck) * 
                      (clientsCount / mastersCount);
  
  // Расчет дополнительных клиентов и доходов
  let additionalClients = 0;
  let additionalRevenue = 0;
  let repeatClientsRevenue = 0;
  let referralClientsRevenue = 0;
  let masterReferralRevenue = 0;
  let conversionRevenue = 0;
  let redistributionRevenue = 0;
  
  // Сбросим массивы для помесячных эффектов (нужны для графика)
  // Сделаем массив доступным глобально для React-компонента
  window.monthlyEffects = [];
  for (let i = 0; i < 12; i++) {
    window.monthlyEffects[i] = {
      repeat: 0,
      referral: 0,
      masterReferral: 0,
      conversion: 0,
      redistribution: 0,
      total: 0
    };
  }
  
  // Рассчитываем фактор доступности новых слотов (1 - загруженность)
  // При 100% загрузке добавляем минимальный фактор 0.05 (только 5% эффекта)
  const availabilityFactor = Math.max(0.05, 1 - salonOccupancy);
  
  // Рассчитываем коэффициент для удержания существующих клиентов
  // При загруженности ближе к 100%, эффект ЧАРМИ смещается на удержание существующих клиентов
  // Убираем бонус 1.2, используем просто процент загрузки
  const retentionBoostFactor = salonOccupancy;
  
  // Расчет по месяцам
  for (let month = 1; month <= selectedPeriod; month++) {
    const effectMultiplier = EFFECT_DISTRIBUTION[Math.min(month, 6)];
    
    // Эффект от повторных клиентов
    // Повторные клиенты могут появиться только со второго месяца, т.к. клиенты приходят раз в месяц
    let monthRepeatClients = 0;
    let monthRepeatRevenue = 0;
    
    // Учитываем эффект со второго месяца
    if (month > 1) {
      /* 
       * РАЗОВЫЙ ПРИРОСТ ПОВТОРНЫХ КЛИЕНТОВ:
       * 
       * Согласно указаниям о внедрении ЧАРМИ:
       * - Мастера начинают делиться с клиентами в первый месяц с эффектом 30%
       * - Со второго месяца - полноценный эффект
       * - Прирост повторных клиентов - разовый, а не накопительный
       */
      
      // Чем выше процент существующих повторных клиентов,
      // тем сложнее его увеличить - применяем фактор насыщения
      const saturationFactor = Math.max(0.3, 1 - (returningClientsPercent * 0.5));
      
      // Определяем целевое количество дополнительных клиентов
      const targetAdditionalClients = clientsCount * repeatClientPercent * saturationFactor;
      
      // Со второго месяца - полный эффект
      // При выборе 1 месяца калькулятор такого не покажет, т.к. эффект появляется только со 2го месяца
      if (selectedPeriod > 1) {
        // Распределяем клиентов на весь период после первого месяца
        monthRepeatClients = Math.round(targetAdditionalClients / (selectedPeriod - 1));
      } else {
        // Этот случай не должен возникать, но для защиты от ошибок добавим
        monthRepeatClients = 0;
      }
    } else {
      // В первый месяц нет повторных клиентов
      monthRepeatClients = 0;
    }
    
    // Используем обычный средний чек
    monthRepeatRevenue = monthRepeatClients * ((topMasterCheck + juniorMasterCheck) / 2);
    
    // Сохраняем данные по месяцам
    window.monthlyEffects[month-1].repeat = monthRepeatRevenue;
    
    // Прибавляем к общей сумме
    repeatClientsRevenue += monthRepeatRevenue;
    
    // Эффект от рекомендаций клиентов
    // Мастера начинают делиться с клиентами в первый месяц, 
    // эффект 30% в первый месяц, затем нормальный
    const targetReferralClients = clientsCount * referralClientPercent * availabilityFactor;
    let monthReferralClients = 0;
    
    // Применяем распределение эффекта согласно указаниям о внедрении
    if (month === 1) {
      // В первый месяц - 30% эффекта (мастера только начинают делиться с клиентами)
      monthReferralClients = Math.round(targetReferralClients * 0.3);
    } else if (month === 2) {
      // Во второй месяц - полный эффект
      monthReferralClients = Math.round(targetReferralClients);
    } else {
      // В последующие месяцы - поддержание эффекта
      // Но нужно распределить правильно, чтобы сумма не превышала целевое значение
      // Для 6 месяцев: 0.3x в первый, x во второй, остаток разделить на оставшиеся
      
      const allocatedClients = targetReferralClients * 0.3 + targetReferralClients; // Уже распределено в 1й и 2й месяцы
      const remainingClients = targetReferralClients * 0.7 * (selectedPeriod - 2); // Остаток для распределения
      
      if (remainingClients > 0 && selectedPeriod > 2) {
        monthReferralClients = Math.round(remainingClients / (selectedPeriod - 2));
      } else {
        monthReferralClients = Math.round(targetReferralClients * 0.2); // Минимальный эффект
      }
    }
    
    // Базовый доход от рекомендаций (без учета возвратности)
    const initialReferralRevenue = monthReferralClients * ((topMasterCheck + juniorMasterCheck) / 2);
    
    // Эффект от возвратности рекомендованных клиентов
    let returnEffect = 0;
    
    // Учитываем возвратность только со второго месяца, значительно снижаем
    if (month > 1) {
      const newClientReturnRate = returningClientsPercent * 0.5; // Еще сильнее снижаем вероятность для новых клиентов
      returnEffect = newClientReturnRate * 0.1; // Минимальный эффект от возвратности
    }
    
    // Считаем общий доход с учетом возвратности
    const monthReferralRevenue = initialReferralRevenue * (1 + returnEffect);
    
    // Сохраняем данные по месяцам
    window.monthlyEffects[month-1].referral = monthReferralRevenue;
    
    // Прибавляем к общей сумме
    referralClientsRevenue += monthReferralRevenue;
    
    // Эффект от рекомендаций мастеров - ЗНАЧИТЕЛЬНО УСИЛЕН
    // По реальному опыту: за 3 месяца 1 мастер приводит минимум 1 нового клиента
    let monthMasterReferralRevenue = 0;
    
    // Считаем напрямую по мастерам, а не как % от рекомендаций клиентов
    // Средний приток: 1 клиент за 3 месяца на 1 мастера (консервативная оценка)
    // Таргет: за период каждый мастер приводит клиентов согласно этой пропорции
    const avgClientsPerMasterPerMonth = 1/3; // 1 клиент за 3 месяца
    const expectedNewClients = mastersCount * avgClientsPerMasterPerMonth;
    
    if (month === 1) {
      // В первый месяц - максимальный эффект после публикации профилей
      // 50% всех клиентов, которых мастер приведет за период
      monthMasterReferralRevenue = expectedNewClients * 0.5 * ((topMasterCheck + juniorMasterCheck) / 2);
    } else if (month === 2) {
      // Во второй месяц - все еще хороший эффект
      // 30% всех клиентов, которых мастер приведет за период
      monthMasterReferralRevenue = expectedNewClients * 0.3 * ((topMasterCheck + juniorMasterCheck) / 2);
    } else {
      // В последующие месяцы - остаточный эффект
      // Оставшиеся 20% распределяем на остальные месяцы
      const remainingMonths = Math.max(1, selectedPeriod - 2);
      monthMasterReferralRevenue = expectedNewClients * 0.2 / remainingMonths * ((topMasterCheck + juniorMasterCheck) / 2);
    }
    
    // Сохраняем данные по месяцам
    window.monthlyEffects[month-1].masterReferral = monthMasterReferralRevenue;
    
    // Прибавляем к общей сумме
    masterReferralRevenue += monthMasterReferralRevenue;
    
    // Эффект от повышения конверсии
    // Администраторы внедряют отправку портфолио к концу первого месяца
    // В первый месяц - 30% эффекта, затем полный эффект
    
    // Общий целевой доход от повышения конверсии (без коэффициентов внедрения)
    const targetConversionRevenue = monthlyRevenue * conversionPercent * availabilityFactor * 0.8;
    let monthConversionRevenue = 0;
    
    if (month === 1) {
      // В первый месяц - только 30% эффекта (система еще внедряется)
      monthConversionRevenue = targetConversionRevenue * 0.3;
    } else {
      // Начиная со второго месяца - полный эффект
      // Распределяем оставшийся объем на месяцы после первого
      const allocatedRevenue = targetConversionRevenue * 0.3; // Уже выделено в первый месяц
      const remainingRevenue = targetConversionRevenue * (selectedPeriod - 0.3); // Остаток для распределения
      
      if (selectedPeriod > 1) {
        monthConversionRevenue = remainingRevenue / (selectedPeriod - 1);
      } else {
        monthConversionRevenue = targetConversionRevenue;
      }
    }
    
    // Сохраняем данные по месяцам
    window.monthlyEffects[month-1].conversion = monthConversionRevenue;
    
    // Прибавляем к общей сумме
    conversionRevenue += monthConversionRevenue;
    
    // Эффект от перераспределения клиентов от топ к начинающим (ЭКСТРЕМАЛЬНО СНИЖЕН)
    // Этот эффект практически незначителен, так как топ-мастера всегда гораздо более загружены
    let monthRedistributionRevenue = 0;
    if (juniorMastersCount > 0) {
      // Радикально снижаем базовый эффект перераспределения
      const redistributionBaseEffect = 0.005; // Снижено в 20 раз (с 0.1 до 0.005)
      // Чем больше топов, тем меньше возможностей для перераспределения
      const topMasterRatio = topMastersCount / mastersCount;
      // Этот коэффициент дополнительно снижает эффект, если топов много
      const topMasterReducer = Math.max(0.2, 1 - topMasterRatio * 1.5);
      // Считаем общий эффект с минимальным бонусом от загруженности
      const redistributionEffect = (juniorMastersCount / mastersCount) * redistributionBaseEffect * effectMultiplier * topMasterReducer;
      monthRedistributionRevenue = monthlyRevenue * redistributionEffect;
      
      // Прибавляем к общей сумме
      redistributionRevenue += monthRedistributionRevenue;
    }
    
    // Сохраняем данные по месяцам
    window.monthlyEffects[month-1].redistribution = monthRedistributionRevenue;
    window.monthlyEffects[month-1].total = monthRepeatRevenue + monthReferralRevenue + 
                                   monthMasterReferralRevenue + monthConversionRevenue + 
                                   monthRedistributionRevenue;
    
    // Суммарный месячный эффект (с учетом ограничений по загруженности)
    // При полной загрузке новые клиенты ограничены только заместителями отвалившихся
    // Учитываем и клиентов от конверсии (примерно 30% от эффекта конверсии)
    const conversionClients = Math.round((monthConversionRevenue / ((topMasterCheck + juniorMasterCheck) / 2)) * 0.3);
    additionalClients += monthRepeatClients + monthReferralClients + conversionClients;
  }
  
  // Общий дополнительный доход
  additionalRevenue = repeatClientsRevenue + referralClientsRevenue + masterReferralRevenue + 
                      conversionRevenue + redistributionRevenue;
  
  // Расчет затрат
  const implementationCost = IMPLEMENTATION_COST;
  const monthlyCost = mastersCount * MONTHLY_COST_PER_MASTER;
  const totalCost = implementationCost + (monthlyCost * selectedPeriod);
  
  // Общий экономический эффект не должен иметь дополнительных множителей
  // для длительных периодов, так как мы уже учли все помесячные эффекты
  const baseMultiplier = 1.0;
  
  // Применяем базовый мультипликатор к доходам
  const adjustedAdditionalRevenue = additionalRevenue * baseMultiplier;
  
  // Экономический эффект
  const economicEffect = adjustedAdditionalRevenue - totalCost;
  
  // ROI
  const roi = Math.round((economicEffect / totalCost) * 100);
  
  // Обновление интерфейса
  roiValueElement.textContent = `${roi}%`;
  effectValueElement.textContent = `${Math.round(economicEffect).toLocaleString('ru-RU')} ₽`;
  additionalClientsElement.textContent = Math.round(additionalClients);
  
  // Обновление таблицы результатов
  updateResultsTable({
    additionalRevenue: Math.round(adjustedAdditionalRevenue), // Используем скорректированное значение
    implementationCost,
    monthlyCost: Math.round(monthlyCost * selectedPeriod),
    repeatClientsRevenue: Math.round(repeatClientsRevenue * baseMultiplier),
    referralClientsRevenue: Math.round(referralClientsRevenue * baseMultiplier),
    masterReferralRevenue: Math.round(masterReferralRevenue * baseMultiplier),
    conversionRevenue: Math.round(conversionRevenue * baseMultiplier),
    redistributionRevenue: Math.round(redistributionRevenue * baseMultiplier),
    totalCost: Math.round(totalCost),
    economicEffect: Math.round(economicEffect),
    roi,
    period: selectedPeriod,
    baseMultiplier // Передаем для информации
  });
  
  // Оповещаем о том, что данные расчетов обновились (для обновления графика)
  window.dispatchEvent(new CustomEvent('calculationUpdated'));
}

// Обновление таблицы результатов
function updateResultsTable(results) {
  // Находим таблицу
  const table = document.querySelector('.results-table');
  if (!table) return;
  
  // Находим заголовок таблицы и обновляем период
  const tableTitle = document.querySelector('.results-table-container h4');
  if (tableTitle) {
    tableTitle.textContent = `Итоговые результаты за ${results.period} ${getPeriodText(results.period)}`;
  }
  
  // Сначала обновим строки с периодом, так как текст меняется
  // Для этого найдем ячейки, содержащие слово "месяц" и обновим их полностью
  const rows = table.querySelectorAll('tr');
  for (const row of rows) {
    const cells = row.querySelectorAll('td');
    if (cells.length > 0) {
      // Если строка содержит "месяц", обновляем текст с новым периодом
      const firstCellText = cells[0].textContent;
      if (firstCellText.includes('месяц') || firstCellText.includes('месяца') || firstCellText.includes('месяцев')) {
        if (firstCellText.includes('Ежемесячная плата')) {
          cells[0].textContent = `Ежемесячная плата (${results.period} ${getPeriodText(results.period)})`;
          if (cells.length > 1) {
            cells[1].textContent = `${results.monthlyCost.toLocaleString('ru-RU')} ₽`;
          }
        } else if (firstCellText.includes('Абонентская плата')) {
          cells[0].textContent = `Абонентская плата за мастеров (${results.period} ${getPeriodText(results.period)})`;
          if (cells.length > 1) {
            cells[1].textContent = `${results.monthlyCost.toLocaleString('ru-RU')} ₽`;
          }
        } else if (firstCellText.includes('Общие затраты')) {
          cells[0].textContent = `Общие затраты за ${results.period} ${getPeriodText(results.period)}`;
          if (cells.length > 1) {
            cells[1].textContent = `${results.totalCost.toLocaleString('ru-RU')} ₽`;
          }
        }
      }
    }
  }
  
  // Обновляем остальные значения в таблице
  updateTableRow(table, 'Дополнительный доход', `${results.additionalRevenue.toLocaleString('ru-RU')} ₽`);
  updateTableRow(table, 'Затраты на внедрение', `${results.implementationCost.toLocaleString('ru-RU')} ₽`);
  updateTableRow(table, '— От повторных клиентов', `${results.repeatClientsRevenue.toLocaleString('ru-RU')} ₽`);
  updateTableRow(table, '— От рекомендаций клиентов', `${results.referralClientsRevenue.toLocaleString('ru-RU')} ₽`);
  updateTableRow(table, '— От рекомендаций мастеров', `${results.masterReferralRevenue.toLocaleString('ru-RU')} ₽`);
  updateTableRow(table, '— От повышения конверсии', `${results.conversionRevenue.toLocaleString('ru-RU')} ₽`);
  updateTableRow(table, '— От перераспределения клиентов', `${results.redistributionRevenue.toLocaleString('ru-RU')} ₽`);
  updateTableRow(table, 'Экономический эффект (доход минус затраты)', `${results.economicEffect.toLocaleString('ru-RU')} ₽`);
  updateTableRow(table, 'ROI (возврат на инвестиции)', `${results.roi}%`);
}

// Вспомогательная функция для обновления строки в таблице
function updateTableRow(table, rowTitle, newValue) {
  const rows = table.querySelectorAll('tr');
  for (const row of rows) {
    const cells = row.querySelectorAll('td');
    if (cells.length > 0 && cells[0].textContent.trim() === rowTitle) {
      if (cells.length > 1) {
        cells[1].textContent = newValue;
      }
      break;
    }
  }
}

// Функция склонения периодов
function getPeriodText(period) {
  if (period === 1) return 'месяц';
  if (period >= 2 && period <= 4) return 'месяца';
  return 'месяцев';
}

// Функция обновления данных по количеству мастеров
function updateMastersHint() {
  const mastersCount = parseInt(mastersCountElement.value);
  const ratioValue = parseInt(mastersRatioSliderElement.value) / 100; // Процент топ-мастеров
  
  // Рассчитываем количество топовых и начинающих мастеров на основе слайдера соотношения
  const topMastersCount = Math.max(1, Math.round(mastersCount * ratioValue));
  const juniorMastersCount = mastersCount - topMastersCount;
  
  // Обновляем счетчики в интерфейсе
  const topMastersElement = document.getElementById('top-masters-count');
  const juniorMastersElement = document.getElementById('junior-masters-count');
  const ratioValueElement = document.getElementById('masters-ratio-value');
  
  if (topMastersElement) {
    topMastersElement.textContent = topMastersCount;
  }
  
  if (juniorMastersElement) {
    juniorMastersElement.textContent = juniorMastersCount;
  }
  
  if (ratioValueElement) {
    ratioValueElement.textContent = `${Math.round(ratioValue * 100)}%`;
  }
  
  // Обновляем визуальное отображение соотношения в слайдере
  const ratio = ratioValue * 100;
  mastersRatioSliderElement.style.background = 
    `linear-gradient(to right, #6C5CE7 0%, #6C5CE7 ${ratio}%, #10b981 ${ratio}%, #10b981 100%)`;
}