const state = {
  books: getBooks(),
  cart: JSON.parse(localStorage.getItem('list-cart') || '[]'),
  user: JSON.parse(localStorage.getItem('list-user') || 'null')
};

const money = value => `${Number(value).toLocaleString('ru-RU')} ₽`;
const byId = id => state.books.find(book => book.id === Number(id));

function saveCart() {
  localStorage.setItem('list-cart', JSON.stringify(state.cart));
  updateHeader();
}

function updateHeader() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach(node => node.textContent = count);
  document.querySelectorAll('[data-user-link]').forEach(node => {
    node.textContent = state.user ? state.user.name : 'Войти';
    node.href = state.user
      ? (state.user.role === 'admin' ? 'admin.html' : 'profile.html')
      : 'auth.html';
  });
}

function addToCart(id) {
  const item = state.cart.find(entry => entry.id === Number(id));
  if (item) item.quantity += 1;
  else state.cart.push({ id: Number(id), quantity: 1 });
  saveCart();
  showToast('Книга добавлена в корзину');
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1800);
}

function bookCard(book) {
  const article = document.createElement('article');
  article.className = 'book-card';
  article.dataset.genre = book.genre;
  article.innerHTML = `
    <a class="book-cover" href="product.html?id=${book.id}" style="--cover:${book.color}" aria-label="Открыть книгу ${book.title}">
      ${book.badge ? `<span class="badge">${book.badge}</span>` : ''}
      <strong>${book.title.replace(' ', '<br>')}</strong>
    </a>
    <div class="book-content">
      <p class="meta">${book.genre} · ${book.age}</p>
      <h3><a href="product.html?id=${book.id}">${book.title}</a></h3>
      <p>${book.author}</p>
      <div class="book-buy"><strong>${money(book.price)}</strong><button class="button small" data-add="${book.id}">В корзину</button></div>
    </div>`;
  return article;
}

function renderBooks(container, books) {
  container.replaceChildren(...books.map(bookCard));
}

function initCatalog() {
  const grid = document.querySelector('[data-catalog]');
  if (!grid) return;
  const search = document.querySelector('#search');
  const genre = document.querySelector('#genre');
  const sort = document.querySelector('#sort');
  const apply = () => {
    const query = search?.value.trim().toLowerCase() || '';
    let books = state.books.filter(book =>
      (!query || `${book.title} ${book.author}`.toLowerCase().includes(query)) &&
      (!genre?.value || book.genre === genre.value)
    );
    if (sort?.value === 'price-up') books.sort((a, b) => a.price - b.price);
    if (sort?.value === 'price-down') books.sort((a, b) => b.price - a.price);
    if (sort?.value === 'title') books.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    renderBooks(grid, books);
    document.querySelector('[data-result-count]')?.replaceChildren(document.createTextNode(String(books.length)));
  };
  [search, genre, sort].forEach(control => control?.addEventListener('input', apply));
  apply();
}

function initProduct() {
  const root = document.querySelector('[data-product]');
  if (!root) return;
  const book = byId(new URLSearchParams(location.search).get('id') || 1);
  if (!book) { location.href = '404.html'; return; }
  document.title = `${book.title} — ЛИСТ`;
  root.innerHTML = `
    <div class="product-cover" style="--cover:${book.color}"><strong>${book.title.replace(' ', '<br>')}</strong></div>
    <div class="product-info"><p class="eyebrow">${book.genre} · ${book.age}</p><h1>${book.title}</h1><p class="product-author">${book.author}</p><p>${book.description}</p>
    <dl><div><dt>Издательство</dt><dd>ЛИСТ</dd></div><div><dt>Формат</dt><dd>Твёрдая обложка</dd></div><div><dt>Язык</dt><dd>Русский</dd></div></dl>
    <div class="product-action"><strong>${money(book.price)}</strong><button class="button" data-add="${book.id}">Добавить в корзину</button></div></div>`;
}

