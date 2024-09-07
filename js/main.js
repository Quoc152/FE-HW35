let todos = [];

let checkedItems = [];
let subtaskitems = [];
let selectedEdit = null;

// Lưu dữ liệu todos vào LocalStorage
saveToLocalStorage = (todos) => {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Lấy dữ liệu todos từ LocalStorage
loadFromLocalStorage = () => {
    const storedTodos = localStorage.getItem('todos');
    return storedTodos ? JSON.parse(storedTodos) : [];
}

// Show todos
function showTodo(todo) {
    // Tạo phần tử div cho todo
    const todoDiv = document.createElement('div');
    todoDiv.className = 'flex flex-col border-b-2 border-gray-200 pb-2';

    // Tạo ID duy nhất cho mỗi dropdown
    const todoId = `todo-${todo.stt}`;

    // Kiểm tra xem dueDate và priority có giá trị hay không
    const dueDateHTML = todo.dueDate ? `
        <div class="h-[32px] flex border border-gray-300 rounded-lg p-2 gap-1">
            <input type="date" class="text-green-500 text-xs font-light leading-[18px]" readonly value="${todo.dueDate}">
        </div>` : '';

    const priorityHTML = todo.priority ? `
        <div class="relative inline-block">
            <div class="h-[32px] flex gap-1 border border-gray-300 px-4 py-2 rounded-md text-xs font-light leading-[18px]">
                <img src="${getPriorityData(todo.priority).imgSrc}" alt="">
                <div>${getPriorityData(todo.priority).text}</div>
            </div>
        </div>` : '';

    // Cấu trúc HTML cho todo
    todoDiv.innerHTML = `
        <div data-stt="${todo.stt}" class=" flex justify-between">
                <div class="flex gap-3 pb-2">
                    <input id="checkbox-${todo.stt}" class="w-5 h-5 cursor-pointer mt-2" type="checkbox">
                    <div id="mainchecked-${todo.stt}" class="w-5 h-5 flex justify-center items-center border border-gray-300 rounded-full mt-2 ${todo.checked ? 'bg-teal-300' : ''}">
                        <i class="fa-solid fa-check text-white"></i>
                    </div>
                    <div class="flex flex-col gap-3">
                        <div class="todo-info rounded-lg p-1 hover:bg-gray-100 cursor-pointer">
                            <h4 class="w-full text-sm font-bold leading-none pt-2 pb-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[400px] ${todo.checked ? 'line-through' : ''}">${todo.name}</h4>
                            <p class="w-full text-sm font-normal leading-loose pt-2 pb-2 max-w-[400px] line-clamp-4 ${todo.checked ? 'line-through' : ''}">${todo.description}</p>
                        </div>
                        <div class="w-full flex gap-3">
                        ${dueDateHTML}
                        ${priorityHTML}
                        </div>
                    </div>
                </div>
                <div class="relative inline-block">
                    <div id="dropdownButton-${todo.stt}" class="relative w-6 h-6 flex justify-center items-center rounded-[5px] cursor-pointer">
                        <i class="fa-solid fa-ellipsis-vertical"></i>
                    </div>
                    <ul id="dropdownMenu-${todo.stt}" class="hidden absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <li class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Edit</li>
                                    <li class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">Delete</li>
                    </ul>
                </div>
            </div>
    `;

    // Thêm subtask vào todo
    const subtasksContainer = document.createElement('div');
    subtasksContainer.className = 'flex flex-col gap-2 pl-20 pr-20 pb-2 pt-2';

    // Kiểm tra và thêm subtask vào container
    if (todo.subtasks && todo.subtasks.length > 0) {
        todo.subtasks.forEach((subtask, index) => {
            const subtaskDiv = document.createElement('div');
            subtaskDiv.className = 'flex justify-between items-center gap-3';

            const subtaskDueDateHTML = subtask.dueDate ? `
            <div class="h-[32px] flex rounded-lg px-2 gap-1">
                <p class="italic text-gray-400 text-xs font-light leading-[18px] py-2">#</p>
                <input type="date" class="italic text-green-500 text-xs font-light leading-[18px]" readonly value="${subtask.dueDate}">
            </div>
            ` : '';

            const subtaskPriorityHTML = subtask.priority ? `
            <div class="h-[32px] flex gap-1 px-4 py-2 rounded-md text-xs font-light leading-[18px]">
                <img src="${getPriorityData(subtask.priority).imgSrc}" alt="">
                <div class="italic">${getPriorityData(subtask.priority).text}</div>
            </div>
            ` : '';

            subtaskDiv.innerHTML = `
            <div class="flex justify-center items-center gap-3">
                <input id="checkbox-${todo.stt}-${subtask.stt}" class="w-5 h-5 cursor-pointer" type="checkbox">
                <div id="subchecked-${todo.stt}-${subtask.stt}" class="w-5 h-5 flex justify-center items-center border border-gray-300 rounded-full ${subtask.checked ? 'bg-teal-300' : ''}">
                    <i class="fa-solid fa-check text-white"></i>
                </div>            
                <p class=" text-sm font-normal leading-none pt-2 pb-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px] ${subtask.checked ? 'line-through' : ''}">${subtask.name}</p>
            </div>
            <div class ="flex ">
                <div>
                    <p class="h-full text-gray-400 text-sm font-normal leading-none p-2 whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px] italic">${subtask.description}</p>
                </div>
                ${subtaskDueDateHTML}
                ${subtaskPriorityHTML}
            </div>
        `;
            subtasksContainer.appendChild(subtaskDiv);
        });

        // Thêm sự kiện delegation cho container
        subtasksContainer.addEventListener('change', (event) => {
            const target = event.target;

            // Kiểm tra xem sự kiện có phải là từ checkbox không
            if (target.tagName === 'INPUT' && target.type === 'checkbox') {
                // Tìm chỉ số và tên của subtask
                const [_, stt, subtaskStt] = target.id.split('-');
                const subtaskName = subtasksContainer.querySelector(`#subchecked-${stt}-${subtaskStt}`).nextElementSibling.textContent.trim();

                // Cập nhật mảng checkedItems
                updateCheckedItems('subtask', parseInt(stt, 10), parseInt(subtaskStt, 10), target.checked);
                checkCompletionStatus(checkedItems, todos);
            }
        });
    }

    todoDiv.appendChild(subtasksContainer);

    // Thêm todo vào container
    document.getElementById('todos-container').appendChild(todoDiv);

    // Gán sự kiện cho checkbox của todo
    const todoCheckbox = todoDiv.querySelector(`#checkbox-${todo.stt}`);
    todoCheckbox.addEventListener('change', (event) => {
        updateCheckedItems('todo', todo.stt, null, event.target.checked);
        checkCompletionStatus(checkedItems, todos);
    });

    // Gán sự kiện cho nút và menu dropdown
    const dropdownButton = document.getElementById(`dropdownButton-${todo.stt}`);
    const dropdownMenu = document.getElementById(`dropdownMenu-${todo.stt}`);

    dropdownButton.addEventListener('click', (event) => {
        event.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (event) => {
        if (!dropdownButton.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    dropdownMenu.addEventListener('click', (event) => {
        if (event.target.tagName === 'LI') {
            const action = event.target.textContent.trim();
            if (action === 'Edit') {
                console.log('Edit action for todo with ID:', todo.stt);
                // Thực hiện hành động chỉnh sửa cho todo hiện tại
                populateEditModal(todo.stt);
            } else if (action === 'Delete') {
                console.log('Delete action for todo with ID:', todo.stt);
                setupDeleteConfirmation(todo.stt);
            }
            dropdownMenu.classList.add('hidden');
        }
    });

    // Thêm sự kiện dblclick vào div chứa h4 và p
    const todoContainer = todoDiv.querySelector('.todo-info');
    todoContainer.addEventListener('dblclick', () => {
        populateEditModal(parseInt(todo.stt, 10));
    });
}

// Hàm để hiển thị tất cả todos
function renderTodos() {
    todos = loadFromLocalStorage();
    document.getElementById('todos-container').innerHTML = '';
    todos.forEach(todo => showTodo(todo));
    updateTodosCount(todos);
    checkedItems = [];
}

renderTodos();

// Cập nhật dữ liệu hình ảnh và văn bản dựa trên priority
function getPriorityData(priority) {
    const priorityData = {
        0: {
            imgSrc: 'img/Content/BsFlag.svg',
            text: 'Priority'
        },
        1: {
            imgSrc: 'img/Content/BsFlagRed.svg',
            text: 'P1'
        },
        2: {
            imgSrc: 'img/Content/BsFlagOrange.svg',
            text: 'P2'
        },
        3: {
            imgSrc: 'img/Content/BsFlagBlue.svg',
            text: 'P3'
        },
        4: {
            imgSrc: 'img/Content/BsFlagGreen.svg',
            text: 'P4'
        }
    };

    return priorityData[priority] || {
        imgSrc: 'img/Content/BsFlag.svg',
        text: 'Priority'
    };
}

// Gán sự kiện dropdown cho container chỉ định
function setupPrioritySelection(container) {
    const selectedPriority = container.querySelector('.selected-priority');
    const priorityOptions = container.querySelector('.priority-options');

    selectedPriority.addEventListener('click', function () {
        priorityOptions.classList.toggle('hidden');
    });

    priorityOptions.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI' || event.target.tagName === 'IMG') {
            selectedPriority.innerHTML = event.target.closest('li').innerHTML;
            priorityOptions.classList.add('hidden');
            // Cập nhật giá trị data-priority trong sự kiện này
            const priorityValue = event.target.closest('li').getAttribute('data-priority');
            selectedPriority.setAttribute('data-priority', priorityValue);
        }
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', function (event) {
        if (!selectedPriority.contains(event.target) && !priorityOptions.contains(event.target)) {
            priorityOptions.classList.add('hidden');
        }
    });
}

// Reset priority
function resetPriority(container) {
    const defaultPriority = 0;
    const defaultData = getPriorityData(defaultPriority);

    const selectedPriority = container.querySelector('.selected-priority');
    const priorityOptions = container.querySelector('.priority-options');

    if (selectedPriority && priorityOptions) {
        selectedPriority.innerHTML = `
            <img src="${defaultData.imgSrc}" alt="">
            <div>${defaultData.text}</div>
        `;

        selectedPriority.setAttribute('data-priority', defaultPriority);

        priorityOptions.classList.add('hidden');
    }
}

// Hàm để thêm hoặc xóa item khỏi mảng
function updateCheckedItems(type, todoStt, subtaskStt, checked) {
    if (type === 'todo') {
        // Xử lý cho todo
        const existingIndex = checkedItems.findIndex(item => item.type === 'todo' && item.todoStt === todoStt);
        if (checked) {
            if (existingIndex === -1) {
                checkedItems.push({ type: 'todo', todoStt });
            }
        } else {
            if (existingIndex !== -1) {
                checkedItems.splice(existingIndex, 1);
            }
        }
    } else if (type === 'subtask') {
        // Xử lý cho subtask
        const existingIndex = checkedItems.findIndex(item => item.type === 'subtask' && item.todoStt === todoStt && item.subtaskStt === subtaskStt);
        if (checked) {
            if (existingIndex === -1) {
                checkedItems.push({ type: 'subtask', todoStt, subtaskStt });
            }
        } else {
            if (existingIndex !== -1) {
                checkedItems.splice(existingIndex, 1);
            }
        }
    }
    console.log('Checked items:', checkedItems);
}


// Hàm xóa todo
function deleteTodoByStt(stt) {
    const index = todos.findIndex(todo => todo.stt === stt);

    if (index !== -1) {
        todos.splice(index, 1);
        saveToLocalStorage(todos);
        renderTodos();
    } else {
        console.error('Todo with the given stt not found');
    }
}

// Hàm để mark hoặc unmark các items trong todos dựa trên checkedItems
function markCompleted() {
    checkedItems.forEach(item => {
        if (item.type === 'todo') {
            // Tìm todo theo stt và cập nhật thuộc tính checked
            const todo = todos.find(t => t.stt === item.todoStt);
            if (todo) {
                todo.checked = !todo.checked; // Mark hoặc unmark
                saveToLocalStorage(todos);
                renderTodos();
            }
        } else if (item.type === 'subtask') {
            // Tìm todo và subtask theo stt, sau đó cập nhật thuộc tính checked
            const todo = todos.find(t => t.stt === item.todoStt);
            if (todo && todo.subtasks) {
                // Tìm subtask theo stt
                const subtask = todo.subtasks.find(s => s.stt === item.subtaskStt);
                if (subtask) {
                    subtask.checked = !subtask.checked; // Mark hoặc unmark
                    saveToLocalStorage(todos);
                    renderTodos();
                }
            }
        }
    });
}

// Hàm để xóa các items trong todos dựa trên checkedItems
function deleteCheckedItems() {
    // Xóa todo hoặc subtask theo kiểu 'reverse'
    for (let i = checkedItems.length - 1; i >= 0; i--) {
        const item = checkedItems[i];
        if (item.type === 'todo') {
            // Tìm và xóa todo theo stt
            const todoIndex = todos.findIndex(t => t.stt === item.todoStt);
            if (todoIndex > -1) {
                // Xóa todo khỏi mảng todos
                todos.splice(todoIndex, 1);
            }
        } else if (item.type === 'subtask') {
            // Tìm todo theo stt
            const todo = todos.find(t => t.stt === item.todoStt);
            if (todo && todo.subtasks) {
                // Tìm và xóa subtask theo stt
                const subtaskIndex = todo.subtasks.findIndex(s => s.stt === item.subtaskStt);
                if (subtaskIndex > -1) {
                    // Xóa subtask khỏi mảng subtasks
                    todo.subtasks.splice(subtaskIndex, 1);
                }
            }
        }
    }
    // Lưu và render lại sau khi xóa
    saveToLocalStorage(todos);
    renderTodos();
}


// Tìm todo theo stt và hiển thị dữ liệu vào form edit
function populateEditModal(todoStt) {
    const todo = todos.find(t => t.stt === todoStt);

    if (!todo) {
        console.error('Todo not found');
        return;
    }

    // Cập nhật thông tin trong modal
    const modal = document.getElementById('editModal');
    const inputs = modal.querySelectorAll('input');
    const priorityElement = modal.querySelector('.selected-priority');

    modal.setAttribute('data-todo-stt', todoStt);

    document.getElementById('todoname').textContent = todo.name;


    // Cập nhật trạng thái của checkbox
    const checkbox = document.getElementById('mainchecked-edit');
    checkbox.checked = todo.checked;

    // Cập nhật các trường nhập liệu
    inputs[1].value = todo.name;
    inputs[2].value = todo.description;
    document.getElementById('datepicker-edit').value = todo.dueDate;

    // Cập nhật Priority
    const priorityEdit = document.getElementById('priority-edit');
    const priorityEditElement = priorityEdit.querySelector('.selected-priority');
    const priorityOptions = priorityEdit.querySelectorAll('.priority-options li');
    priorityOptions.forEach(option => {
        if (option.getAttribute('data-priority') == todo.priority) {
            priorityEditElement.innerHTML = option.innerHTML;
            priorityEditElement.setAttribute('data-priority', todo.priority);
        }
    });

    // Cập nhật Subtasks 
    const subtaskEditContainer = document.getElementById('subtaskedit');
    subtaskEditContainer.innerHTML = ''; // Xóa các subtask hiện tại
    document.getElementById('subtaskadd').innerHTML = '';
    if (todo.subtasks.length > 0) {
        todo.subtasks.forEach((subtask, index) => {
            const subtaskDiv = document.createElement('div');
            subtaskDiv.className = 'flex justify-between gap-3 pl-4 pr-4 border-b-2 border-gray-200 mb-2';
            subtaskDiv.dataset.index = index;

            subtaskDiv.innerHTML = `
            <div class="flex gap-3 pb-2">
                <div class="inline-flex items-start">
                    <label class="flex items-center cursor-pointer relative mt-1">
                        <input id="checked-${todo.stt}-${index}" type="checkbox" ${subtask.checked ? 'checked' : ''} class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full shadow hover:shadow-md border border-slate-300 checked:bg-teal-300 checked:border-teal-300" />
                        <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" stroke-width="1">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                        </span>
                    </label>
                </div>                    
                <div class="flex flex-col gap-3">
                    <div class="flex flex-col gap-1">
                        <input id="name-${todo.stt}-${index}" class="w-full text-xs font-normal leading-none p-2 bg-gray-100 rounded-md whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" type="text" value="${subtask.name}">
                        <input id="description-${todo.stt}-${index}" class="w-full text-xs font-normal leading-none p-2 bg-gray-100 rounded-md whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" type="text" value="${subtask.description}" placeholder="Description">
                    </div>
                    <div class="w-full flex gap-3">
                        <div class="h-[32px] flex border border-gray-300 rounded-lg p-2 gap-1">
                            <input id="dueDate-${todo.stt}-${index}" type="date" class="text-green-500 text-xs font-light leading-[18px] cursor-pointer" value="${subtask.dueDate}">
                        </div>
                        <div data-priority="${subtask.priority}" id="priority-${todo.stt}-${index}" class="relative inline-block text-xs font-light leading-[18px]">
                            <div data-priority="${subtask.priority}" id="SLpriority-${todo.stt}-${index}" class="h-[32px] selected-priority flex gap-1 border border-gray-300 px-4 py-2 rounded-md text-xs font-light leading-[18px] cursor-pointer hover:bg-gray-100 active:bg-gray-200">
                                <img src="${getPriorityData(subtask.priority).imgSrc}" alt="">
                                <div>${getPriorityData(subtask.priority).text}</div>
                            </div>
                            <ul
                                class="priority-options absolute mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg hidden z-50">
                                <li class="priority-options li flex gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    data-priority="1">
                                    <img src="img/Content/BsFlagRed.svg" alt="">
                                    P1
                                </li>
                                <li class="priority-options li flex gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    ata-priority="2">
                                    <img src="img/Content/BsFlagOrange.svg" alt="">
                                    P2
                                </li>
                                <li class="priority-options li flex gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    data-priority="3">
                                    <img src="img/Content/BsFlagBlue.svg" alt="">
                                    P3
                                </li>
                                <li class="priority-options li flex gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    data-priority="4">
                                    <img src="img/Content/BsFlagGreen.svg" alt="">
                                    P4
                                </li>
                                                    </ul>         
                        </div>
                    </div>
                </div>
            </div>
        `;
            subtaskEditContainer.appendChild(subtaskDiv);
            // Thiết lập sự kiện chọn priority cho từng subtask
            const priorityContainer = document.getElementById(`priority-${todo.stt}-${index}`);
            setupPrioritySelection(priorityContainer);
        });
    }

    // Chức năng xóa cho Trash
    document.getElementById('delete-edit').addEventListener('click', () => {
        setupDeleteConfirmation(todo.stt);
    })

    // Hiển thị modal
    modal.classList.remove('hidden');
}

// Hàm gán sự kiện hiển thị modal delete cho dropdown và trash
function setupDeleteConfirmation(stt) {
    selectedEdit = parseInt(stt, 10);
    const confirmDeleteBtn = document.getElementById('confirmDelete-edit');
    const cancelDeleteBtn = document.getElementById('cancelDelete-edit');
    const confirmModal = document.getElementById('confirmModal-edit');
    const modal = document.getElementById('editModal');

    // Xóa các sự kiện cũ trước khi gán mới
    confirmDeleteBtn.removeEventListener('click', handleConfirmDelete);
    cancelDeleteBtn.removeEventListener('click', handleCancelDelete);
    confirmModal.removeEventListener('click', handleModalClick);

    document.getElementById('confirmModal-edit').classList.remove('hidden');

    // Định nghĩa các hàm xử lý sự kiện
    function handleConfirmDelete() {
        // Kiểm tra trạng thái của modal và thay đổi lớp
        if (modal.classList.contains('hidden')) {
        } else {
            modal.classList.add('hidden'); // Ẩn modal nếu nó đang hiển thị
        }

        deleteTodoByStt(selectedEdit);
        confirmModal.classList.add('hidden');
    }

    function handleCancelDelete() {
        confirmModal.classList.add('hidden');
    }

    function handleModalClick(event) {
        if (event.target === this) {
            confirmModal.classList.add('hidden');
        }
    }

    // Gán sự kiện cho các phần tử
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    cancelDeleteBtn.addEventListener('click', handleCancelDelete);
    confirmModal.addEventListener('click', handleModalClick);
}

// Tìm stt lớn nhất của substasks trong 1 todos được chỉ định
function findMaxSubtaskStt(todoStt) {
    const todo = todos.find(todo => todo.stt === todoStt);

    if (!todo) {
        console.error(`Todo with stt ${todoStt} not found.`);
        return;
    }

    const maxSubtaskStt = todo.subtasks.reduce((max, subtask) => {
        return Math.max(max, subtask.stt);
    }, 0);

    return maxSubtaskStt;
}

// In ra số lượng todo đã hoàn thành/tổng todos
function updateTodosCount(todos) {
    // Tính tổng số todos
    let totalTodos = todos.length;

    // Tính tổng số todos đã hoàn thành
    let completedTodos = todos.filter(todo => todo.checked).length;

    // Cập nhật nội dung cho các phần tử HTML
    document.getElementById('comlTodos').innerText = completedTodos;
    document.getElementById('allTodos').innerText = totalTodos;
}

// Sự kiện search
document.getElementById('searchInput').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const searchValue = this.value.trim();
        if (searchValue) {
            todos = loadFromLocalStorage();
            document.getElementById('todos-container').innerHTML = '';
            searchTask(searchValue);
            checkedItems = [];

            this.value = '';

            document.getElementById('showall-btn').classList.remove('hidden');
        }
    }
});

