// script.js

// Function to load data from a JSON file and return it as a promise
function loadJSON(file) {
    return new Promise((resolve, reject) => {
        fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => resolve(data))
            .catch(error => reject(error));
    });
}

// Function to display data in a table
function displayTable(data) {
    const table = document.createElement('table');
    const header = table.createTHead();
    const body = table.createTBody();

    // Assuming data is an array of objects
    const columns = Object.keys(data[0]);
    const row = header.insertRow();
    columns.forEach(col => {
        const th = document.createElement('th');
        th.innerText = col;
        row.appendChild(th);
    });

    data.forEach(item => {
        const row = body.insertRow();
        columns.forEach(col => {
            const cell = row.insertCell();
            cell.innerText = item[col];
        });
    });

    document.body.appendChild(table);
}

// Function to filter data based on input
function filterData(data, searchTerm) {
    return data.filter(item => {
        return Object.values(item).some(value => 
            value.toString().toLowerCase().includes(searchTerm.toLowerCase()));
    });
}

// Example usage
const jsonFile = 'data.json';  // Provide your JSON file path here
loadJSON(jsonFile)
    .then(data => {
        displayTable(data);
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search...';
        document.body.appendChild(searchInput);

        searchInput.addEventListener('input', () => {
            const filteredData = filterData(data, searchInput.value);
            document.body.innerHTML = '';  // Clear previous table
            displayTable(filteredData);
            document.body.appendChild(searchInput); // Add the input back
        });
    })
    .catch(error => console.error('Error loading JSON:', error));
