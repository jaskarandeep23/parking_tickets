const endpoint = 'https://data.winnipeg.ca/resource/bhrt-29rb.json';


async function fetchTickets(searchTerm) {
// Build a case-insensitive query that searches offence_description or location
const where = `lower(offence_description) LIKE lower('%25${searchTerm}%25') OR lower(location) LIKE lower('%25${searchTerm}%25')`;
const order = 'set_fine_amount DESC'; // highest fine first
const limit = 100;

const apiUrl = `${endpoint}?$where=${where}&$order=${encodeURIComponent(order)}&$limit=${limit}`;
errorEl.textContent = '';
resultsEl.innerHTML = '<p>Loading…</p>';


const query = document.getElementById('query').value.trim();
if (!query) {
errorEl.textContent = 'Please enter a search term.';
resultsEl.innerHTML = '';
return;
}


try {
const tickets = await fetchTickets(encodeURIComponent(query));
if (!tickets.length) {
resultsEl.innerHTML = '<p>No tickets found.</p>';
return;
}
renderTable(tickets);
} catch (err) {
resultsEl.innerHTML = '';
errorEl.textContent = 'Failed to load parking ticket data. Check console for details.';
}
});

function renderTable(data) {
const columns = ['ticket_number', 'contravention_date', 'location', 'offence_description', 'set_fine_amount', 'agency'];


const table = document.createElement('table');
const thead = document.createElement('thead');
const trHead = document.createElement('tr');
columns.forEach(col => {
const th = document.createElement('th');
th.textContent = col.replace(/_/g, ' ').toUpperCase();
trHead.appendChild(th);
});
thead.appendChild(trHead);
table.appendChild(thead);


const tbody = document.createElement('tbody');
data.forEach(row => {
const tr = document.createElement('tr');
columns.forEach(col => {
const td = document.createElement('td');
td.textContent = row[col] ?? '';
tr.appendChild(td);
});
tbody.appendChild(tr);
});
table.appendChild(tbody);


resultsEl.innerHTML = '';
resultsEl.appendChild(table);
}