// Sự kiện cho button Show all
document.getElementById('showall-btn').addEventListener('click', () => {
    document.getElementById('showall-btn').classList.add('hidden');
    renderTodos();
})

// Hàm search
function searchTask(query) {
    const lowerCaseQuery = query.toLowerCase();

    const results = todos.filter(todo => {
        const titleMatches = todo.name.toLowerCase().includes(lowerCaseQuery);
        const descriptionMatches = todo.description.toLowerCase().includes(lowerCaseQuery);

        const subtaskMatches = todo.subtasks.some(subtask =>
            subtask.name.toLowerCase().includes(lowerCaseQuery) ||
            subtask.description.toLowerCase().includes(lowerCaseQuery)
        );

        return titleMatches || descriptionMatches || subtaskMatches;
    });

    if (results.length > 0) {
        results.forEach(todo => showTodo(todo));
    }

    return results;
}


// MARK COMPLETED
// Gán sự kiện cho nút "Mark Completed"
document.getElementById('mark-btn').addEventListener('click', () => {
    if (checkedItems.length === 0) {
        return;
    }
    showMarkModal();
});

const showMarkModal = () => {
    const modal = document.getElementById('confirmModal-Mark');
    modal.classList.remove('hidden');
};

const hideMarkModal = () => {
    const modal = document.getElementById('confirmModal-Mark');
    modal.classList.add('hidden');
}

