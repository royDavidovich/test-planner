import React from 'react';
import { Box, Typography, Paper, Chip, Divider } from '@mui/material';
import { useTests } from '../../context/TestsContext';
import { format, differenceInDays } from 'date-fns';
import { he } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const TestTimeline: React.FC = () => {
  const { tests } = useTests();

  // Sort tests by date
  const sortedTests = [...tests].sort((a, b) => a.date.getTime() - b.date.getTime());

  const formatPreparationTime = (days: number): string => {
    if (days < 0) return 'אותו יום כמו המבחן הקודם';
    if (days === 0) return 'אין יום להתכונן למבחן';
    // Using \u200F (Right-to-Left Mark) to ensure proper RTL rendering
    return `יש \u200F${days} ימים להתכונן למבחן`;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const reader = new FileReader();

    reader.onload = (e) => {
      if (isExcel) {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        // rows is now an array of arrays, just like CSV rows
        // ...process rows as you do for CSV
      } else {
        // ...your existing CSV logic
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ flex: 1, overflow: 'auto'}}>
        {sortedTests.length === 0 ? (
          <Typography variant="body1" color="text.secondary" align="center">
            אין מבחנים מתוזמנים. הוסף מבחן כדי לראות אותו כאן
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
            {/* Vertical connecting line */}
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: 0,
                bottom: 0,
                width: 6,
                backgroundColor: 'rgba(6, 11, 15, 0.5)',
                opacity: 0.8,
                zIndex: 0,
                transform: 'translateX(-50%)',
                boxShadow: '0 0 8px rgba(25, 118, 210, 0.5)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(180deg, rgba(25, 118, 210, 0.2) 0%, rgba(25, 118, 210, 0.2) 50%, rgba(25, 118, 210, 0.2) 100%)',
                  borderRadius: '2px',
                }
              }}
            />
            
            {sortedTests.map((test, index) => {
              const daysFromPrevious = index > 0
                ? differenceInDays(test.date, sortedTests[index - 1].date) - 1  // Subtract 1 to account for the previous test day
                : null;

              return (
                <Paper
                  key={test.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: test.color,
                    position: 'relative',
                    zIndex: 1,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateX(-4px)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 13,
                      height: 13,
                      backgroundColor: 'rgba(6, 11, 15, 0.6)',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 2,
                      boxShadow: '0 0 8px rgba(25, 118, 210, 0.5)',
                      border: '2px solid white',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: '50%',
                      top: 0,
                      bottom: 0,
                      width: '4px',
                      backgroundColor: 'transparent',
                      transform: 'translateX(-50%)',
                    }
                  }}
                >
                  <Box sx={{ 
                    flex: 1, 
                    textAlign: 'right',
                    position: 'relative',
                    pl: 2,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      background: 'rgba(6, 11, 15, 0.5)',
                    }
                  }}>
                    <Box sx={{ position: 'relative', height: 40 }}>
                      <Chip
                        label={test.period}
                        color="primary"
                        variant="outlined"
                        size="medium"
                        sx={{
                          mb: 2,
                          px: 1,
                          height: 40,
                          borderColor: '#222',
                          borderWidth: 2,
                          borderRadius: '12px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                          '& .MuiChip-label': {
                            color: '#111',
                            fontWeight: 500,
                            fontSize: '1.1rem',
                            letterSpacing: '0.03em'
                          },
                          position: 'relative',
                          left: -60,
                          top: 0
                        }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ 
                    flex: 1, 
                    textAlign: 'left',
                    position: 'relative',
                    pr: 2,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '3px',
                      background: 'rgba(6, 11, 15, 0.5)',
                    }
                  }}>
                    <Typography variant="h5" component="h3" sx={{ textAlign: 'right', mb: 1 }}>
                      {test.courseName}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'right', mb: 1 }}>
                      {format(test.date, 'EEEE, d MMMM yyyy', { locale: he })}
                    </Typography>
                    {daysFromPrevious !== null && (
                      <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                        {formatPreparationTime(daysFromPrevious)}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TestTimeline; 