document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Экраны и Авторизация ---
    const welcomeScreen = document.getElementById('welcome-screen');
    if (localStorage.getItem('kalendarius_auth') === 'true' && welcomeScreen) {
        welcomeScreen.classList.add('hidden');
    }
    
    const btnStart = document.getElementById('btn-start');
    if (btnStart) {
        btnStart.addEventListener('click', () => {
            welcomeScreen.classList.add('hidden');
            localStorage.setItem('kalendarius_auth', 'true');
        });
    }
    
    const btnGoogle = document.querySelector('.btn-google');
    if (btnGoogle) {
        btnGoogle.addEventListener('click', () => {
            welcomeScreen.classList.add('hidden');
            localStorage.setItem('kalendarius_auth', 'true');
        });
    }

    // --- 2. Сохранение Состояния ---
    function saveState() {
        const unassignedTasks = document.getElementById('unassigned-tasks');
        if (unassignedTasks) {
            localStorage.setItem('unassigned_tasks', unassignedTasks.innerHTML);
        }
        
        document.querySelectorAll('.tasks-dropzone').forEach(zone => {
            if (zone.id) localStorage.setItem(zone.id, zone.innerHTML);
        });
    }

    // --- 3. Состояние Календаря ---
    let currentDate = new Date();
    let currentView = 'week'; 
    
    const monthLabel = document.querySelector('.date-controls h2');
    const calendarGrid = document.getElementById('calendar-grid');
    const daysContainer = document.querySelector('.days-container');
    const timeColumn = document.getElementById('time-column');
    const viewButtons = document.querySelectorAll('.view-controls button');
    
    function updateDateLabel() {
        if (!monthLabel) return;
        const options = { month: 'long', year: 'numeric' };
        monthLabel.textContent = currentDate.toLocaleDateString('ru-RU', options).replace(' г.', '');
    }

    function renderCalendar() {
        if (!daysContainer) return;
        daysContainer.innerHTML = '';
        calendarGrid.className = `calendar-grid ${currentView}-grid`;
        updateDateLabel();

        // Генерация шкалы времени с 08:00 до 00:00
        if (timeColumn && timeColumn.children.length === 0) {
            for (let i = 8; i <= 23; i++) {
                timeColumn.innerHTML += `<div>${i.toString().padStart(2, '0')}:00</div>`;
            }
            timeColumn.innerHTML += `<div>00:00</div>`; 
        }

        let daysToRender = 1;
        let startDate = new Date(currentDate);

        if (currentView === 'week') {
            daysToRender = 7;
            const day = startDate.getDay() || 7; 
            startDate.setDate(startDate.getDate() - day + 1);
        } else if (currentView === 'month') {
            daysToRender = 35; 
            startDate.setDate(1);
            const day = startDate.getDay() || 7;
            startDate.setDate(startDate.getDate() - day + 1);
        }

        const daysOfWeek = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

        for (let i = 0; i < daysToRender; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);

            const col = document.createElement('div');
            col.className = 'day-column';
            
            const isToday = currentDay.toDateString() === new Date().toDateString();
            const headerStyle = isToday ? 'color: var(--primary); font-weight: bold;' : '';

            const dateStr = currentDay.getFullYear() + '-' + 
                           (currentDay.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                           currentDay.getDate().toString().padStart(2, '0');
            const zoneId = `zone-${dateStr}`;
            
            const savedTasks = localStorage.getItem(zoneId) || '';

            col.innerHTML = `
                <div class="day-header" style="${headerStyle}">
                    ${daysOfWeek[currentDay.getDay()]} ${currentDay.getDate()}
                </div>
                <div class="tasks-dropzone" id="${zoneId}">
                    ${savedTasks}
                </div>
            `;
            daysContainer.appendChild(col);
        }
        rebindAll();
    }

    // --- Навигация по датам ---
    const btnPrev = document.querySelectorAll('.btn-icon')[0];
    const btnNext = document.querySelectorAll('.btn-icon')[1];
    const btnToday = document.querySelector('.btn-today');

    if (btnPrev) {
        btnPrev.addEventListener('click', () => { 
            saveState();
            if (currentView === 'day') currentDate.setDate(currentDate.getDate() - 1);
            if (currentView === 'week') currentDate.setDate(currentDate.getDate() - 7);
            if (currentView === 'month') currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', () => { 
            saveState();
            if (currentView === 'day') currentDate.setDate(currentDate.getDate() + 1);
            if (currentView === 'week') currentDate.setDate(currentDate.getDate() + 7);
            if (currentView === 'month') currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (btnToday) {
        btnToday.addEventListener('click', () => { 
            saveState();
            currentDate = new Date();
            renderCalendar();
        });
    }

    // --- Переключение видов ---
    viewButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            saveState(); 
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (index === 0) currentView = 'day';
            if (index === 1) currentView = 'week';
            if (index === 2) currentView = 'month';
            renderCalendar();
        });
    });

    const menuToday = document.getElementById('menu-today');
    if (menuToday) {
        menuToday.addEventListener('click', () => {
            saveState();
            currentDate = new Date();
            currentView = 'day';
            viewButtons.forEach(b => b.classList.remove('active'));
            if(viewButtons[0]) viewButtons[0].classList.add('active');
            renderCalendar();
        });
    }

    // --- 4. Управление списками ---
    const btnAddList = document.getElementById('btn-add-list');
    const customLists = document.getElementById('custom-lists');
    const selectCategory = document.getElementById('new-task-category');

    function bindListEvents() {
        document.querySelectorAll('.list-item').forEach(li => {
            li.ondblclick = function() {
                if (confirm(`Удалить список "${this.innerText.trim()}"?`)) {
                    const val = this.getAttribute('data-val');
                    this.remove();
                    if(selectCategory) {
                        const opt = selectCategory.querySelector(`option[value="${val}"]`);
                        if(opt) opt.remove();
                    }
                }
            };
        });
    }

    if (btnAddList) {
        btnAddList.addEventListener('click', () => {
            const listName = prompt("Введите название нового списка:");
            if (listName && customLists && selectCategory) {
                const val = 'custom-' + Date.now();
                const color = '#' + Math.floor(Math.random()*16777215).toString(16);
                
                const li = document.createElement('li');
                li.className = 'list-item';
                li.setAttribute('data-val', val);
                li.innerHTML = `<span class="dot" style="background:${color}"></span> ${listName}`;
                customLists.appendChild(li);

                const opt = document.createElement('option');
                opt.value = val;
                opt.textContent = listName;
                selectCategory.appendChild(opt);

                const style = document.createElement('style');
                style.innerHTML = `.task-card.${val} { border-left-color: ${color}; }`;
                document.head.appendChild(style);

                bindListEvents();
            }
        });
    }

    bindListEvents();

    // --- 5. Drag & Drop ---
    let draggedTask = null;

    function rebindAll() {
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

            newTask.addEventListener('dblclick', function() {
                if (confirm('Удалить эту задачу?')) {
                    this.remove();
                    saveState(); 
                }
            });
        });

        document.querySelectorAll('.tasks-dropzone, .unassigned-tasks').forEach(zone => {
            const newZone = zone.cloneNode(false); 
            while (zone.firstChild) newZone.appendChild(zone.firstChild);
            zone.parentNode.replaceChild(newZone, zone);

            newZone.addEventListener('dragover', e => {
                e.preventDefault();
                newZone.classList.add('drag-over');
            });
            newZone.addEventListener('dragleave', function(e) {
                if (!newZone.contains(e.relatedTarget)) {
                    newZone.classList.remove('drag-over');
                }
            });
            newZone.addEventListener('drop', function(e) {
                newZone.classList.remove('drag-over');
                if (draggedTask) {
                    // "Кидаем правильно": если кидаем в календарь и это сетка дней, определяем позицию
                    if (this.classList.contains('tasks-dropzone') && currentView !== 'month') {
                        const rect = this.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        // 1 час = 60px
                        const hours = Math.floor(y / 60);
                        const minutes = Math.floor(((y % 60) / 60) * 60);
                        
                        // Формируем время (8:00 - начало)
                        const hourVal = 8 + hours;
                        if (hourVal >= 8 && hourVal < 24) {
                            const timeStr = `${hourVal.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            
                            // Обновляем текст задачи добавлением времени, если там его нет
                            let text = draggedTask.textContent.split(' | ');
                            const title = text.length > 1 ? text[1] : text[0];
                            draggedTask.textContent = `${timeStr} | ${title.trim()}`;
                            
                            // Визуальное позиционирование
                            draggedTask.style.position = 'absolute';
                            draggedTask.style.top = `${hours * 60 + (minutes/60)*60}px`;
                            draggedTask.style.left = '5px';
                            draggedTask.style.right = '5px';
                            draggedTask.style.width = 'auto';
                            draggedTask.style.margin = '0'; // убираем margin для точного позиционирования
                        }
                    } else if (this.classList.contains('unassigned-tasks') || currentView === 'month') {
                        // Если вернули обратно в незавершенные или режим месяца
                        draggedTask.style.position = 'relative';
                        draggedTask.style.top = '0';
                        draggedTask.style.left = '0';
                        draggedTask.style.right = '0';
                        draggedTask.style.margin = '0 0 10px 0';
                    }

                    this.append(draggedTask);
                    saveState(); 
                }
            });
        });
    }

    // --- 6. Создание задачи ---
    const btnNewTask = document.getElementById('btn-new-task');
    const taskModal = document.getElementById('task-modal');
    const btnCancelTask = document.getElementById('btn-cancel-task');
    const btnSaveTask = document.getElementById('btn-save-task');
    
    // Элементы формы
    const inputTaskTitle = document.getElementById('new-task-title');

    if (btnNewTask && taskModal) {
        btnNewTask.addEventListener('click', () => { 
            taskModal.classList.remove('hidden'); 
            if(inputTaskTitle) inputTaskTitle.value = ''; 
        });
    }

    if (btnCancelTask && taskModal) {
        btnCancelTask.addEventListener('click', () => taskModal.classList.add('hidden'));
    }

    if (btnSaveTask) {
        btnSaveTask.addEventListener('click', () => {
            if (!inputTaskTitle || !selectCategory) return;
            
            const title = inputTaskTitle.value.trim();
            const category = selectCategory.value;

            if (title !== '') {
                const newTask = document.createElement('div');
                newTask.className = `task-card ${category}`;
                newTask.draggable = true;
                
                newTask.textContent = title;
                newTask.id = 'task-' + Date.now();

                const unassignedContainer = document.getElementById('unassigned-tasks');
                if (unassignedContainer) {
                    unassignedContainer.appendChild(newTask);
                }
                
                if (taskModal) taskModal.classList.add('hidden');
                rebindAll();
                saveState(); 
            }
        });
    }

    // Инициализация загрузки из памяти
    const savedUnassigned = localStorage.getItem('unassigned_tasks');
    if (savedUnassigned) {
        const unassignedContainer = document.getElementById('unassigned-tasks');
        if (unassignedContainer) unassignedContainer.innerHTML = savedUnassigned;
    }

    renderCalendar();
});