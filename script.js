// ===== КОНФИГ =====
const PIPEDREAM_URL = 'https://eox3nkr4zmbm2cg.m.pipedream.net';

// ===== МОБИЛЬНОЕ МЕНЮ =====
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== ПЛАВНЫЙ СКРОЛЛ К ФОРМЕ =====
document.querySelectorAll('[data-scroll-to]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.scrollTo);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===== ТОСТ-УВЕДОМЛЕНИЯ =====
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== ФОРМА ОТПРАВКИ =====
const form = document.getElementById('applicationForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let valid = true;

  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const carMake = document.getElementById('carMake');
  const carYear = document.getElementById('carYear');
  const description = document.getElementById('description');

  document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

  if (!name.value.trim()) {
    showError(name, 'nameError', 'Введите ваше имя');
    valid = false;
  }

  const phoneDigits = phone.value.replace(/\D/g, '');
  if (!phone.value.trim()) {
    showError(phone, 'phoneError', 'Введите номер телефона');
    valid = false;
  } else if (phoneDigits.length < 10) {
    showError(phone, 'phoneError', 'Номер должен содержать минимум 10 цифр');
    valid = false;
  }

  if (!carMake.value.trim()) {
    showError(carMake, 'carMakeError', 'Введите марку автомобиля');
    valid = false;
  }

  const year = parseInt(carYear.value);
  const currentYear = new Date().getFullYear();
  if (!carYear.value || year < 1900 || year > currentYear + 1) {
    showError(carYear, 'carYearError', `Введите год от 1900 до ${currentYear + 1}`);
    valid = false;
  }

  if (!valid) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляем...';

  const city = document.getElementById('city')?.value || '';
  const carType = document.getElementById('carType')?.value || '';

  const message = formatMessage({
    name: name.value.trim(),
    phone: phone.value.trim(),
    carMake: carMake.value.trim(),
    carYear: year,
    description: description.value.trim(),
    city,
    carType,
  });

  try {
    const response = await fetch(PIPEDREAM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (response.ok) {
      form.style.display = 'none';
      formSuccess.classList.add('show');
      showToast('Заявка успешно отправлена!', 'success');
    } else {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (err) {
    console.error('Ошибка отправки:', err);
    showToast('Ошибка при отправке. Попробуйте позже.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Оставить заявку';
  }
});

function showError(input, errorId, message) {
  input.classList.add('error');
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('show');
  }
}

function formatMessage({ name, phone, carMake, carYear, description, city, carType }) {
  const esc = (s) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const lines = [
    '<b>📋 Новая заявка на выкуп авто</b>',
    '',
    `<b>Имя:</b> ${esc(name)}`,
    `<b>Телефон:</b> ${esc(phone)}`,
    `<b>Марка авто:</b> ${esc(carMake)}`,
    `<b>Год выпуска:</b> ${carYear}`,
  ];
  if (city) lines.push(`<b>Город:</b> ${esc(city)}`);
  if (carType) lines.push(`<b>Тип выкупа:</b> ${esc(carType)}`);
  if (description) lines.push(`<b>Описание:</b> ${esc(description)}`);
  lines.push('', `<i>Время: ${new Date().toLocaleString('ru-RU')}</i>`);
  return lines.join('\n');
}

// ===== МАСКА ТЕЛЕФОНА =====
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', (e) => {
  let val = e.target.value.replace(/\D/g, '');
  if (val.startsWith('8')) val = '7' + val.slice(1);
  if (val.startsWith('7') && val.length > 0) {
    let formatted = '+7';
    if (val.length > 1) formatted += ' (' + val.slice(1, 4);
    if (val.length >= 4) formatted += ') ' + val.slice(4, 7);
    if (val.length >= 7) formatted += '-' + val.slice(7, 9);
    if (val.length >= 9) formatted += '-' + val.slice(9, 11);
    e.target.value = formatted;
  }
});
