document.addEventListener('DOMContentLoaded', function() {
    // Конфигурация Telegram бота
    const BOT_TOKEN = '6731114231:AAGzev_SCeljR5txCCCJPxYRJC4XFgk71_8';
    const CHAT_ID = '791374398';
    
    // Функция для отправки данных в Telegram
    async function sendToTelegram(message) {
      try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
          })
        });
        
        return await response.json();
      } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
        return { ok: false };
      }
    }
  
    // Обработчик для всех форм
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Проверка согласия на обработку данных
        const agreement = form.querySelector('input[name="agreement"]');
        if (agreement && !agreement.checked) {
          showError(form, 'Пожалуйста, подтвердите согласие на обработку данных');
          return;
        }
        
        // Определяем тип формы для сообщения
        let formType = '';
        if (form.id === 'calculator-form') {
          formType = '📊 <b>Форма калькулятора (Зеленая)</b>';
          updateResults(); // Обновляем результаты перед отправкой
        } 
        else if (form.id === 'callback-form') formType = '📞 <b>Форма обратного звонка (Оранжевая)</b>';
        else if (form.id === 'support-form') formType = '🛠 <b>Форма поддержки</b>';
        else formType = '📝 <b>Общая форма</b>';
        
        // Собираем данные формы
        const formData = new FormData(form);
        let message = `${formType}\n\n`;
        
        // Обработка данных калькулятора
        if (form.id === 'calculator-form') {
          const buildingType = form.querySelector('input[name="building-type"]:checked').value;
          const length = form.querySelector('input[name="length"]').value;
          const width = form.querySelector('input[name="width"]').value;
          const height = form.querySelector('input[name="height"]').value;
          
          message += `<b>🏢 Тип здания:</b> ${
            buildingType === 'industrial' ? 'Промышленный ангар' :
            buildingType === 'agricultural' ? 'Сельскохозяйственный ангар' :
            'Коммерческое здание'
          }\n`;
          
          message += `<b>📏 Размеры:</b> ${length} × ${width} × ${height} м\n`;
          message += `<b>📐 Площадь:</b> ${length * width} м²\n`;
          
          // Дополнительные опции
          const options = [];
          form.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            switch(checkbox.name) {
              case 'insulation': options.push('Утепление'); break;
              case 'ventilation': options.push('Вентиляция'); break;
              case 'electricity': options.push('Электрика'); break;
              case 'heating': options.push('Отопление'); break;
              case 'plumbing': options.push('Водоснабжение и канализация'); break;
              case 'fire-protection': options.push('Пожарная сигнализация'); break;
            }
          });
          
          message += `<b>⚙️ Дополнительные опции:</b> ${
            options.length > 0 ? options.join(', ') : 'Нет выбранных опций'
          }\n\n`;
        }
        
        // Добавляем стандартные поля формы
        for (let [name, value] of formData.entries()) {
          if (name !== 'agreement' && !(form.id === 'calculator-form' && 
              ['building-type', 'length', 'width', 'height', 'insulation', 
               'ventilation', 'electricity', 'heating', 'plumbing', 'fire-protection'].includes(name))) {
            const fieldName = {
              'name': '👤 Имя',
              'phone': '📱 Телефон',
              'email': '📧 Email',
              'message': '✉️ Сообщение',
              'time': '⏰ Удобное время звонка'
            }[name] || name;
            
            message += `<b>${fieldName}:</b> ${value}\n`;
          }
        }
        
        // Отправляем в Telegram
        const result = await sendToTelegram(message);
        
        if (result.ok) {
          showSuccess(form);
          form.reset();
          
          // Сброс калькулятора к первому шагу
          if (form.id === 'calculator-form') {
            resetCalculator();
          }
        } else {
          showError(form, 'Ошибка при отправке формы. Пожалуйста, попробуйте позже.');
        }
      });
    });
    
    // Функция сброса калькулятора
    function resetCalculator() {
      const steps = document.querySelectorAll('.step');
      const stepIndicators = document.querySelectorAll('.step-indicator');
      const stepConnectors = document.querySelectorAll('.step-connector');
      
      // Скрываем все шаги кроме первого
      steps.forEach((step, index) => {
        step.classList.toggle('active', index === 0);
      });
      
      // Сбрасываем индикаторы шагов
      stepIndicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === 0);
      });
      
      stepConnectors.forEach(connector => {
        connector.classList.remove('active');
      });
    }
    
    // Показать сообщение об успехе
    function showSuccess(form) {
      let successElement = form.querySelector('.success-message') || 
                          document.getElementById(`${form.id}-success`);
      
      if (!successElement) {
        successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = 'Спасибо! Ваша заявка отправлена.';
        form.appendChild(successElement);
      }
      
      successElement.style.display = 'block';
      setTimeout(() => {
        successElement.style.display = 'none';
      }, 3000);
    }
    
    // Показать сообщение об ошибке
    function showError(form, message) {
      let errorElement = form.querySelector('.error-message') || 
                        document.getElementById(`${form.id}-error`);
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        form.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
      errorElement.style.display = 'block';
      
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 3000);
    }
  
    // Калькулятор - обработка шагов
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {
      const steps = document.querySelectorAll('.step');
      const nextButtons = document.querySelectorAll('.next-step');
      const prevButtons = document.querySelectorAll('.prev-step');
      const stepIndicators = document.querySelectorAll('.step-indicator');
      const stepConnectors = document.querySelectorAll('.step-connector');
      let currentStep = 0;
      
      // Расчет площади здания
      const lengthInput = calculatorForm.querySelector('input[name="length"]');
      const widthInput = calculatorForm.querySelector('input[name="width"]');
      const buildingAreaElement = document.getElementById('building-area');
      
      function updateBuildingArea() {
        const length = parseFloat(lengthInput.value) || 0;
        const width = parseFloat(widthInput.value) || 0;
        buildingAreaElement.textContent = (length * width).toFixed(0);
      }
      
      lengthInput.addEventListener('input', updateBuildingArea);
      widthInput.addEventListener('input', updateBuildingArea);
      
      // Переключение шагов
      nextButtons.forEach(button => {
        button.addEventListener('click', function() {
          if (validateStep(currentStep)) {
            steps[currentStep].classList.remove('active');
            currentStep++;
            steps[currentStep].classList.add('active');
            
            // Обновление индикаторов
            updateStepIndicators();
            
            // Обновление результатов на последнем шаге
            if (currentStep === 3) {
              updateResults();
            }
          }
        });
      });
      
      prevButtons.forEach(button => {
        button.addEventListener('click', function() {
          steps[currentStep].classList.remove('active');
          currentStep--;
          steps[currentStep].classList.add('active');
          updateStepIndicators();
        });
      });
      
      // Валидация шагов
      function validateStep(step) {
        if (step === 1) { // Шаг с размерами
          const length = parseFloat(lengthInput.value);
          const width = parseFloat(widthInput.value);
          const height = parseFloat(calculatorForm.querySelector('input[name="height"]').value);
          
          if (isNaN(length) || length < 6 || length > 100) {
            showError(calculatorForm, 'Пожалуйста, введите корректную длину (6-100 м)');
            return false;
          }
          if (isNaN(width) || width < 6 || width > 50) {
            showError(calculatorForm, 'Пожалуйста, введите корректную ширину (6-50 м)');
            return false;
          }
          if (isNaN(height) || height < 3 || height > 12) {
            showError(calculatorForm, 'Пожалуйста, введите корректную высоту (3-12 м)');
            return false;
          }
        }
        return true;
      }
      
      // Обновление индикаторов шагов
      function updateStepIndicators() {
        stepIndicators.forEach((indicator, index) => {
          indicator.classList.toggle('active', index <= currentStep);
        });
        
        stepConnectors.forEach((connector, index) => {
          connector.classList.toggle('active', index < currentStep);
        });
      }
      
      // Обновление результатов расчета
      function updateResults() {
        const buildingType = calculatorForm.querySelector('input[name="building-type"]:checked').value;
        const length = parseFloat(lengthInput.value);
        const width = parseFloat(widthInput.value);
        const height = parseFloat(calculatorForm.querySelector('input[name="height"]').value);
        const area = length * width;
        
        // Тип здания
        let buildingTypeText = '';
        switch (buildingType) {
          case 'industrial': buildingTypeText = 'Промышленный ангар'; break;
          case 'agricultural': buildingTypeText = 'Сельскохозяйственный ангар'; break;
          case 'commercial': buildingTypeText = 'Коммерческое здание'; break;
        }
        
        document.getElementById('result-type').textContent = buildingTypeText;
        document.getElementById('result-dimensions').textContent = `${length} × ${width} × ${height} м`;
        document.getElementById('result-area').textContent = `${area} м²`;
        
        // Дополнительные опции
        const options = [];
        const checkboxes = calculatorForm.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
          switch (checkbox.name) {
            case 'insulation': options.push('Утепление'); break;
            case 'ventilation': options.push('Вентиляция'); break;
            case 'electricity': options.push('Электрика'); break;
            case 'heating': options.push('Отопление'); break;
            case 'plumbing': options.push('Водоснабжение и канализация'); break;
            case 'fire-protection': options.push('Пожарная сигнализация'); break;
          }
        });
        
        const optionsList = document.getElementById('result-options');
        optionsList.innerHTML = '';
        if (options.length > 0) {
          options.forEach(option => {
            const li = document.createElement('li');
            li.className = 'mb-1';
            li.textContent = option;
            optionsList.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.className = 'mb-1';
          li.textContent = 'Нет выбранных опций';
          optionsList.appendChild(li);
        }
        
        // Расчет стоимости
        let basePrice = 20000; // Цена за м²
        switch (buildingType) {
          case 'industrial': basePrice = 20000; break;
          case 'agricultural': basePrice = 18000; break;
          case 'commercial': basePrice = 25000; break;
        }
        
        let totalPrice = area * basePrice;
        checkboxes.forEach(() => {
          totalPrice += area * 1000; // Доплата за каждую опцию
        });
        
        document.getElementById('result-price').textContent = 
          new Intl.NumberFormat('ru-RU').format(totalPrice) + ' ₽';
      }
      
      // Инициализация калькулятора
      updateBuildingArea();
    }
    
    // Остальной код (меню, плавная прокрутка и т.д.) остается без изменений
  });


  document.addEventListener('DOMContentLoaded', function() {
    // Инициализация калькулятора
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {
      const steps = document.querySelectorAll('#calculator-form .step');
      const nextButtons = document.querySelectorAll('#calculator-form .next-step');
      const prevButtons = document.querySelectorAll('#calculator-form .prev-step');
      const stepIndicators = document.querySelectorAll('.step-indicator');
      const stepConnectors = document.querySelectorAll('.step-connector');
      let currentStep = 0;
  
      // Инициализация - показываем только первый шаг
      steps.forEach((step, index) => {
        step.classList.toggle('active', index === 0);
      });
  
      // Расчет площади здания
      const lengthInput = calculatorForm.querySelector('input[name="length"]');
      const widthInput = calculatorForm.querySelector('input[name="width"]');
      const buildingAreaElement = document.getElementById('building-area');
  
      function updateBuildingArea() {
        const length = parseFloat(lengthInput.value) || 0;
        const width = parseFloat(widthInput.value) || 0;
        buildingAreaElement.textContent = (length * width).toFixed(0);
      }
  
      if (lengthInput && widthInput) {
        lengthInput.addEventListener('input', updateBuildingArea);
        widthInput.addEventListener('input', updateBuildingArea);
        updateBuildingArea(); // Инициализируем расчет
      }
  
      // Обработка перехода между шагами
      nextButtons.forEach(button => {
        button.addEventListener('click', function() {
          if (validateCurrentStep()) {
            goToStep(currentStep + 1);
          }
        });
      });
  
      prevButtons.forEach(button => {
        button.addEventListener('click', function() {
          goToStep(currentStep - 1);
        });
      });
  
      // Валидация текущего шага
      function validateCurrentStep() {
        switch (currentStep) {
          case 1: // Шаг с размерами
            const length = parseFloat(lengthInput.value);
            const width = parseFloat(widthInput.value);
            const height = parseFloat(calculatorForm.querySelector('input[name="height"]').value);
  
            if (isNaN(length) || length < 6 || length > 100) {
              showError(calculatorForm, 'Пожалуйста, введите корректную длину (6-100 м)');
              return false;
            }
            if (isNaN(width) || width < 6 || width > 50) {
              showError(calculatorForm, 'Пожалуйста, введите корректную ширину (6-50 м)');
              return false;
            }
            if (isNaN(height) || height < 3 || height > 12) {
              showError(calculatorForm, 'Пожалуйста, введите корректную высоту (3-12 м)');
              return false;
            }
            return true;
  
          default:
            return true;
        }
      }
  
      // Переход к конкретному шагу
      function goToStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= steps.length) return;
  
        // Скрываем текущий шаг
        steps[currentStep].classList.remove('active');
        
        // Показываем новый шаг
        currentStep = stepIndex;
        steps[currentStep].classList.add('active');
  
        // Обновляем индикаторы шагов
        updateStepIndicators();
  
        // Если перешли на последний шаг - обновляем результаты
        if (currentStep === 3) {
          updateResults();
        }
      }
  
      // Обновление индикаторов шагов
      function updateStepIndicators() {
        stepIndicators.forEach((indicator, index) => {
          indicator.classList.toggle('active', index <= currentStep);
        });
  
        stepConnectors.forEach((connector, index) => {
          connector.classList.toggle('active', index < currentStep);
        });
      }
  
      // Обновление результатов расчета
      function updateResults() {
        const buildingType = calculatorForm.querySelector('input[name="building-type"]:checked').value;
        const length = parseFloat(lengthInput.value);
        const width = parseFloat(widthInput.value);
        const height = parseFloat(calculatorForm.querySelector('input[name="height"]').value);
        const area = length * width;
  
        // Тип здания
        let buildingTypeText = '';
        switch (buildingType) {
          case 'industrial': buildingTypeText = 'Промышленный ангар'; break;
          case 'agricultural': buildingTypeText = 'Сельскохозяйственный ангар'; break;
          case 'commercial': buildingTypeText = 'Коммерческое здание'; break;
        }
  
        document.getElementById('result-type').textContent = buildingTypeText;
        document.getElementById('result-dimensions').textContent = `${length} × ${width} × ${height} м`;
        document.getElementById('result-area').textContent = `${area} м²`;
  
        // Дополнительные опции
        const options = [];
        const checkboxes = calculatorForm.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
          switch (checkbox.name) {
            case 'insulation': options.push('Утепление'); break;
            case 'ventilation': options.push('Вентиляция'); break;
            case 'electricity': options.push('Электрика'); break;
            case 'heating': options.push('Отопление'); break;
            case 'plumbing': options.push('Водоснабжение и канализация'); break;
            case 'fire-protection': options.push('Пожарная сигнализация'); break;
          }
        });
  
        const optionsList = document.getElementById('result-options');
        optionsList.innerHTML = '';
        if (options.length > 0) {
          options.forEach(option => {
            const li = document.createElement('li');
            li.className = 'mb-1';
            li.textContent = option;
            optionsList.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.className = 'mb-1';
          li.textContent = 'Нет выбранных опций';
          optionsList.appendChild(li);
        }
  
        // Расчет стоимости
        let basePrice = 20000; // Цена за м²
        switch (buildingType) {
          case 'industrial': basePrice = 20000; break;
          case 'agricultural': basePrice = 18000; break;
          case 'commercial': basePrice = 25000; break;
        }
  
        let totalPrice = area * basePrice;
        checkboxes.forEach(() => {
          totalPrice += area * 1000; // Доплата за каждую опцию
        });
  
        document.getElementById('result-price').textContent = 
          new Intl.NumberFormat('ru-RU').format(totalPrice) + ' ₽';
      }
  
      // Инициализация индикаторов шагов
      updateStepIndicators();
    }
  
    // Функции показа сообщений
    function showError(form, message) {
      let errorElement = form.querySelector('.error-message') || 
                        document.getElementById(`${form.id}-error`);
  
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        form.appendChild(errorElement);
      }
  
      errorElement.textContent = message;
      errorElement.style.display = 'block';
  
      setTimeout(() => {
        errorElement.style.display = 'none';
      }, 3000);
    }
  
    function showSuccess(form) {
      let successElement = form.querySelector('.success-message') || 
                          document.getElementById(`${form.id}-success`);
  
      if (!successElement) {
        successElement = document.createElement('div');
        successElement.className = 'success-message';
        successElement.textContent = 'Спасибо! Ваша заявка отправлена.';
        form.appendChild(successElement);
      }
  
      successElement.style.display = 'block';
      setTimeout(() => {
        successElement.style.display = 'none';
      }, 3000);
    }
  });