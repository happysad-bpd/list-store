const DEFAULT_BOOKS = [
  { id: 1, title: 'Тихий город', author: 'Анна Левина', genre: 'Современная проза', age: '16+', price: 790, color: '#9a5b4c', description: 'История о памяти, взрослении и городе, который умеет хранить секреты.', badge: 'Новинка' },
  { id: 2, title: 'Море внутри', author: 'Михаил Ветров', genre: 'Роман', age: '16+', price: 850, color: '#58717a', description: 'Тихий роман о семье, принятии и долгом возвращении домой.', badge: 'Выбор редакции' },
  { id: 3, title: 'Ясное утро', author: 'Вера Миронова', genre: 'Рассказы', age: '12+', price: 640, color: '#aa8750', description: 'Короткие истории о простых событиях, которые меняют человека.', badge: '' },
  { id: 4, title: 'Живая система', author: 'Олег Серов', genre: 'Наука', age: '12+', price: 990, color: '#52705f', description: 'Понятный разговор о природе, взаимосвязях и устойчивом мире.', badge: 'Бестселлер' },
  { id: 5, title: 'После дождя', author: 'Лидия Орлова', genre: 'Поэзия', age: '16+', price: 570, color: '#746a7f', description: 'Поэтический сборник о городе, погоде и внутренних переменах.', badge: '' },
  { id: 6, title: 'Сила простоты', author: 'Илья Родин', genre: 'Саморазвитие', age: '16+', price: 920, color: '#9a684e', description: 'Практические способы освободить время и сосредоточиться на главном.', badge: 'Новинка' },
  { id: 7, title: 'Дальний свет', author: 'Елена Норд', genre: 'Фантастика', age: '12+', price: 880, color: '#8c6470', description: 'Научная фантастика о путешествии, надежде и далёком источнике света.', badge: '' },
  { id: 8, title: 'Думать точно', author: 'Павел Арский', genre: 'Психология', age: '16+', price: 760, color: '#4e7373', description: 'Книга о внимании, аргументации и решениях без лишнего шума.', badge: '' },
  { id: 9, title: 'Дом историй', author: 'Мария Белова', genre: 'Классика', age: '12+', price: 810, color: '#5f645f', description: 'Семейная сага о старом доме и историях нескольких поколений.', badge: 'Переиздание' }
];

function getBooks() {
  const stored = localStorage.getItem('list-books-v2');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('list-books-v2', JSON.stringify(DEFAULT_BOOKS));
  return [...DEFAULT_BOOKS];
}

function saveBooks(books) {
  localStorage.setItem('list-books-v2', JSON.stringify(books));
}