function initCart() {
  const root = document.querySelector('[data-cart]');
  if (!root) return;
  const render = () => {
    if (!state.cart.length) {
      root.innerHTML = '<div class="empty"><h2>Корзина пока пуста</h2><p>Добавьте книги из каталога, чтобы оформить заказ.</p><a class="button" href="catalog.html">Перейти в каталог</a></div>';
      document.querySelector('[data-cart-total]').textContent = money(0);
      return;
    }
    root.replaceChildren(...state.cart.map(item => {
      const book = byId(item.id);
      const row = document.createElement('article');
      row.className = 'cart-row';
      row.innerHTML = `<div class="mini-cover" style="--cover:${book.color}">${book.title}</div><div><h3>${book.title}</h3><p>${book.author}</p></div><div class="quantity"><button data-dec="${book.id}" aria-label="Уменьшить количество">−</button><span>${item.quantity}</span><button data-inc="${book.id}" aria-label="Увеличить количество">+</button></div><strong>${money(book.price * item.quantity)}</strong><button class="icon-button" data-remove="${book.id}" aria-label="Удалить ${book.title}">×</button>`;
      return row;
    }));
    const total = state.cart.reduce((sum, item) => sum + byId(item.id).price * item.quantity, 0);
    document.querySelector('[data-cart-total]').textContent = money(total);
  };
  root.addEventListener('click', event => {
    const id = event.target.dataset.inc || event.target.dataset.dec || event.target.dataset.remove;
    if (!id) return;
    const item = state.cart.find(entry => entry.id === Number(id));
    if (event.target.dataset.inc) item.quantity++;
    if (event.target.dataset.dec) item.quantity = Math.max(1, item.quantity - 1);
    if (event.target.dataset.remove) state.cart = state.cart.filter(entry => entry.id !== Number(id));
    saveCart(); render();
  });
  render();
}

function initAuth() {
  const form = document.querySelector('[data-auth-form]');
  if (!form) return;
  const modeButtons = document.querySelectorAll('[data-auth-mode]');
  let mode = 'login';
  modeButtons.forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.authMode;
    modeButtons.forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-register-field]').forEach(field => {
      field.hidden = mode === 'login';
      field.querySelectorAll('[data-register-required]').forEach(input => input.required = mode === 'register');
    });
    document.querySelector('[data-auth-submit]').textContent = mode === 'login' ? 'Войти' : 'Зарегистрироваться';
  }));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email')).trim().toLowerCase();
    const password = String(data.get('password'));
    const users = JSON.parse(localStorage.getItem('list-users') || '[]');
    if (email === 'admin@list.ru' && password === 'admin123') {
      state.user = { name: 'Администратор', email, role: 'admin' };
      localStorage.setItem('list-user', JSON.stringify(state.user));
      location.href = 'admin.html'; return;
    }
    if (mode === 'register') {
      if (users.some(user => user.email === email)) { showToast('Такой пользователь уже существует'); return; }
      const user = {
        name: String(data.get('name')).trim(), email, password, role: 'user',
        age: data.get('age'), genre: data.get('genre'), format: data.get('format'),
        delivery: data.get('delivery'), interests: data.getAll('interest'), comment: data.get('comment')
      };
      users.push(user); localStorage.setItem('list-users', JSON.stringify(users)); state.user = { name: user.name, email, role: 'user' };
    } else {
      const user = users.find(item => item.email === email && item.password === password);
      if (!user) { showToast('Проверьте почту и пароль'); return; }
      state.user = { name: user.name, email, role: user.role };
    }
    localStorage.setItem('list-user', JSON.stringify(state.user)); location.href = 'profile.html';
  });
}

function initCheckout() {
  const form = document.querySelector('[data-checkout]');
  if (!form) return;
  const total = state.cart.reduce((sum, item) => sum + byId(item.id).price * item.quantity, 0);
  document.querySelector('[data-order-total]').textContent = money(total);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!state.cart.length) { showToast('Корзина пуста'); return; }
    const data = new FormData(form);
    const order = { id: Date.now(), date: new Date().toLocaleDateString('ru-RU'), total, status: 'Оплачен', items: [...state.cart], customer: Object.fromEntries(data) };
    const orders = JSON.parse(localStorage.getItem('list-orders') || '[]');
    orders.unshift(order); localStorage.setItem('list-orders', JSON.stringify(orders));
    state.cart = []; saveCart();
    form.hidden = true;
    document.querySelector('[data-order-success]').hidden = false;
    document.querySelector('[data-order-number]').textContent = String(order.id).slice(-6);
  });
}

function initProfile() {
  const root = document.querySelector('[data-profile]');
  if (!root) return;
  if (!state.user) { location.href = 'auth.html'; return; }
  if (state.user.role === 'admin') { location.href = 'admin.html'; return; }
  root.querySelector('[data-profile-name]').textContent = state.user.name;
  root.querySelector('[data-profile-email]').textContent = state.user.email;
  const list = root.querySelector('[data-orders]');
  const orders = JSON.parse(localStorage.getItem('list-orders') || '[]');
  list.innerHTML = orders.length ? orders.map(order => `<article class="order"><div><strong>Заказ №${String(order.id).slice(-6)}</strong><span>${order.date}</span></div><span>${order.status}</span><strong>${money(order.total)}</strong></article>`).join('') : '<p>Заказов пока нет.</p>';
  root.querySelector('[data-logout]').addEventListener('click', () => { localStorage.removeItem('list-user'); location.href = 'index.html'; });
}

