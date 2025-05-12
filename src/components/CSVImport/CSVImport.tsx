import React, { useCallback, useState } from 'react';
import { Button, Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useTests } from '../../context/TestsContext';
import { format, parse } from 'date-fns';
import { he } from 'date-fns/locale';
import * as XLSX from 'xlsx';

interface CSVTest {
  courseName: string;
  period: "מועד א" | "מועד ב";
  date: string;
  color?: string;
  source: 'csv' | 'manual';
}

// Function to generate a color based on a string
const generateColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  // Ensure the color is light enough to be readable
  const r = parseInt(color.substr(1, 2), 16);
  const g = parseInt(color.substr(3, 2), 16);
  const b = parseInt(color.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  if (brightness < 128) {
    // If too dark, lighten it
    return `#${Math.min(255, r + 128).toString(16).padStart(2, '0')}${Math.min(255, g + 128).toString(16).padStart(2, '0')}${Math.min(255, b + 128).toString(16).padStart(2, '0')}`;
  }
  return color;
};

// Function to convert Excel serial date to JS Date
function excelDateToJSDate(serial: number): Date {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date_info = new Date(utc_value * 1000);
  const fractional_day = serial - Math.floor(serial) + 0.0000001;
  let total_seconds = Math.floor(86400 * fractional_day);
  const seconds = total_seconds % 60;
  total_seconds -= seconds;
  const hours = Math.floor(total_seconds / (60 * 60));
  const minutes = Math.floor(total_seconds / 60) % 60;
  return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

const formatPreparationTime = (days: number): string => {
  if (days === 0) return 'בקושי יום להתכונן למבחן';
  if (days < 0) return 'אותו יום כמו המבחן הקודם';
  return `יש \u200F${days} ימים להתכונן למבחן`;
};

const CSVImport: React.FC = () => {
  const { addTest, clearCSVTests, tests, setTests } = useTests();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [skippedTests, setSkippedTests] = useState<{ courseName: string; period: string }[]>([]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setIsLoading(true);
    setSkippedTests([]);
    // Take a snapshot of manual tests before clearing
    const manualTests = tests.filter(t => t.source === 'manual');
    clearCSVTests();
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let rows: string[][] = [];
        if (isExcel) {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
        } else {
          const text = e.target?.result as string;
          const cleanText = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
          rows = cleanText.split('\n').map(row => row.split(','));
        }
        if (!rows || rows.length < 2) throw new Error('הקובץ ריק או לא תקין');
        const testsToAdd = rows.slice(1).map((row) => {
          const [courseName, period, dateStr] = row.map(cell => {
            const trimmed = String(cell ?? '').trim();
            return /[\u0590-\u05FF]/.test(trimmed) ? `\u200F${trimmed}` : trimmed;
          });
          if (!courseName || !period || !dateStr) {
            throw new Error('פורמט קובץ לא תקין. כל שורה חייבת להכיל שם קורס, מועד ותאריך.');
          }
          const normalizedPeriod = period.replace(/[\u200F\u200E]/g, '').trim();
          if (normalizedPeriod !== 'מועד א' && normalizedPeriod !== 'מועד ב') {
            throw new Error(`מועד לא תקין: ${period}. חייב להיות 'מועד א' או 'מועד ב'`);
          }
          let date: Date;
          if (!isNaN(Number(dateStr)) && dateStr !== '') {
            // Excel serial date
            date = excelDateToJSDate(Number(dateStr));
          } else {
            date = parse(dateStr, 'dd/MM/yyyy', new Date());
          }
          if (isNaN(date.getTime())) {
            throw new Error(`פורמט תאריך לא תקין: ${dateStr}. נדרש פורמט: DD/MM/YYYY`);
          }
          const color = generateColor(courseName);
          return {
            courseName,
            period: normalizedPeriod as "מועד א" | "מועד ב",
            date,
            color,
            source: 'csv' as const
          };
        });
        // Filter out tests that collide with manual tests
        const filteredNewTests = testsToAdd.filter(test => {
          const manualTest = manualTests.find(t =>
            t.courseName === test.courseName &&
            t.period === test.period
          );
          if (manualTest) {
            setSkippedTests(prev => [...prev, { courseName: test.courseName, period: test.period }]);
            return false;
          }
          return true;
        })
          // Add a unique id to each new imported test
          .map(test => ({
            ...test,
            id: Math.random().toString(36).substr(2, 9)
          }));
        // Batch update: set all manual tests + new imported tests at once
        setTests([...manualTests, ...filteredNewTests]);
        event.target.value = '';
        setSuccess(true);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'שגיאה בייבוא קובץ');
      } finally {
        setIsLoading(false);
      }
    };
    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  }, [addTest, clearCSVTests, tests, setTests]);

  return (
    <Box sx={{ mb: 2, textAlign: 'right', minWidth: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end', minWidth: '100%' }}>
        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: '400px', whiteSpace: 'normal' }}>
          <span style={{ textDecoration: 'underline' }}>Excel Format:</span>{' '}
          <span style={{ whiteSpace: 'nowrap' }}><b>Course Name</b>,</span>{' '}
          <span style={{ whiteSpace: 'nowrap' }}><b>Period</b> (<i>מועד א</i> or <i>מועד ב</i>),</span>{' '}
          <span style={{ whiteSpace: 'nowrap' }}><b>Date</b> (<i>DD/MM/YYYY</i>)</span>
        </Typography>
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="csv-upload"
          disabled={isLoading}
        />
        <label htmlFor="csv-upload">
          <Button
            variant="contained"
            component="span"
            sx={{ whiteSpace: 'nowrap' }}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? '...טוען' : 'ייבא מבחנים מקובץ'}
          </Button>
        </label>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => {
          setSuccess(false);
          setSkippedTests([]);
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => {
            setSuccess(false);
            setSkippedTests([]);
          }}
          severity={skippedTests.length > 0 ? 'warning' : 'success'}
          sx={{ width: '100%' }}
        >
          {skippedTests.length > 0 ? (
            <>
              Some tests were skipped because they conflict with manually added tests:
              <ul>
                {skippedTests.map((test, index) => (
                  <li key={index}>{test.courseName} - {test.period}</li>
                ))}
              </ul>
            </>
          ) : (
            'All tests imported successfully!'
          )}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CSVImport; 