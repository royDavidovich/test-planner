import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTests, Test } from '../../context/TestsContext';
import CSVImport from '../CSVImport/CSVImport';
import { he } from 'date-fns/locale';

interface TestInfo {
  courseName: string;
  date: Date | null;
  period: 'מועד א' | 'מועד ב';
  color: string;
  source: 'manual' | 'csv';
}

type SortField = 'courseName' | 'date' | 'period';
type SortOrder = 'asc' | 'desc';

// Generate a pastel color based on string
const generateColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to HSL for pastel colors
  const h = hash % 360;
  return `hsl(${h}, 70%, 80%)`;
};

const TestForm: React.FC = () => {
  const { tests, addTest, updateTest, deleteTest, hasPeriodForCourse } = useTests();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testInfo, setTestInfo] = useState<TestInfo>({
    courseName: '',
    date: null,
    period: 'מועד א',
    color: '#ffffff',
    source: 'manual'
  });
  const [error, setError] = useState<string | null>(null);

  // Sorting and filtering state
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'מועד א' | 'מועד ב'>('all');

  useEffect(() => {
    if (editingId) {
      const test = tests.find(t => t.id === editingId);
      if (test) {
        setTestInfo({
          courseName: test.courseName,
          date: test.date,
          period: test.period,
          color: test.color,
          source: test.source
        });
      }
    }
  }, [editingId, tests]);

  const handleInputChange = (field: keyof TestInfo) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }> | SelectChangeEvent
  ) => {
    const value = event.target.value as string;
    setTestInfo({
      ...testInfo,
      [field]: value,
      ...(field === 'courseName' && { color: generateColor(value) })
    });
    setError(null); // Clear error when input changes
  };

  const handleDateChange = (newDate: Date | null) => {
    setTestInfo({
      ...testInfo,
      date: newDate
    });
    setError(null); // Clear error when date changes
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!testInfo.date) return;

    try {
      const testData = {
        ...testInfo,
        date: testInfo.date,
        source: 'manual' as const
      };

      if (editingId) {
        updateTest(editingId, testData);
      } else {
        addTest(testData);
      }

      // Reset form
      setTestInfo({
        courseName: '',
        date: null,
        period: 'מועד א',
        color: '#ffffff',
        source: 'manual'
      });
      setEditingId(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא ידועה');
    }
  };

  const handleEdit = (test: Test) => {
    setEditingId(test.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      deleteTest(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTestInfo({
      courseName: '',
      date: null,
      period: 'מועד א',
      color: '#ffffff',
      source: 'manual'
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort tests
  const filteredAndSortedTests = tests
    .filter(test => {
      const matchesSearch = test.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPeriod = periodFilter === 'all' || test.period === periodFilter;
      return matchesSearch && matchesPeriod;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.getTime() - b.date.getTime();
      } else if (sortField === 'courseName') {
        comparison = a.courseName.localeCompare(b.courseName);
      } else if (sortField === 'period') {
        comparison = a.period.localeCompare(b.period);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
      <Box>
        <CSVImport />
        <Paper elevation={3} sx={{ p: 3, maxWidth: 1500, mx: 'auto', mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {editingId ? 'Edit Test' : 'Add New Test'}
          </Typography>
          
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Test Course Name"
                  value={testInfo.courseName}
                  onChange={handleInputChange('courseName')}
                />
                {testInfo.courseName && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Course Color:
                    </Typography>
                    <Chip
                      label={testInfo.courseName}
                      sx={{
                        backgroundColor: testInfo.color,
                        '& .MuiChip-label': {
                          color: '#000000'
                        }
                      }}
                    />
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Test Period</InputLabel>
                  <Select
                    value={testInfo.period}
                    label="Test Period"
                    onChange={handleInputChange('period')}
                  >
                    <MenuItem value="מועד א">מועד א</MenuItem>
                    <MenuItem value="מועד ב">מועד ב</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <DatePicker
                  label="Test Date"
                  value={testInfo.date}
                  onChange={handleDateChange}
                  format="dd/MM/yyyy"
                  sx={{ width: '100%' }}
                  slotProps={{
                    textField: {
                      required: true,
                      error: !testInfo.date,
                      helperText: !testInfo.date ? 'Test date is required' : ''
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'flex-start' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    {editingId ? 'Update Test' : 'Add Test'}
                  </Button>
                  {editingId && (
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handleCancel}
                      size="large"
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {tests.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Saved Tests
              </Typography>
              
              {/* Filters */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <TextField
                  label="Search Courses"
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Period</InputLabel>
                  <Select
                    value={periodFilter}
                    label="Period"
                    onChange={(e) => setPeriodFilter(e.target.value as typeof periodFilter)}
                  >
                    <MenuItem value="all">All Periods</MenuItem>
                    <MenuItem value="מועד א">מועד א</MenuItem>
                    <MenuItem value="מועד ב">מועד ב</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'courseName'}
                          direction={sortField === 'courseName' ? sortOrder : 'asc'}
                          onClick={() => handleSort('courseName')}
                        >
                          Course Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'period'}
                          direction={sortField === 'period' ? sortOrder : 'asc'}
                          onClick={() => handleSort('period')}
                        >
                          Period
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortField === 'date'}
                          direction={sortField === 'date' ? sortOrder : 'asc'}
                          onClick={() => handleSort('date')}
                        >
                          Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAndSortedTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell sx={{ textAlign: 'right' }}>{test.courseName}</TableCell>
                        <TableCell sx={{ textAlign: 'right' }}>{test.period}</TableCell>
                        <TableCell>{format(test.date, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleEdit(test)} size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(test.id)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default TestForm; 