function initTheme() {
  const enabled = localStorage.getItem('list-colorblind') === 'true';
  document.documentElement.classList.toggle('colorblind-mode', enabled);
  document.querySelectorAll('[data-contrast]').forEach(button => {
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = enabled ? 'Обычные цвета' : 'Для дальтоников';
    button.setAttribute('title', enabled ? 'Вернуть обычные цвета' : 'Включить режим для дальтоников');
    button.addEventListener('click', () => {
      const active = !document.documentElement.classList.contains('colorblind-mode');
      document.documentElement.classList.toggle('colorblind-mode', active);
      localStorage.setItem('list-colorblind', String(active));
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? 'Обычные цвета' : 'Для дальтоников';
      button.setAttribute('title', active ? 'Вернуть обычные цвета' : 'Включить режим для дальтоников');
    });
  });
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-add]');
  if (button) addToCart(button.dataset.add);
});

function initSharedHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  header.innerHTML = `
    <div class="container header-inner">
      <a class="logo" href="index.html" aria-label="ЛИСТ — на главную">ЛИСТ<span>.</span></a>
      <button class="burger-button" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Открыть меню">
        <span></span><span></span><span></span>
      </button>
      <div class="header-panel" id="mobile-menu">
        <nav class="main-nav" aria-label="Основное меню">
          <ul class="main-menu">
            <li class="menu-item"><a class="menu-link" href="catalog.html">Книги</a><button class="submenu-toggle" type="button" aria-expanded="false" aria-label="Показать подразделы: Книги">⌄</button>
              <ul class="submenu"><li><a href="catalog.html">Все книги</a></li><li><a href="index.html#new">Новинки</a></li><li><a href="catalog.html#filters">Жанры</a></li></ul>
            </li>
            <li class="menu-item"><a class="menu-link" href="index.html#news">Читателям</a><button class="submenu-toggle" type="button" aria-expanded="false" aria-label="Показать подразделы: Читателям">⌄</button>
              <ul class="submenu"><li><a href="index.html#news">Новости</a></li><li><a href="profile.html">Мои заказы</a></li><li><a href="cart.html">Корзина</a></li></ul>
            </li>
            <li class="menu-item"><a class="menu-link" href="index.html#about">Издательство</a><button class="submenu-toggle" type="button" aria-expanded="false" aria-label="Показать подразделы: Издательство">⌄</button>
              <ul class="submenu"><li><a href="index.html#about">О нас</a></li><li><a href="authors.html">Авторы</a></li><li><a href="index.html#contacts">Контакты</a></li></ul>
            </li>
            <li class="menu-item"><a class="menu-link" href="index.html#contacts">Помощь</a><button class="submenu-toggle" type="button" aria-expanded="false" aria-label="Показать подразделы: Помощь">⌄</button>
              <ul class="submenu"><li><a href="checkout.html">Доставка</a></li><li><a href="checkout.html">Оплата</a></li><li><a href="404.html">Вопросы</a></li></ul>
            </li>
          </ul>
        </nav>
        <div class="header-actions">
          <button class="contrast-toggle" data-contrast type="button" aria-pressed="false">Для дальтоников</button>
          <a data-user-link href="auth.html">Войти</a>
          <a class="cart-link" href="cart.html">Корзина · <span data-cart-count>0</span></a>
          <button class="header-logout link-button" type="button" data-header-logout hidden>Выйти</button>
        </div>
      </div>
    </div>`;

  const burger = header.querySelector('.burger-button');
  const panel = header.querySelector('.header-panel');
  const closeMenu = () => {
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    panel.classList.remove('open');
  };
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    panel.classList.toggle('open', open);
  });
  panel.addEventListener('click', event => {
    const toggle = event.target.closest('.submenu-toggle');
    if (toggle && window.matchMedia('(max-width: 760px)').matches) {
      const item = toggle.closest('.menu-item');
      const willOpen = !item.classList.contains('submenu-open');
      panel.querySelectorAll('.menu-item.submenu-open').forEach(openItem => {
        openItem.classList.remove('submenu-open');
        openItem.querySelector('.submenu-toggle')?.setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('submenu-open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
      return;
    }
    if (event.target.closest('a') && window.matchMedia('(max-width: 760px)').matches) closeMenu();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const logout = header.querySelector('[data-header-logout]');
  if (state.user) logout.hidden = false;
  logout.addEventListener('click', () => {
    localStorage.removeItem('list-user');
    location.href = 'index.html';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSharedHeader(); updateHeader(); initTheme(); initCatalog(); initProduct(); initCart(); initAuth(); initCheckout(); initProfile();
});
