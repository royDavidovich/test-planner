# 📅 Test Planner - ה-"כמה זמן יש לי בין מבחנים?"-טרון

A clean, Hebrew-friendly web app for managing university exam dates, checking gaps between exams, and visually planning your study schedule. Built with React, Material UI, and Excel/CSV import support.

## ✨ Features

- 📥 **Manual and CSV/Excel Test Entry**: Add exams individually or import them in bulk.
- 📊 **Interactive Timeline**: Visualize your exams in a vertical timeline with preparation gaps between each test.
- 📋 **Test Overview Table**: View, sort, filter, and search your scheduled exams.
- 🎨 **Color-coded Courses**: Each course gets a unique pastel color for easier recognition.
- 💾 **Local Persistence**: All data is saved in localStorage—your tests stay put between sessions.
- 🌐 **RTL Layout**: Fully designed for Hebrew/right-to-left display.

## 📂 Project Structure

```
src/
├── components/
│   ├── CSVImport/         # Excel/CSV file upload logic
│   ├── TestInput/         # Add/Edit test form
│   └── TestTimeline/      # Timeline visualization
├── context/
│   └── TestsContext.tsx   # State management for test entries
├── App.tsx                # Main app layout with Material UI theme
├── main.tsx               # Entry point
└── index.css              # Global styling
```

## 📦 Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/test-planner.git
   cd test-planner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the dev server:
   ```bash
   npm run dev
   ```

## 📄 CSV/Excel Import Format

| Course Name | Period  | Date        |
|-------------|---------|-------------|
| מבוא למדמ"ח | מועד א  | 12/06/2024  |
| חשבון אינפי | מועד ב  | 28/06/2024  |

- **Period**: Only supports `מועד א` and `מועד ב`
- **Date**: Must be in `DD/MM/YYYY` format

## ⚙️ Tech Stack

- **React** (with hooks + context)
- **Material UI v5**
- **TypeScript**
- **date-fns**
- **xlsx** (Excel parsing)

## 📌 Future Improvements

- Calendar view option
- Export to PDF or iCal
- User account & cloud sync
- Multi-semester separation

---

© 2025 Test Planner by Roy Davidovich. All rights reserved.
