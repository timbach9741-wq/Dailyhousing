const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/failed_history.json', 'utf8'));
const filtered = data.filter(d => !d.reason.includes('QuotaExceeded'));
fs.writeFileSync('data/failed_history.json', JSON.stringify(filtered, null, 2), 'utf8');
console.log('Filtered. Remaining:', filtered.length);
