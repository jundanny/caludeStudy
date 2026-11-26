(() => {
  'use strict';

  const STORAGE_KEY = 'todo-app.items';

  const form = document.getElementById('new-todo-form');
  const input = document.getElementById('new-todo-input');
  const list = document.getElementById('todo-list');
  const emptyMessage = document.getElementById('empty-message');
  const count = document.getElementById('todo-count');
  const clearCompleted = document.getElementById('clear-completed');
  const toggleAll = document.getElementById('toggle-all');
  const filterButtons = document.querySelectorAll('[data-filter]');

  let todos = load();
  let filter = 'all';

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 메모리에만 유지
    }
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function visibleTodos() {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function render() {
    list.replaceChildren(...visibleTodos().map(renderItem));

    const remaining = todos.filter(t => !t.completed).length;
    const completed = todos.length - remaining;

    emptyMessage.hidden = visibleTodos().length > 0;
    count.textContent = `남은 할 일 ${remaining}개`;
    clearCompleted.hidden = completed === 0;
    toggleAll.checked = todos.length > 0 && remaining === 0;
    toggleAll.disabled = todos.length === 0;

    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
  }

  function renderItem(todo) {
    const li = document.createElement('li');
    li.dataset.id = todo.id;
    li.classList.toggle('completed', todo.completed);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'toggle';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', '완료 표시');

    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = todo.title;

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete';
    del.textContent = '×';
    del.setAttribute('aria-label', '삭제');

    li.append(checkbox, title, del);
    return li;
  }

  function findTodo(id) {
    return todos.find(t => t.id === id);
  }

  function update(mutator) {
    mutator();
    save();
    render();
  }

  function startEditing(li) {
    const todo = findTodo(li.dataset.id);
    if (!todo) return;

    const title = li.querySelector('.title');
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit';
    editInput.value = todo.title;
    editInput.maxLength = 200;
    title.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    let done = false;
    const finish = (commit) => {
      if (done) return;
      done = true;
      const value = editInput.value.trim();
      update(() => {
        if (!commit) return;
        if (value) todo.title = value;
        else todos = todos.filter(t => t.id !== todo.id);
      });
    };

    editInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') finish(true);
      else if (e.key === 'Escape') finish(false);
    });
    editInput.addEventListener('blur', () => finish(true));
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const title = input.value.trim();
    if (!title) return;
    update(() => {
      todos.push({ id: newId(), title, completed: false });
    });
    input.value = '';
  });

  list.addEventListener('change', e => {
    if (!e.target.classList.contains('toggle')) return;
    const todo = findTodo(e.target.closest('li').dataset.id);
    if (todo) update(() => { todo.completed = e.target.checked; });
  });

  list.addEventListener('click', e => {
    if (!e.target.classList.contains('delete')) return;
    const id = e.target.closest('li').dataset.id;
    update(() => { todos = todos.filter(t => t.id !== id); });
  });

  list.addEventListener('dblclick', e => {
    const title = e.target.closest('.title');
    if (title) startEditing(title.closest('li'));
  });

  toggleAll.addEventListener('change', () => {
    update(() => { todos.forEach(t => { t.completed = toggleAll.checked; }); });
  });

  clearCompleted.addEventListener('click', () => {
    update(() => { todos = todos.filter(t => !t.completed); });
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      render();
    });
  });

  // 다른 탭에서 변경된 내용 반영
  window.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY) {
      todos = load();
      render();
    }
  });

  render();
})();
