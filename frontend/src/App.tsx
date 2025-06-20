import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Enclosures from './pages/Enclosures';
import Animals from './pages/Animals';
import Tasks from './pages/Tasks';
import Login from './pages/Login';

const theme = createTheme({
  palette: {
    primary: {
      main: '#41522d',
    },
    secondary: {
      main: '#f9f3e2',
    },
    background: {
      default: '#f9f3e2',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="enclosures" element={<Enclosures />} />
            <Route path="animals" element={<Animals />} />
            <Route path="tasks" element={<Tasks />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
