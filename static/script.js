document.addEventListener('DOMContentLoaded', () => {
    // 1. Логика экрана входа
    const welcomeScreen = document.getElementById('welcome-screen');
    const btnStart = document.getElementById('btn-start');

    // Проверяем, заходил ли пользователь ранее
    if (localStorage.getItem('kalendarius_auth') === 'true') {
        welcomeScreen.classList.add('hidden');
    }

    btnStart.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        localStorage.setItem('kalendarius_auth', 'true'); // Сохраняем сессию
    });

    // 2. Логика Drag & Drop
    const tasks = document.querySelectorAll('.task-card');
    const dropzones = document.querySelectorAll('.tasks-dropzone, .unassigned-tasks');

    let draggedTask = null;

    tasks.forEach(task => {
        task.addEventListener('dragstart', function() {
            draggedTask = this;
            setTimeout(() => this.style.display = 'none', 0);
        });

        task.addEventListener('dragend', function() {
            setTimeout(() => {
                draggedTask.style.display = 'block';
                draggedTask = null;
                saveState(); // Сохраняем состояние после перетаскивания
            }, 0);
        });
    });

    dropzones.forEach(zone => {
        zone.addEventListener('dragover', function(e) {
            e.preventDefault(); // Необходимо для разрешения drop
        });

        zone.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.style.background = 'rgba(99, 102, 241, 0.05)'; // Подсветка зоны
        });

        zone.addEventListener('dragleave', function() {
            this.style.background = 'transparent';
        });

        zone.addEventListener('drop', function() {
            this.style.background = 'transparent';
            if (draggedTask) {
                this.append(draggedTask);
            }
        });
    });

    // 3. Сохранение и загрузка состояния задач (LocalStorage)
    function saveState() {
        const unassigned = document.getElementById('unassigned-tasks').innerHTML;
        const calendarDay = document.querySelector('.tasks-dropzone').innerHTML;
        
        localStorage.setItem('unassigned_tasks', unassigned);
        localStorage.setItem('calendar_tasks', calendarDay);
    }

    function loadState() {
        const savedUnassigned = localStorage.getItem('unassigned_tasks');
        const savedCalendar = localStorage.getItem('calendar_tasks');

        if (savedUnassigned) document.getElementById('unassigned-tasks').innerHTML = savedUnassigned;
        if (savedCalendar) document.querySelector('.tasks-dropzone').innerHTML = savedCalendar;
        
        // Нужно заново повесить слушатели событий на загруженные элементы
        rebindDragEvents();
    }

    function rebindDragEvents() {
        document.querySelectorAll('.task-card').forEach(task => {
            const newTask = task.cloneNode(true);
            task.parentNode.replaceChild(newTask, task);

            newTask.addEventListener('dragstart', function() {
                draggedTask = this;
                setTimeout(() => this.style.display = 'none', 0);
            });
            
            newTask.addEventListener('dragend', function() {
                setTimeout(() => {
                    draggedTask.style.display = 'block';
                    draggedTask = null;
                    saveState();
                }, 0);
            });

            // ФИЧА: Удаление по двойному клику
            newTask.addEventListener('dblclick', function() {
                if (confirm('Удалить эту задачу?')) {
                    this.remove();
                    saveState();
                }
            });
        });
    }
    rebindDragEvents();

    // Загружаем данные при старте
    if(localStorage.getItem('unassigned_tasks')) {
        loadState();
    }
    // 4. Логика создания новой задачи
    const btnNewTask = document.getElementById('btn-new-task');
    const taskModal = document.getElementById('task-modal');
    const btnCancelTask = document.getElementById('btn-cancel-task');
    const btnSaveTask = document.getElementById('btn-save-task');
    
    // Элементы формы
    const inputTaskTitle = document.getElementById('new-task-title');
    const selectTaskCategory = document.getElementById('new-task-category');
    const unassignedTasksContainer = document.getElementById('unassigned-tasks');

    // Открыть модалку
    btnNewTask.addEventListener('click', () => {
        taskModal.classList.remove('hidden');
        inputTaskTitle.value = ''; // Очищаем поле ввода
    });

    // Закрыть модалку
    btnCancelTask.addEventListener('click', () => {
        taskModal.classList.add('hidden');
    });

    // Сохранить задачу
    btnSaveTask.addEventListener('click', () => {
        const title = inputTaskTitle.value.trim();
        const category = selectTaskCategory.value;

        if (title !== '') {
            // Создаем новый HTML элемент задачи
            const newTask = document.createElement('div');
            newTask.className = `task-card ${category}`;
            newTask.draggable = true;
            newTask.textContent = title;
            
            // Уникальный ID для корректного Drag & Drop
            newTask.id = 'task-' + Date.now();

            // Добавляем слушатели событий для новой задачи, чтобы ее можно было перетаскивать
            newTask.addEventListener('dragstart', function() {
                draggedTask = this;
                setTimeout(() => this.style.display = 'none', 0);
            });
            newTask.addEventListener('dragend', function() {
                setTimeout(() => {
                    draggedTask.style.display = 'block';
                    draggedTask = null;
                    saveState();
                }, 0);
            });

            // Добавляем в колонку "Без времени" (справа)
            unassignedTasksContainer.appendChild(newTask);
            
            // Сохраняем в localStorage и закрываем окно
            saveState();
            taskModal.classList.add('hidden');
        }
    });
});