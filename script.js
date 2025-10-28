const endpoint = 'https://data.winnipeg.ca/resource/bhrt-29rb.json';
const form = document.getElementById('search-form');
const queryInput = document.getElementById('query');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');

function setStatus(text) {
  statusEl.textContent = text || '';
}
function setError(text) {
  errorEl.textContent = text || '';
}
async function fetchTickets(searchTerm) {

  const select = [
    'ticket_number',
    'contravention_date',
    'location',
    'offence_description',
    'set_fine_amount',
    'agency'
  ].join(',');


  const where = `lower(offence_description) LIKE lower('%${searchTerm}%') OR lower(location) LIKE lower('%${searchTerm}%')`;

  const order = 'set_fine_amount DESC';
  const limit = 100;

  
  const params = [
    `$select=${encodeURIComponent(select)}`,
    `$where=${encodeURIComponent(where)}`,
    `$order=${encodeURIComponent(order)}`,
    `$limit=${limit}`
  ].join('&');

  const apiUrl = `${endpoint}?${params}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
     
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    
    console.error('fetchTickets error:', err);
    throw err;
  }
}

function renderTable(data) {
 
  const columns = [
    { key: 'ticket_number', label: 'Ticket #' },
    { key: 'contravention_date', label: 'Date' },
    { key: 'location', label: 'Location' },
    { key: 'offence_description', label: 'Offence' },
    { key: 'set_fine_amount', label: 'Fine ($)' },
    { key: 'agency', label: 'Agency' }
  ];

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  columns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.label;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  data.forEach(row => {
    const tr = document.createElement('tr');

    columns.forEach(col => {
      const td = document.createElement('td');
      
      let value = row[col.key];

      if (col.key === 'set_fine_amount') {
       
        let fine = 0;
        if (value !== undefined && value !== null && value !== '') {
          fine = Number(String(value).replace(/[^0-9.\-]/g, '')) || 0;
        }
 
        td.textContent = fine ? fine.toFixed(2) : '';
      } else if (col.key === 'contravention_date') {
      
        if (value) {
          const d = new Date(value);
          if (!Number.isNaN(d.getTime())) {
            td.textContent = d.toLocaleString(); 
          } else {
            td.textContent = value;
          }
        } else {
          td.textContent = '';
        }
      } else {
        td.textContent = (value !== undefined && value !== null) ? String(value) : '';
      }

      td.setAttribute('data-header', col.label);
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  resultsEl.innerHTML = '';
  resultsEl.appendChild(table);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  setError('');
  setStatus('');
  resultsEl.innerHTML = '';

  const rawQuery = queryInput.value.trim();
  if (!rawQuery) {
    setError('Please enter a search term.');
    return;
  }

  setStatus('Loading…');


  try {
    
    const data = await fetchTickets(rawQuery);
    setStatus('');

    if (!Array.isArray(data) || data.length === 0) {
      resultsEl.innerHTML = '<div class="empty">No tickets found for that search term.</div>';
      return;
    }


    renderTable(data);
  } catch (err) {
    setStatus('');
    setError('Failed to load parking ticket data. See console for details.');
  }
});

window.addEventListener('load', () => {
  queryInput.focus();
});
