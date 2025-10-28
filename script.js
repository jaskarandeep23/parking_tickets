const endpoint = 'https://data.winnipeg.ca/resource/bhrt-29rb.json';


async function fetchTickets(searchTerm) {
// Build a case-insensitive query that searches offence_description or location
const where = `lower(offence_description) LIKE lower('%25${searchTerm}%25') OR lower(location) LIKE lower('%25${searchTerm}%25')`;
const order = 'set_fine_amount DESC'; // highest fine first
const limit = 100;