document.getElementById('confirmMark').addEventListener('click', () => {
    markCompleted();
    checkedItems = [];
    hideMarkModal();
})

document.getElementById('cancelMark').addEventListener('click', () => {
    hideMarkModal();
})

document.getElementById('confirmModal-Mark').addEventListener('click', function (event) {
    if (event.target === this) {
        hideMarkModal();
    }
});

function checkCompletionStatus(checkedItems, todos) {
    let allChecked = true;
    let allUnchecked = true;

    // Duyệt qua từng phần tử trong checkedItems để kiểm tra trong todos
    checkedItems.forEach(item => {
        if (item.type === 'todo') {
            const todo = todos.find(t => t.stt === item.todoStt);
            if (todo) {
                if (todo.checked) {
                    allUnchecked = false;
                } else {
                    allChecked = false;
                }
            }
        } else if (item.type === 'subtask') {
            const todo = todos.find(t => t.stt === item.todoStt);
            if (todo) {
                const subtask = todo.subtasks.find(st => st.stt === item.subtaskStt);
                if (subtask) {
                    if (subtask.checked) {
                        allUnchecked = false;
                    } else {
                        allChecked = false;
                    }
                }
            }
        }
    });

    // Cập nhật nội dung của <span id="Mark-text"></span>
    const markTextElement = document.getElementById("Mark-text");
    const markTextBtn = document.getElementById('markText-btn');

    if (allChecked && !allUnchecked) {
        markTextElement.textContent = "uncompleted";
        markTextBtn.textContent = "Mark Uncompleted";
    } else if (!allChecked && !allUnchecked) {
        markTextElement.textContent = "completed/uncompleted";
        markTextBtn.textContent = "Mark Comp/Uncomp";
    } else if (allUnchecked && !allChecked) {
        markTextElement.textContent = "completed";
        markTextBtn.textContent = "Mark Completed";
    } else {
        markTextElement.textContent = "";
    }
}

