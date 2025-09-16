// DOM 元素
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const pendingCount = document.getElementById('pendingCount');
const completedCount = document.getElementById('completedCount');
const clearCompletedBtn = document.getElementById('clearCompleted');
const dateTimeElement = document.getElementById('dateTime');

// 待办事项数组
let todos = [];
let currentFilter = 'all';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    renderTodos();
});

// 更新日期时间
function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit'
    };
    dateTimeElement.textContent = now.toLocaleDateString('zh-CN', options);
}

// 添加待办事项
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.unshift(todo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
}

// 切换待办事项状态
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// 删除待办事项
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// 清除已完成的待办事项
function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    saveTodos();
    renderTodos();
}

// 设置过滤器
function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderTodos();
}

// 渲染待办事项列表
function renderTodos() {
    // 过滤待办事项
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    }

    // 更新统计
    const pending = todos.filter(t => !t.completed).length;
    const completed = todos.filter(t => t.completed).length;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    // 清空列表
    todoList.innerHTML = '';

    // 如果没有待办事项，显示空状态
    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
            <p>${currentFilter === 'all' ? '暂无待办事项' : 
                currentFilter === 'active' ? '暂无未完成的待办事项' : 
                '暂无已完成的待办事项'}</p>
        `;
        todoList.appendChild(emptyState);
        return;
    }

    // 渲染每个待办事项
    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        const createdTime = new Date(todo.createdAt);
        const timeString = createdTime.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                 onclick="toggleTodo(${todo.id})"></div>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <span class="todo-time">${timeString}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">删除</button>
        `;

        todoList.appendChild(li);
    });
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 保存到本地存储
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 从本地存储加载
function loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
        todos = JSON.parse(saved);
    }
}

// 事件监听
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

clearCompletedBtn.addEventListener('click', clearCompleted);