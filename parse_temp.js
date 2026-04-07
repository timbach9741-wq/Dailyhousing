import fs from 'fs';

const lines = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8').split('\n');
lines.forEach((line, i) => {
    if (line.includes("activeTab === 'products'")) {
        console.log(`${i+1}: ${line}`);
    }
});