// DELETE MODAL
// Hiển thị modal
function showConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('hidden');
}

// Ẩn modal
function hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hidden');
}

// Khi nhấn vào nút "Delete"
document.getElementById('delete-btn').addEventListener('click', () => {
    if (checkedItems.length === 0) {
        return;
    }
    showConfirmModal();
});

// Khi người dùng xác nhận xóa
document.getElementById('confirmDelete').addEventListener('click', () => {
    deleteCheckedItems();
    checkedItems = [];
    hideConfirmModal();
    console.log('Todos after deletion:', todos);
});

// Khi người dùng hủy xóa
document.getElementById('cancelDelete').addEventListener('click', () => {
    hideConfirmModal();
});

// Gán sự kiện cho background của modal để đóng khi click vào
document.getElementById('confirmModal').addEventListener('click', function (event) {
    if (event.target === this) {
        hideConfirmModal();
    }
});

// FORM ADD TASK
// Priority selection
document.addEventListener("DOMContentLoaded", function () {
    // Cấu hình priority cho form thêm
    setupPrioritySelection(document.getElementById('addTaskForm'));

    // Cấu hình priority cho modal chỉnh sửa
    setupPrioritySelection(document.getElementById('AddsubtaskForm'));

    setupPrioritySelection(document.getElementById('priority-edit'));
});


