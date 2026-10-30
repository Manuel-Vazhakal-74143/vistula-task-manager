let supabaseUrl = '';
let supabaseKey = '';
let headers = {};

// 1. Load configuration first
fetch('config.json')
    .then(response => response.json())
    .then(config => {
        supabaseUrl = config.supabaseUrl;
        supabaseKey = config.supabasePublishableKey;
        headers = {
            'apikey': supabaseKey,
            'Authorization': 'Bearer ' + supabaseKey,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        };
        loadTasks();
    });

// 2. Read: Load and display tasks
function loadTasks() {
    fetch(supabaseUrl + '/rest/v1/tasks?select=*', { headers: headers })
        .then(response => response.json())
        .then(tasks => {
            const list = document.getElementById('task-list');
            list.innerHTML = '';

            for (let i = 0; i < tasks.length; i++) {
                let task = tasks[i];
                let div = document.createElement('div');
                div.className = 'task-item';
                div.setAttribute('data-id', task.id);

                let statusText = 'Incomplete';
                if (task.completed === true) {
                    statusText = 'Completed';
                }

                div.innerHTML = `
                    <p class="task-title"><strong>${task.title}</strong></p>
                    <p class="task-description">${task.description || ''}</p>
                    <p class="task-status">Status: ${statusText}</p>
                    <button class="edit-task" onclick="editTask(${task.id}, '${task.title}', '${task.description || ''}')">Edit</button>
                    <button class="toggle-task" onclick="toggleTask(${task.id}, ${task.completed})">Complete/Incomplete</button>
                    <button class="delete-task" onclick="deleteTask(${task.id})">Delete</button>
                    <hr>
                `;
                list.appendChild(div);
            }
        })
        .catch(error => {
            document.getElementById('status-message').innerText = 'Error loading tasks';
        });
}

// 3. Create: Add a new task
document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const title = document.getElementById('task-title').value;
    const desc = document.getElementById('task-description').value;

    fetch(supabaseUrl + '/rest/v1/tasks', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ title: title, description: desc, completed: false })
    }).then(response => {
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        loadTasks();
    }).catch(error => {
        document.getElementById('status-message').innerText = 'Error adding task';
    });
});

// 4. Update: Edit title and description
function editTask(id, oldTitle, oldDesc) {
    const newTitle = prompt("Enter new title:", oldTitle);
    if (!newTitle) return; // Exit if user cancels
    const newDesc = prompt("Enter new description:", oldDesc);

    fetch(supabaseUrl + '/rest/v1/tasks?id=eq.' + id, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ title: newTitle, description: newDesc })
    }).then(response => {
        loadTasks();
    });
}

// 5. Update: Toggle completion status
function toggleTask(id, currentStatus) {
    let newStatus = true;
    if (currentStatus === true) {
        newStatus = false;
    }

    fetch(supabaseUrl + '/rest/v1/tasks?id=eq.' + id, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify({ completed: newStatus })
    }).then(response => {
        loadTasks();
    });
}

// 6. Delete: Remove a task
function deleteTask(id) {
    fetch(supabaseUrl + '/rest/v1/tasks?id=eq.' + id, {
        method: 'DELETE',
        headers: headers
    }).then(response => {
        loadTasks();
    });
}