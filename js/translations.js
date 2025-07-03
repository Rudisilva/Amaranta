const translations = {
    ru: {
        'home': 'Главная',
      
    },
    en: {
        
    },
    id: {
      
    }
};

const customSelect = document.getElementById('language-select');
const selected = customSelect.querySelector('.selected');
const options = customSelect.querySelector('.options');

selected.addEventListener('click', () => {
  options.style.display = options.style.display === 'block' ? 'none' : 'block';
});

options.querySelectorAll('div').forEach(option => {
  option.addEventListener('click', () => {
    const value = option.getAttribute('data-value');
    selected.textContent = option.textContent;
    selected.setAttribute('data-value', value);
    options.style.display = 'none';

    // Запускаем перевод
    translatePage(value);
  });
});

// Закрытие при клике вне
document.addEventListener('click', (e) => {
  if (!customSelect.contains(e.target)) {
    options.style.display = 'none';
  }
});