document.addEventListener('click', function (event) {
    if (event.target.closest('.priority-options li')) {
        const option = event.target.closest('li');
        const priorityValue = option.getAttribute('data-priority');
        const priorityText = option.innerText.trim();

        // Tìm phần tử selected-priority trong cùng container
        const priorityElement = option.closest('.priority-selection').querySelector('.selected-priority');
        priorityElement.querySelector('img').src = option.querySelector('img').src;
        priorityElement.innerText = priorityText;
        priorityElement.setAttribute('data-priority', priorityValue);

        option.parentElement.classList.add('hidden');
    }
});


// Dropdown edit và delete
document.addEventListener('click', function (event) {
    var dropdownButton = document.getElementById('dropdownButton');
    var dropdownMenu = document.getElementById('dropdownMenu');

    // Kiểm tra nếu click vào nút dropdownButton
    if (dropdownButton.contains(event.target)) {
        dropdownMenu.classList.toggle('hidden');
    } else {
        // Đóng dropdown nếu click ra ngoài
        dropdownMenu.classList.add('hidden');
    }
});

// Add task
document.getElementById('AddTask-btn').addEventListener('click', () => {
    const form = document.getElementById('addTaskForm');
    const addTaskBtn = document.getElementById('AddTask-btn');

    form.classList.remove('hidden');  // Hiển thị form
    addTaskBtn.classList.add('hidden'); // Ẩn thẻ AddTask-btn

    // Cuộn xuống phần tử form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('Cancel-btn').addEventListener('click', (event) => {
    event.preventDefault(); // Ngăn chặn hành động mặc định của nút
    const form = document.getElementById('addTaskForm');
    const addTaskBtn = document.getElementById('AddTask-btn');

    document.getElementById('addTaskForm').reset();
    resetPriority(form);

    form.classList.add('hidden');
    addTaskBtn.classList.remove('hidden');
});

