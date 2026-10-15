const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 7.1 Pictures
const svgs = {
  'rain_school.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect width="200" height="150" fill="#cfd8dc"/>
    <path d="M50 100 L50 70 A30 30 0 0 1 110 70 L110 100" fill="none" stroke="#2c3e50" stroke-width="4"/>
    <line x1="20" y1="20" x2="10" y2="40" stroke="#90a4ae" stroke-width="2"/><line x1="60" y1="10" x2="50" y2="30" stroke="#90a4ae" stroke-width="2"/><line x1="100" y1="20" x2="90" y2="40" stroke="#90a4ae" stroke-width="2"/><line x1="140" y1="10" x2="130" y2="30" stroke="#90a4ae" stroke-width="2"/>
    <circle cx="80" cy="50" r="15" fill="#f1c40f"/><path d="M65 50 Q80 20 95 50" fill="#f39c12"/>
    <text x="50" y="130" font-family="sans-serif" font-size="12" font-weight="bold" fill="#2c3e50">SCHOOL ➔</text>
  </svg>`,

  'breakfast.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect width="200" height="150" fill="#faebd7"/>
    <circle cx="100" cy="60" r="25" fill="#ffb6c1"/> <!-- face -->
    <rect x="70" y="90" width="60" height="60" fill="#87ceeb"/> <!-- body -->
    <ellipse cx="100" cy="130" rx="50" ry="15" fill="#d3d3d3"/> <!-- table -->
    <circle cx="90" cy="125" r="10" fill="#fff"/> <!-- plate -->
    <rect x="110" y="115" width="10" height="15" fill="#f4a460"/> <!-- glass -->
    <text x="140" y="40" font-size="20">🥪 🥛</text>
  </svg>`,

  'clean_classroom.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect width="200" height="150" fill="#f0fff0"/>
    <rect x="20" y="20" width="60" height="40" fill="#2e8b57"/> <!-- blackboard -->
    <circle cx="100" cy="70" r="20" fill="#ffd700"/> <!-- face -->
    <rect x="85" y="90" width="30" height="60" fill="#4682b4"/> <!-- body -->
    <line x1="120" y1="100" x2="140" y2="150" stroke="#8b4513" stroke-width="4"/> <!-- broom -->
    <path d="M130 150 L150 150 L145 130 Z" fill="#deb887"/>
  </svg>`,

  'no_smoking.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="80" fill="none" stroke="#e74c3c" stroke-width="20"/>
    <line x1="45" y1="45" x2="155" y2="155" stroke="#e74c3c" stroke-width="20"/>
    <rect x="60" y="90" width="60" height="15" fill="#bdc3c7"/>
    <rect x="120" y="90" width="15" height="15" fill="#e67e22"/>
    <path d="M140 85 Q145 70 150 80 T160 70" fill="none" stroke="#7f8c8d" stroke-width="3"/>
  </svg>`,

  'teaching.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect x="10" y="10" width="80" height="50" fill="#2c3e50"/> <!-- board -->
    <text x="20" y="40" fill="#fff" font-size="12">A B C</text>
    <circle cx="120" cy="40" r="15" fill="#e74c3c"/> <!-- teacher -->
    <rect x="110" y="60" width="20" height="40" fill="#34495e"/>
    <!-- students -->
    <circle cx="40" cy="110" r="10" fill="#3498db"/><rect x="30" y="125" width="20" height="10" fill="#8e44ad"/>
    <circle cx="80" cy="110" r="10" fill="#3498db"/><rect x="70" y="125" width="20" height="10" fill="#8e44ad"/>
    <circle cx="120" cy="110" r="10" fill="#3498db"/><rect x="110" y="125" width="20" height="10" fill="#8e44ad"/>
  </svg>`,

  'library.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect x="10" y="10" width="50" height="130" fill="#8b4513"/> <!-- bookshelf -->
    <rect x="15" y="20" width="40" height="10" fill="#f1c40f"/><rect x="15" y="40" width="40" height="10" fill="#e74c3c"/>
    <circle cx="120" cy="70" r="15" fill="#f39c12"/> <!-- student -->
    <rect x="100" y="90" width="40" height="30" fill="#fff" stroke="#000"/> <!-- book open -->
    <line x1="120" y1="90" x2="120" y2="120" stroke="#000"/>
    <text x="140" y="50" font-size="20">🤫</text>
  </svg>`,

  'no_signal.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect x="80" y="40" width="40" height="70" fill="#34495e" rx="5"/>
    <rect x="85" y="45" width="30" height="50" fill="#ecf0f1"/>
    <circle cx="100" cy="102" r="3" fill="#ecf0f1"/>
    <path d="M125 55 A20 20 0 0 1 140 70 M135 45 A35 35 0 0 1 155 75" fill="none" stroke="#e74c3c" stroke-width="4"/>
    <line x1="120" y1="40" x2="160" y2="80" stroke="#e74c3c" stroke-width="4"/>
  </svg>`,

  'clean_school.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect width="200" height="150" fill="#e0f7fa"/>
    <path d="M0 100 Q100 80 200 100 L200 150 L0 150 Z" fill="#81c784"/> <!-- grass -->
    <!-- Garbage bin -->
    <rect x="140" y="80" width="30" height="40" fill="#546e7a"/>
    <rect x="135" y="75" width="40" height="5" fill="#37474f"/>
    <!-- Kids -->
    <circle cx="50" cy="70" r="12" fill="#ffb74d"/><rect x="40" y="85" width="20" height="30" fill="#ef5350"/>
    <circle cx="100" cy="65" r="12" fill="#ffb74d"/><rect x="90" y="80" width="20" height="30" fill="#42a5f5"/>
    <text x="100" y="100" font-size="15">♻️</text>
  </svg>`,

  'cross_road.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect width="200" height="150" fill="#95a5a6"/>
    <!-- Zebra crossing -->
    <rect x="40" y="20" width="20" height="110" fill="#fff"/>
    <rect x="80" y="20" width="20" height="110" fill="#fff"/>
    <rect x="120" y="20" width="20" height="110" fill="#fff"/>
    <!-- Boy and Old man -->
    <circle cx="90" cy="70" r="10" fill="#3498db"/><rect x="80" y="85" width="20" height="25" fill="#2ecc71"/>
    <circle cx="115" cy="70" r="10" fill="#bdc3c7"/><rect x="105" y="85" width="20" height="25" fill="#7f8c8d"/>
    <line x1="125" y1="85" x2="125" y2="120" stroke="#000" stroke-width="2"/> <!-- cane -->
  </svg>`,

  'noisy_class.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150">
    <rect x="10" y="10" width="60" height="40" fill="#2c3e50"/>
    <circle cx="100" cy="40" r="15" fill="#e74c3c"/>
    <path d="M90 35 Q100 45 110 35" stroke="#fff" stroke-width="2" fill="none"/> <!-- sad face -->
    <!-- Kids running around -->
    <circle cx="40" cy="90" r="10" fill="#f1c40f"/><text x="45" y="85">🎵</text>
    <circle cx="140" cy="110" r="10" fill="#f39c12"/><text x="145" y="105">✈️</text>
    <circle cx="80" cy="120" r="10" fill="#9b59b6"/><text x="85" y="115">💬</text>
  </svg>`,

  // 7.2 Maps
  'town_map.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="#ecf0f1"/>
    <!-- Roads -->
    <rect x="0" y="80" width="300" height="40" fill="#7f8c8d"/>
    <rect x="130" y="0" width="40" height="200" fill="#7f8c8d"/>
    <line x1="0" y1="100" x2="300" y2="100" stroke="#fff" stroke-width="2" stroke-dasharray="10,10"/>
    <line x1="150" y1="0" x2="150" y2="200" stroke="#fff" stroke-width="2" stroke-dasharray="10,10"/>
    <!-- Buildings -->
    <rect x="20" y="10" width="90" height="60" fill="#3498db"/><text x="35" y="45" fill="#fff" font-family="sans-serif" font-weight="bold">SCHOOL</text>
    <rect x="180" y="10" width="100" height="60" fill="#e74c3c"/><text x="190" y="45" fill="#fff" font-family="sans-serif" font-weight="bold">HOSPITAL</text>
    <rect x="20" y="130" width="90" height="60" fill="#f1c40f"/><text x="35" y="165" font-family="sans-serif" font-weight="bold">CAFE</text>
    <rect x="180" y="130" width="100" height="60" fill="#9b59b6"/><text x="185" y="165" fill="#fff" font-family="sans-serif" font-weight="bold">POST OFFICE</text>
    <!-- Point A -->
    <circle cx="150" cy="180" r="10" fill="#2ecc71"/><text x="145" y="185" font-family="sans-serif" font-weight="bold" fill="#fff">A</text>
  </svg>`,

  'school_map.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="#ecf0f1"/>
    <rect x="20" y="50" width="100" height="100" fill="#3498db" stroke="#2980b9" stroke-width="4"/><text x="35" y="105" fill="#fff" font-family="sans-serif" font-weight="bold">SCHOOL</text>
    <rect x="140" y="50" width="80" height="100" fill="#e67e22" stroke="#d35400" stroke-width="4"/><text x="145" y="105" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="12">BOOKSTORE</text>
    <rect x="240" y="50" width="50" height="100" fill="#2ecc71" stroke="#27ae60" stroke-width="4"/><text x="245" y="105" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="12">PARK</text>
  </svg>`,

  'house_map.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="#bdc3c7"/>
    <rect x="10" y="10" width="130" height="80" fill="#e74c3c" stroke="#c0392b" stroke-width="2"/><text x="30" y="55" fill="#fff" font-family="sans-serif" font-weight="bold">BEDROOM</text>
    <rect x="150" y="10" width="140" height="80" fill="#3498db" stroke="#2980b9" stroke-width="2"/><text x="180" y="55" fill="#fff" font-family="sans-serif" font-weight="bold">BATHROOM</text>
    <rect x="10" y="100" width="130" height="90" fill="#f1c40f" stroke="#f39c12" stroke-width="2"/><text x="20" y="150" font-family="sans-serif" font-weight="bold">LIVING ROOM</text>
    <rect x="150" y="100" width="140" height="90" fill="#e67e22" stroke="#d35400" stroke-width="2"/><text x="185" y="150" fill="#fff" font-family="sans-serif" font-weight="bold">KITCHEN</text>
    <line x1="140" y1="130" x2="150" y2="130" stroke="#fff" stroke-width="10"/> <!-- Door -->
  </svg>`,

  'flowchart.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100">
    <rect width="300" height="100" fill="#ecf0f1"/>
    <rect x="10" y="30" width="50" height="40" rx="20" fill="#2ecc71"/><text x="20" y="55" fill="#fff" font-family="sans-serif" font-size="12">Start</text>
    <line x1="60" y1="50" x2="80" y2="50" stroke="#34495e" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="80" y="30" width="50" height="40" fill="#3498db"/><text x="90" y="55" fill="#fff" font-family="sans-serif" font-size="12">Write</text>
    <line x1="130" y1="50" x2="150" y2="50" stroke="#34495e" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="150" y="30" width="50" height="40" fill="#9b59b6"/><text x="160" y="55" fill="#fff" font-family="sans-serif" font-size="12">Read</text>
    <line x1="200" y1="50" x2="220" y2="50" stroke="#34495e" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="220" y="30" width="50" height="40" rx="20" fill="#e74c3c"/><text x="225" y="55" fill="#fff" font-family="sans-serif" font-size="12">Check</text>
  </svg>`,

  // 7.3 Bar Charts
  'bar_colors.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="#ecf0f1"/>
    <line x1="40" y1="160" x2="280" y2="160" stroke="#2c3e50" stroke-width="3"/>
    <line x1="40" y1="160" x2="40" y2="20" stroke="#2c3e50" stroke-width="3"/>
    <rect x="60" y="60" width="40" height="100" fill="#e74c3c"/><text x="65" y="180" font-family="sans-serif" font-size="12">Red</text>
    <rect x="130" y="100" width="40" height="60" fill="#3498db"/><text x="135" y="180" font-family="sans-serif" font-size="12">Blue</text>
    <rect x="200" y="40" width="40" height="120" fill="#2ecc71"/><text x="200" y="180" font-family="sans-serif" font-size="12">Green</text>
  </svg>`,

  'bar_years.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="#ecf0f1"/>
    <line x1="40" y1="160" x2="280" y2="160" stroke="#2c3e50" stroke-width="3"/>
    <line x1="40" y1="160" x2="40" y2="20" stroke="#2c3e50" stroke-width="3"/>
    <rect x="60" y="100" width="40" height="60" fill="#9b59b6"/><text x="65" y="180" font-family="sans-serif" font-size="12">2020</text>
    <rect x="130" y="40" width="40" height="120" fill="#e67e22"/><text x="135" y="180" font-family="sans-serif" font-size="12">2021</text>
    <rect x="200" y="70" width="40" height="90" fill="#1abc9c"/><text x="205" y="180" font-family="sans-serif" font-size="12">2022</text>
  </svg>`,

  'bar_english.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="#ecf0f1"/>
    <line x1="40" y1="160" x2="280" y2="160" stroke="#2c3e50" stroke-width="3"/>
    <line x1="40" y1="160" x2="40" y2="20" stroke="#2c3e50" stroke-width="3"/>
    <text x="120" y="20" font-family="sans-serif" font-weight="bold">English Average Score</text>
    <rect x="60" y="80" width="40" height="80" fill="#3498db"/><text x="65" y="180" font-family="sans-serif" font-size="12">2562</text>
    <rect x="130" y="40" width="40" height="120" fill="#3498db"/><text x="135" y="180" font-family="sans-serif" font-size="12">2563</text>
    <rect x="200" y="100" width="40" height="60" fill="#3498db"/><text x="205" y="180" font-family="sans-serif" font-size="12">2564</text>
  </svg>`,

  'bar_population.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="#ecf0f1"/>
    <line x1="40" y1="160" x2="280" y2="160" stroke="#2c3e50" stroke-width="3"/>
    <line x1="40" y1="160" x2="40" y2="20" stroke="#2c3e50" stroke-width="3"/>
    <text x="120" y="20" font-family="sans-serif" font-weight="bold">Population</text>
    <rect x="60" y="40" width="40" height="120" fill="#e74c3c"/><text x="65" y="180" font-family="sans-serif" font-size="12">2566</text>
    <rect x="130" y="70" width="40" height="90" fill="#e74c3c"/><text x="135" y="180" font-family="sans-serif" font-size="12">2567</text>
    <rect x="200" y="100" width="40" height="60" fill="#e74c3c"/><text x="205" y="180" font-family="sans-serif" font-size="12">2568</text>
  </svg>`,

  // 7.4 Tables
  'table_scores.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150">
    <rect width="300" height="150" fill="#fff"/>
    <rect x="10" y="10" width="280" height="30" fill="#34495e"/>
    <text x="20" y="30" fill="#fff" font-family="sans-serif" font-size="12">Year</text>
    <text x="100" y="30" fill="#fff" font-family="sans-serif" font-size="12">Math Average</text>
    <text x="200" y="30" fill="#fff" font-family="sans-serif" font-size="12">English Average</text>
    
    <rect x="10" y="40" width="280" height="30" fill="#ecf0f1"/>
    <text x="20" y="60" font-family="sans-serif" font-size="12">2562</text>
    <text x="120" y="60" font-family="sans-serif" font-size="12">45.0</text>
    <text x="220" y="60" font-family="sans-serif" font-size="12">50.0</text>

    <rect x="10" y="70" width="280" height="30" fill="#fff"/>
    <text x="20" y="90" font-family="sans-serif" font-size="12">2563</text>
    <text x="120" y="90" font-family="sans-serif" font-size="12">45.0</text>
    <text x="220" y="90" font-family="sans-serif" font-size="12">55.0</text>

    <rect x="10" y="100" width="280" height="30" fill="#ecf0f1"/>
    <text x="20" y="120" font-family="sans-serif" font-size="12">2564</text>
    <text x="120" y="120" font-family="sans-serif" font-size="12">52.0</text>
    <text x="220" y="120" font-family="sans-serif" font-size="12">55.0</text>
    <line x1="10" y1="10" x2="290" y2="10" stroke="#bdc3c7"/>
    <line x1="10" y1="130" x2="290" y2="130" stroke="#bdc3c7"/>
  </svg>`
};

for (const [filename, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(outDir, filename), content);
}
console.log('Saved all SVGs for SET 7!');
