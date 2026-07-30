const fs = require('fs');
let code = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');

code = code.replace(/Monthly Performance/g, 'Daily Performance');
code = code.replace(/Monthly Overview/g, 'Daily Overview');
code = code.replace(/Monthly Feedback/g, 'Daily Feedback');
code = code.replace(/monthly-summary/g, 'daily-summary');

code = code.replace(
  /const \[selectedMonth, setSelectedMonth\] = useState\(\{ month: currentDate\.getMonth\(\) \+ 1, year: currentDate\.getFullYear\(\) \}\);/g,
  "const [selectedDate, setSelectedDate] = useState(format(currentDate, 'yyyy-MM-dd'));"
);

code = code.replace(
  /const summaryUrl = `\/admin\/daily-summary\?month=\$\{selectedMonth\.month\}&year=\$\{selectedMonth\.year\}`;/g,
  "const summaryUrl = `/admin/daily-summary?dateString=${selectedDate}`;"
);

code = code.replace(
  /<div className=\"flex items-center space-x-3\">[\s\S]*?<select[\s\S]*?<\/select>[\s\S]*?<select[\s\S]*?<\/select>[\s\S]*?<\/div>/,
  `<div className=\"flex items-center space-x-3\">
       <div className=\"relative group\">
           <Calendar className=\"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400\" />
           <input 
               type=\"date\" 
               className=\"pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer\"
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               max={format(new Date(), 'yyyy-MM-dd')}
           />
       </div>
   </div>`
);

code = code.replace(
  /name: format\(new Date\(selectedMonth\.year, trendItem\._id\.month - 1\), 'MMM'\)/g,
  "name: format(new Date(trendItem._id.dateString), 'MMM dd')"
);

code = code.replace(
  /name: format\(new Date\(trendItem\._id\.year, trendItem\._id\.month - 1\), 'MMM'\)/g,
  "name: format(new Date(trendItem._id.dateString), 'MMM dd')"
);

code = code.replace(/data: \{ month: summary\.month, year: summary\.year \}/g, "data: { dateString: summary.dateString }");

code = code.replace(/selected month/g, 'selected date');
code = code.replace(/Clear Monthly Data/g, "Clear Daily Data");
code = code.replace(/\/admin\/reset-monthly/g, "/admin/reset-daily");

fs.writeFileSync('frontend/src/pages/AdminDashboard.jsx', code);
console.log('Script ran successfully');