// Ngăn chặn hành vi mặc định của phím Enter
document.querySelectorAll('#addTaskForm input[type="text"], #addTaskForm input[type="date"]').forEach(input => {
    input.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});

// Thêm một todo
document.getElementById('addTaskForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form

    // Lấy dữ liệu từ các trường nhập liệu
    const taskName = this.querySelector('input[type="text"][placeholder="Task name"]').value.trim();
    const description = this.querySelector('input[type="text"][placeholder="Description"]').value.trim();
    const dueDate = this.querySelector('input[type="date"]').value;
    const priorityElement = this.querySelector('.selected-priority');
    const priority = priorityElement.getAttribute('data-priority');

    // Kiểm tra nếu taskName trống
    if (!taskName) {
        alert('Please enter the task name.');
        return;
    }

    let maxStt = todos.reduce((max, todo) => Math.max(max, todo.stt), 0) + 1;

    // Tạo đối tượng todo mới
    const newTodo = {
        stt: maxStt,
        name: taskName,
        description: description,
        dueDate: dueDate,
        priority: parseInt(priority, 10),
        checked: false,
        subtasks: []
    };

    todos.push(newTodo);

    saveToLocalStorage(todos);
    renderTodos();

    this.reset();
    // Reset lại giá trị của priority
    priorityElement.innerHTML = `
        <img src="img/Content/BsFlag.svg" alt="">
        Priority
    `;
    priorityElement.setAttribute('data-priority', '');

    this.classList.add('hidden');
    document.getElementById('AddTask-btn').classList.remove('hidden');
});


// EDIT MODAL
// Ngăn chặn hành vi mặc định của phím Enter trong form thêm subtask
document.querySelectorAll('#AddsubtaskForm input[type="text"], #AddsubtaskForm input[type="date"]').forEach(input => {
    input.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    });
});

