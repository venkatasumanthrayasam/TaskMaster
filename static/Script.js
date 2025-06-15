document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const emptyState = document.getElementById('empty-state');
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');

    // Load tasks from backend
    fetchTasks();

    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Load tasks from Flask
    async function fetchTasks() {
        const res = await fetch('/tasks');
        const tasks = await res.json();
        taskList.innerHTML = '';
        tasks.forEach(task => {
            createTaskElement(task.text, task.isCompleted, task.id);
        });
        updateUI();
    }

    // Add task via backend
    async function addTask() {
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        await fetch('/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: taskText })
        });

        taskInput.value = '';
        fetchTasks();
    }

    // Create Task Element
    function createTaskElement(taskText, isCompleted = false, taskId) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = isCompleted;
        checkbox.addEventListener('change', function () {
            toggleTaskById(taskId, checkbox.checked);
        });

        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        if (isCompleted) textSpan.classList.add('completed');
        textSpan.textContent = taskText;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.addEventListener('click', function () {
            deleteTaskById(taskId);
        });

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        actionsDiv.appendChild(deleteBtn);

        taskItem.appendChild(checkbox);
        taskItem.appendChild(textSpan);
        taskItem.appendChild(actionsDiv);

        taskList.appendChild(taskItem);
    }

    // Delete task by ID from backend
    async function deleteTaskById(taskId) {
        await fetch(`/tasks/${taskId}`, {
            method: 'DELETE'
        });
        fetchTasks();
    }

    // Toggle task completed status
    async function toggleTaskById(taskId, completed) {
        await fetch(`/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });
        fetchTasks();
    }

    // Update task UI
    function updateUI() {
        const totalTasks = taskList.children.length;
        const completedTasks = document.querySelectorAll('.task-checkbox:checked').length;

        totalTasksEl.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
        completedTasksEl.textContent = `${completedTasks} completed`;
        emptyState.style.display = totalTasks === 0 ? 'block' : 'none';
    }
});
