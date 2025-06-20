import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { getDashboardStats, getTasks } from '../api/endpoints';

interface DashboardStats {
  user: {
    id: number;
    username: string;
    role: string;
  };
  statistics: {
    total_employees: number;
    total_enclosures: number;
    total_animals: number;
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
  };
  my_tasks?: {
    total: number;
    completed: number;
    pending: number;
  };
}

interface Task {
  id: number;
  task_type: string;
  task_timestamp: string;
  is_completed: boolean;
  employee: number;
  employee_name?: string;
  enclosure_name?: string;
  comments?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (err) {
        setError('Nie udało się pobrać statystyk');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setLoadingTasks(true);
        const response = await getTasks();
        const currentUserId = parseInt(localStorage.getItem('userId') || '0');
        const userRole = localStorage.getItem('role');
        
        // Pokazuj tylko zadania przypisane do zalogowanego użytkownika
        const filtered = response.data.filter((task: Task) => task.employee === currentUserId);
        
        setAllTasks(filtered);
        setMyTasks(filtered);
      } catch (err) {
        setErrorTasks('Nie udało się pobrać moich zadań');
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchMyTasks();
  }, []);

  // Funkcja do filtrowania zadań po dacie
  const filterTasksByDate = (date: string) => {
    if (!date) {
      setMyTasks(allTasks);
      return;
    }
    
    const filtered = allTasks.filter((task: Task) => {
      const taskDate = new Date(task.task_timestamp).toISOString().slice(0, 10);
      return taskDate === date;
    });
    
    setMyTasks(filtered);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value;
    setSelectedDate(date);
    filterTasksByDate(date);
  };

  const clearDateFilter = () => {
    setSelectedDate('');
    setMyTasks(allTasks);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Panel główny
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: '#f9f3e2',
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Zwierzęta
          </Typography>
          <Typography component="p" variant="h4">
            {stats?.statistics.total_animals || 0}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: '#f9f3e2',
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Pracownicy
          </Typography>
          <Typography component="p" variant="h4">
            {stats?.statistics.total_employees || 0}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: '#f9f3e2',
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Wybiegi
          </Typography>
          <Typography component="p" variant="h4">
            {stats?.statistics.total_enclosures || 0}
          </Typography>
        </Paper>

        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            height: 140,
            bgcolor: '#f9f3e2',
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Zadania
          </Typography>
          <Typography component="p" variant="h4">
            {stats?.statistics.total_tasks || 0}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f9f3e2',
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Status zadań
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Do wykonania
              </Typography>
              <Typography variant="h4">
                {stats?.statistics.pending_tasks || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                W trakcie
              </Typography>
              <Typography variant="h4">
                {(stats?.statistics.total_tasks || 0) - (stats?.statistics.completed_tasks || 0)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Ukończone
              </Typography>
              <Typography variant="h4">
                {stats?.statistics.completed_tasks || 0}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f9f3e2',
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Moje zadania
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Do wykonania
              </Typography>
              <Typography variant="h4">
                {stats?.my_tasks?.pending || 0}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Ukończone
              </Typography>
              <Typography variant="h4">
                {stats?.my_tasks?.completed || 0}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#f9f3e2',
          }}
        >
          <Typography component="h2" variant="h6" color="primary" gutterBottom>
            Moja lista zadań
          </Typography>
          
          {/* Filtr daty */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              size="small"
              sx={{ minWidth: 150 }}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon />
                  </InputAdornment>
                ),
              }}
            />
            {selectedDate && (
              <Button 
                variant="outlined" 
                size="small" 
                onClick={clearDateFilter}
              >
                Wyczyść filtr
              </Button>
            )}
          </Box>
          
          {loadingTasks ? (
            <CircularProgress />
          ) : errorTasks ? (
            <Alert severity="error">{errorTasks}</Alert>
          ) : myTasks.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              {selectedDate ? 'Brak zadań na wybraną datę' : 'Brak przypisanych zadań'}
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {myTasks.map((task) => (
                <Paper
                  key={task.id}
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography variant="h6">{task.task_type}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(task.task_timestamp).toLocaleDateString('pl-PL')}
                  </Typography>
                  {task.comments && (
                    <Typography variant="body2" color="text.secondary">
                      {task.comments}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={task.is_completed ? 'Ukończone' : 'W trakcie'}
                      color={task.is_completed ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </div>
  );
} 