// Add subtask
document.getElementById('AddSubTask-btn').addEventListener('click', () => {
    const addSubForm = document.getElementById('AddsubtaskForm');
    const addSubBtn = document.getElementById('AddSubTask-btn');

    addSubForm.classList.remove('hidden');
    addSubBtn.classList.add('hidden');

    addSubForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Thêm sự kiện click cho nút SaveAddSup
document.getElementById('SaveAddSup').addEventListener('click', (event) => {
    event.preventDefault();
    const inputField = document.getElementById('subtaskInput');
    const subtaskName = document.getElementById('subtaskInput').value.trim();
    const subtaskDesField = document.getElementById('subtaskDes');
    const subtaskDes = document.getElementById('subtaskDes').value.trim();
    const subtaskDateField = document.getElementById('subtaskDate');
    const subtaskDate = document.getElementById('subtaskDate').value;
    const addSubForm = document.getElementById('AddsubtaskForm');
    const addSubBtn = document.getElementById('AddSubTask-btn');
    const subtaskField = document.getElementById('subtaskadd');
    const priorityElement = addSubForm.querySelector('.selected-priority');
    const priority = priorityElement.getAttribute('data-priority');


    if (subtaskName) {
        let maxSttSubItem = subtaskitems.reduce((max, subtaskitem) => Math.max(max, subtaskitem.stt), 0) + 1;

        subtaskitems.push({
            stt: maxSttSubItem,
            name: subtaskName,
            checked: false,
            description: subtaskDes,
            dueDate: subtaskDate,
            priority: parseInt(priority, 10),
        });

        // Tạo phần tử div cho subtask mới
        const subtaskDiv = document.createElement('div');
        subtaskDiv.className = 'flex justify-between gap-3 pl-4 pr-4 border-b-2 border-gray-200 mb-2';
        subtaskDiv.innerHTML = `
        <div class="flex gap-3 pb-2">            
            <div class="inline-flex items-start">
                <label class="flex items-center cursor-pointer relative mt-1">
                    <input id="checkedNewSub-${maxSttSubItem}" type="checkbox" class="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded-full shadow hover:shadow-md border border-slate-300 checked:bg-teal-300 checked:border-teal-300" />
                    <span class="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" stroke-width="1">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                    </span>
                </label>
            </div>
            <div class="flex flex-col gap-3">
                <div class= "flex flex-col gap-1">
                    <input id="nameNewSub-${maxSttSubItem}" class="w-full text-xs font-normal leading-none p-2 rounded-md bg-gray-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" type="text" value="${subtaskName}">
                    <input id="desNewSub-${maxSttSubItem}" class="w-full text-xs font-normal leading-none p-2 rounded-md bg-gray-100 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" type="text" value="${subtaskDes}">
                </div>
                <div class="w-full flex gap-3">
                    <div class="h-[32px] flex border border-gray-300 rounded-lg p-2 gap-1">
                        <input id="dateNewSub-${maxSttSubItem}" type="date" class="text-green-500 text-xs font-light leading-[18px] cursor-pointer" value="${subtaskDate}">
                    </div>
                    <div id="priNewSub-${maxSttSubItem}" class="relative inline-block text-xs font-light leading-[18px]">
                        <div id="SLpriNewSub-${maxSttSubItem}" data-priority=${parseInt(priority, 10)}" class="h-[32px] selected-priority flex gap-1 border border-gray-300 px-4 py-2 rounded-md text-xs font-light leading-[18px] cursor-pointer hover:bg-gray-100 active:bg-gray-200">
                            <img src="${getPriorityData(parseInt(priority, 10)).imgSrc}" alt="">
                            <div>${getPriorityData(parseInt(priority, 10)).text}</div>
                        </div>
                        <ul
                                class="priority-options absolute mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg hidden z-50">
                                <li class="priority-options li flex gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    data-priority="1">
                                    <img src="img/Content/BsFlagRed.svg" alt="">
                                    P1
                                </li>
                                <li class="priority-options li flex gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    ata-priority="2">
                                    <img src="img/Content/BsFlagOrange.svg" alt="">
                                    P2
                                </li>
                                <li class="priority-options li flex gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    data-priority="3">
                                    <img src="img/Content/BsFlagBlue.svg" alt="">
                                    P3
                                </li>
                                <li class="priority-options li flex gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    data-priority="4">
                                    <img src="img/Content/BsFlagGreen.svg" alt="">
                                    P4
                                </li>
                        </ul>          
                    </div>
                    <div class="h-[32px] flex items-center gap-1 text-center text-xs font-light leading-[18px] italic px-3 py-2 border border-yellow-300 rounded-lg">
                        <i class="fa-solid fa-fire text-yellow-300"></i>
                        <p>New</p>
                    </div>
                </div>
            </div>
        </div>
        `;
        subtaskField.appendChild(subtaskDiv);

        // Thiết lập sự kiện chọn priority cho từng subtask
        const priorityContainer = document.getElementById(`priNewSub-${maxSttSubItem}`);
        setupPrioritySelection(priorityContainer);

        addSubBtn.classList.remove('hidden');
        addSubForm.classList.add('hidden');
        inputField.value = '';
        subtaskDesField.value = '';
        subtaskDateField.value = '';

        console.log('Danh sách subtasks hiện tại:', subtaskitems);
    } else {
        console.log('Vui lòng nhập tên subtask.');
    }

    resetPriority(document.getElementById('AddsubtaskForm'));
});

// Cancel subtask
document.getElementById('CancelAddSup').addEventListener('click', (event) => {
    event.preventDefault();
    const addSubForm = document.getElementById('AddsubtaskForm');
    const addSubBtn = document.getElementById('AddSubTask-btn');
    const subtaskInput = addSubForm.querySelector('input[type="text"]');
    const subtaskDesField = document.getElementById('subtaskDes');
    const subtaskDate = document.getElementById('subtaskDate');

    resetPriority(addSubForm);

    addSubBtn.classList.remove('hidden');
    addSubForm.classList.add('hidden');
    subtaskInput.value = '';
    subtaskDesField.value = '';
    subtaskDate.value = '';
});

// Hủy edit
document.getElementById('CancelEdit-btn').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('editModal').classList.add('hidden');
    subtaskitems = [];
    resetPriority(document.getElementById('AddsubtaskForm'));
});

document.getElementById('close-edit').addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('editModal').classList.add('hidden');
    subtaskitems = [];
    resetPriority(document.getElementById('AddsubtaskForm'));
});

