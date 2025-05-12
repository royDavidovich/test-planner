import React from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Grid,
  Divider
} from '@mui/material';
import { createTheme as createMuiTheme, Direction } from '@mui/material/styles';
import TestForm from './components/TestInput/TestForm';
import TestTimeline from './components/TestTimeline/TestTimeline';
import { TestsProvider } from './context/TestsContext';

// Create theme with RTL support
const theme = createMuiTheme({
  direction: 'rtl' as Direction,
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      'Rubik',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <TestsProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <Typography 
                variant="h6" 
                component="div"
                dir="rtl"
                sx={{ 
                  flexGrow: 1, 
                  textAlign: 'center',
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                  lineHeight: 1.8,
                  fontSize: '1.5rem',
                }}
              >
                ה-"כמה זמן יש לי בין מבחנים?"-טרון
              </Typography>
            </Toolbar>
          </AppBar>

          <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flex: 1 }}>
            <Grid container spacing={3}>
              {/* Left side - Timeline */}
              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'right' }}>
                    ציר זמן מבחנים
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ flex: 1 /*height: 'calc(100vh - 250px)', overflow: 'auto' */}}>
                    <TestTimeline />
                  </Box>
                </Paper>
              </Grid>

              {/* Right side - Test Form */}
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <TestForm />
                </Paper>
              </Grid>
            </Grid>
          </Container>

          <Box
            component="footer"
            sx={{
              py: 3,
              px: 2,
              mt: 'auto',
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[200]
                  : theme.palette.grey[800],
            }}
          >
            <Container maxWidth="sm">
              <Typography variant="body2" color="text.secondary" align="center">
                © {new Date().getFullYear()} Test Planner. All Rights Reserved.
              </Typography>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </TestsProvider>
  );
}

export default App; 