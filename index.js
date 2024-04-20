let timerInterval;
let startTime;

document.getElementById('startTimer').addEventListener('click', function() {
    if (document.getElementById('task').value.trim() === '') {
        document.getElementById('taskError').style.display = 'block';
        return;
    }
    document.getElementById('taskError').style.display = 'none';
    
    startTime = new Date().getTime();
    timerInterval = setInterval(updateTimer, 1000);
    document.getElementById('startTimer').style.display = 'none';
    document.getElementById('stopTimer').style.display = 'inline-block';
    displayRunningTask();
});

document.getElementById('stopTimer').addEventListener('click', function() {
    clearInterval(timerInterval);
    document.getElementById('startTimer').style.display = 'inline-block';
    document.getElementById('stopTimer').style.display = 'none';
    saveCompletedTask();
    displayCompletedTask();
    resetTimerAndInput();
    displayAnalytics(); // Update graph
});

document.getElementById('trackButton').addEventListener('click', function() {
    document.getElementById('trackSection').style.display = 'block';
    document.getElementById('analyticsSection').style.display = 'none';
});

document.getElementById('analyticsButton').addEventListener('click', function() {
    document.getElementById('trackSection').style.display = 'none';
    document.getElementById('analyticsSection').style.display = 'block';
    displayAnalytics();
});

function updateTimer() {
    let currentTime = new Date().getTime();
    let elapsedTime = currentTime - startTime;
    let hours = Math.floor((elapsedTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
    document.getElementById('timerDisplay').innerText = formatTime(hours) + ':' + formatTime(minutes) + ':' + formatTime(seconds);
}

function formatTime(time) {
    return time < 10 ? '0' + time : time;
}

function resetTimerAndInput() {
    document.getElementById('timerDisplay').innerText = '00:00:00';
    document.getElementById('task').value = '';
}

function displayRunningTask() {
    let task = document.getElementById('task').value;
    let startTimeString = new Date(startTime).toLocaleTimeString();
    let table = document.getElementById('runningTaskTable').getElementsByTagName('tbody')[0];
    let newRow = table.insertRow(table.rows.length);
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    let cell3 = newRow.insertCell(2);
    cell1.innerText = task;
    cell2.innerText = startTimeString;
    let deleteButton = document.createElement('button');
    deleteButton.innerText = 'Stop';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', function() {
        clearInterval(timerInterval);
        document.getElementById('startTimer').style.display = 'inline-block';
        document.getElementById('stopTimer').style.display = 'none';
        saveCompletedTask();
        displayCompletedTask();
        resetTimerAndInput();
        newRow.remove();
    });
    cell3.appendChild(deleteButton);
}

function saveCompletedTask() {
    let task = document.getElementById('task').value;
    let date = new Date().toLocaleDateString();
    let timeSpent = document.getElementById('timerDisplay').innerText;
    let table = document.getElementById('completedTaskTable').getElementsByTagName('tbody')[0];
    let newRow = table.insertRow(table.rows.length);
    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    let cell3 = newRow.insertCell(2);
    let cell4 = newRow.insertCell(3);
    cell1.innerText = task;
    cell2.innerText = date;
    cell3.innerText = timeSpent;
    let deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', function() {
        newRow.remove();
        displayAnalytics(); // Update graph when a task is removed
    });
    cell4.appendChild(deleteButton);
}

function displayCompletedTask() {
    document.getElementById('completedTaskTable').style.display = 'table';
}

function displayAnalytics() {
    let completedTasks = document.querySelectorAll('#completedTaskTable tbody tr');
    let weeklyData = {
        "Monday": 0,
        "Tuesday": 0,
        "Wednesday": 0,
        "Thursday": 0,
        "Friday": 0,
        "Saturday": 0,
        "Sunday": 0
    };
    completedTasks.forEach(function(task) {
        let date = new Date(task.children[1].innerText);
        let day = date.toLocaleDateString('en-US', { weekday: 'long' });
        let timeSpent = task.children[2].innerText.split(':');
        let hours = parseInt(timeSpent[0]);
        let minutes = parseInt(timeSpent[1]);
        let totalHours = hours + minutes / 60;
        weeklyData[day] += totalHours;
    });

    let labels = Object.keys(weeklyData);
    let data = Object.values(weeklyData);

    let ctx = document.getElementById('chartContainer').getContext('2d');
    if (window.myChart) {
        window.myChart.destroy(); // Destroy previous chart instance if exists
    }
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weekly Time Spent (hrs)',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

// Event delegation for delete button
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('delete-btn')) {
        let row = event.target.parentNode.parentNode;
        row.parentNode.removeChild(row);
        displayAnalytics(); // Update graph when a task is removed
    }
});
