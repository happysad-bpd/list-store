document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-admin]');
  if (!root) return;
  const user = JSON.parse(localStorage.getItem('list-user') || 'null');
  if (!user || user.role !== 'admin') { location.href = 'auth.html'; return; }
  const form = root.querySelector('#book-form');
  const list = root.querySelector('[data-admin-books]');
  const title = root.querySelector('[data-form-title]');
  const logoutButton = document.querySelector('[data-admin-logout]');
  let editingId = null;

  logoutButton?.addEventListener('click', () => {
    localStorage.removeItem('list-user');
    location.href = 'index.html';
  });

  const render = () => {
    const books = getBooks();
    list.replaceChildren(...books.map(book => {
      const row = document.createElement('article');
      row.className = 'admin-row';
      row.innerHTML = `<span class="color-dot" style="--cover:${book.color}"></span><div><strong>${book.title}</strong><span>${book.author} · ${book.genre}</span></div><strong>${Number(book.price).toLocaleString('ru-RU')} ₽</strong><button class="link-button" data-edit="${book.id}">Изменить</button><button class="link-button danger" data-delete="${book.id}">Удалить</button>`;
      return row;
    }));
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    const books = getBooks();
    const book = { title: data.title.trim(), author: data.author.trim(), genre: data.genre, age: data.age, price: Number(data.price), color: data.color, description: data.description.trim(), badge: data.badge.trim() };
    if (editingId) {
      const index = books.findIndex(item => item.id === editingId);
      books[index] = { ...books[index], ...book };
    } else {
      book.id = Math.max(0, ...books.map(item => item.id)) + 1;
      books.push(book);
    }
    saveBooks(books); form.reset(); editingId = null; title.textContent = 'Добавить книгу'; render();
  });

  list.addEventListener('click', event => {
    const editId = Number(event.target.dataset.edit);
    const deleteId = Number(event.target.dataset.delete);
    const books = getBooks();
    if (editId) {
      const book = books.find(item => item.id === editId);
      Object.entries(book).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
      editingId = editId; title.textContent = 'Редактировать книгу'; form.scrollIntoView({ behavior: 'smooth' });
    }
    if (deleteId && confirm('Удалить эту книгу?')) { saveBooks(books.filter(item => item.id !== deleteId)); render(); }
  });
  render();
});