// Save edit
document.getElementById('SaveEdit-btn').addEventListener('click', function () {
    const modal = document.getElementById('editModal');
    const priorityEdit = document.getElementById('priority-edit');
    const todoStt = parseInt(modal.getAttribute('data-todo-stt'), 10);
    const todoIndex = todos.findIndex(t => t.stt === todoStt);

    if (todoIndex === -1) {
        console.error('Todo not found');
        return;
    }

    //Dữ liệu từ mảng subtaskitems
    let maxSttSubItem = subtaskitems.reduce((max, subtaskitem) => Math.max(max, subtaskitem.stt), 0);

    if (maxSttSubItem > 0) {
        for (let i = 1; i <= maxSttSubItem; i++) {
            const NewsubCheck = document.getElementById(`checkedNewSub-${i}`).checked;
            const NewsubName = document.getElementById(`nameNewSub-${i}`).value.trim();
            const NewsubDescription = document.getElementById(`desNewSub-${i}`).value.trim();
            const NewsubDate = document.getElementById(`dateNewSub-${i}`).value;
            const NewsubPriority = document.getElementById(`SLpriNewSub-${i}`).getAttribute('data-priority');

            // Tìm phần tử trong mảng subtaskitems có stt bằng với i
            const subtaskItem = subtaskitems.find(subtask => subtask.stt === i);

            if (subtaskItem) {
                // Cập nhật các giá trị mới vào phần tử đó
                subtaskItem.checked = NewsubCheck;
                subtaskItem.name = NewsubName;
                subtaskItem.description = NewsubDescription;
                subtaskItem.dueDate = NewsubDate;
                subtaskItem.priority = parseInt(NewsubPriority, 10);
            }
        }
    }

    // Lấy dữ liệu từ modal
    const inputs = modal.querySelectorAll('input');
    const priority = priorityEdit.querySelector('.selected-priority').getAttribute('data-priority');
    // Tìm stt lớn nhất của subtasks hiện tại
    const maxSubtaskStt = findMaxSubtaskStt(todoStt);

    // Console log subtasks trước khi khởi tạo lại
    console.log('Subtasks trước khi khởi tạo lại:', todos[todoIndex].subtasks);

    // Cập nhật thông tin của todo
    todos[todoIndex] = {
        ...todos[todoIndex],
        name: inputs[1].value,
        description: inputs[2].value,
        dueDate: document.getElementById('datepicker-edit').value,
        priority: parseInt(priority, 10),
        checked: document.getElementById('mainchecked-edit').checked,
        subtasks: [] // Khởi tạo danh sách subtasks mới
    };
    // Console log subtasks sau khi khởi tạo lại
    console.log('Subtasks sau khi khởi tạo lại:', todos[todoIndex].subtasks);

    // Lấy các subtasks từ modal và tạo stt mới
    const subtaskEditContainer = document.getElementById('subtaskedit');
    const subtaskDivs = subtaskEditContainer.querySelectorAll('.flex');

    // Xóa danh sách subtasks cũ để không bị trùng lặp
    todos[todoIndex].subtasks = [];

    // Lặp qua từng subtask div và lấy dữ liệu
    subtaskDivs.forEach((div) => {
        const subtaskIndex = div.dataset.index; // Đổi tên biến từ index thành subtaskIndex
        const subtaskNameInput = div.querySelector(`#name-${todoStt}-${subtaskIndex}`);
        const subtaskDescriptionInput = div.querySelector(`#description-${todoStt}-${subtaskIndex}`);
        const subtaskDueDateInput = div.querySelector(`#dueDate-${todoStt}-${subtaskIndex}`);
        const subtaskPriorityDiv = div.querySelector(`#SLpriority-${todoStt}-${subtaskIndex}`);
        const subtaskCheckedDiv = div.querySelector(`#checked-${todoStt}-${subtaskIndex}`);

        if (subtaskNameInput && subtaskDescriptionInput && subtaskDueDateInput && subtaskPriorityDiv && subtaskCheckedDiv) {
            const subtaskName = subtaskNameInput.value.trim();
            const subtaskDescription = subtaskDescriptionInput.value.trim();
            const subtaskDueDate = subtaskDueDateInput.value;
            const subtaskPriority = subtaskPriorityDiv.getAttribute('data-priority');
            const subtaskChecked = subtaskCheckedDiv.checked;

            if (subtaskName) {
                todos[todoIndex].subtasks.push({
                    stt: Number(subtaskIndex) + 1,
                    name: subtaskName,
                    description: subtaskDescription,
                    dueDate: subtaskDueDate,
                    priority: parseInt(subtaskPriority, 10),
                    checked: subtaskChecked
                });
            }
        } else {
            console.error('Subtask elements are missing or incorrectly configured');
        }
    });


    // Debug: Kiểm tra danh sách subtasks sau khi thêm mới
    console.log('Subtasks sau khi thêm mới:', todos[todoIndex].subtasks);

    let nextStt = findMaxSubtaskStt(todoStt);

    // Kiểm tra nếu subtaskitems không trống
    if (subtaskitems.length > 0) {
        subtaskitems.forEach(subtask => {
            todos[todoIndex].subtasks.push({
                name: subtask.name,
                stt: ++nextStt,
                checked: subtask.checked,
                description: subtask.description,
                dueDate: subtask.dueDate,
                priority: subtask.priority
            });
        });

        // Làm trống subtaskitems
        subtaskitems = [];
    }
    // Debug: Kiểm tra danh sách subtasks sau khi thêm mới
    console.log('Subtasks sau khi thêm mới:', todos[todoIndex].subtasks);

    // Đóng modal
    modal.classList.add('hidden');
    console.log(todos);

    resetPriority(document.getElementById('AddsubtaskForm'));

    saveToLocalStorage(todos);
    renderTodos();
});









