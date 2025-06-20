import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { getTasks, createTask, updateTask, deleteTask, getEmployees, getEnclosures } from '../api/endpoints';

interface Task {
  id: number;
  task_timestamp: string;
  employee: number | null;
  employee_name: string | null;
  enclosure: number | null;
  enclosure_name: string | null;
  task_type: string;
  comments: string | null;
  is_completed: boolean;
}

interface TaskFormData {
  task_timestamp: string;
  employee: number | null;
  enclosure: number | null;
  task_type: string;
  comments: string;
  is_completed: boolean;
}

const initialFormData: TaskFormData = {
  task_timestamp: new Date().toISOString().slice(0, 16),
  employee: null,
  enclosure: null,
  task_type: '',
  comments: '',
  is_completed: false,
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<{ id: number; imie: string; nazwisko: string }[]>([]);
  const [enclosures, setEnclosures] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Pobierz ID i rolę zalogowanego użytkownika
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (userId) setCurrentUserId(parseInt(userId));
    if (role) setUserRole(role);
    
    console.log('Loaded user data:', { userId, role, currentUserId: parseInt(userId || '0') });
  }, []);

  const canEditTask = (task: Task) => {
    // Jeśli użytkownik jest managerem, może edytować wszystkie zadania
    if (userRole === 'manager') return true;
    
    // Dla pracownika - może edytować tylko swoje nieukończone zadania
    const canEdit = task.employee === currentUserId && !task.is_completed;
    console.log('Task employee:', task.employee, 'Current user:', currentUserId, 'Can edit:', canEdit);
    return canEdit;
  };

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data);
    } catch (err) {
      console.error('Błąd podczas pobierania pracowników:', err);
    }
  };

  const fetchEnclosures = async () => {
    try {
      const response = await getEnclosures();
      setEnclosures(response.data);
    } catch (err) {
      console.error('Błąd podczas pobierania wybiegów:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      setTasks(response.data);
    } catch (err) {
      setError('Nie udało się pobrać listy zadań');
      setSnackbar({ open: true, message: 'Błąd podczas pobierania danych', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
    fetchEnclosures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.task_type.trim()) {
      setSnackbar({
        open: true,
        message: 'Tytuł zadania jest wymagany',
        severity: 'error',
      });
      return;
    }

    try {
      let payload;
      if (userRole === 'worker') {
        payload = {
          is_completed: formData.is_completed,
          comments: formData.comments,
        };
      } else {
        payload = {
          task_timestamp: formData.task_timestamp,
          employee: formData.employee,
          enclosure: formData.enclosure,
          task_type: formData.task_type,
          comments: formData.comments,
          is_completed: formData.is_completed,
        };
      }

      if (editingId) {
        await updateTask(editingId, payload);
      } else {
        await createTask(payload);
      }

      setSnackbar({
        open: true,
        message: editingId ? 'Zadanie zaktualizowane' : 'Zadanie dodane',
        severity: 'success',
      });
      
      setOpenDialog(false);
      fetchTasks();
      resetForm();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Wystąpił błąd podczas zapisywania',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to zadanie?')) return;
    
    try {
      await deleteTask(id);
      setSnackbar({
        open: true,
        message: 'Zadanie zostało usunięte',
        severity: 'success',
      });
      fetchTasks();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Błąd podczas usuwania zadania',
        severity: 'error',
      });
    }
  };

  const handleEdit = (task: Task) => {
    setFormData({
      task_timestamp: task.task_timestamp.slice(0, 16),
      employee: task.employee,
      enclosure: task.enclosure,
      task_type: task.task_type,
      comments: task.comments || '',
      is_completed: task.is_completed,
    });
    setEditingId(task.id);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const getEmployeeName = (employeeId: number | null) => {
    if (!employeeId) return 'Nie przypisane';
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.imie} ${employee.nazwisko}` : `ID: ${employeeId}`;
  };

  const getEnclosureName = (enclosureId: number | null) => {
    if (!enclosureId) return 'Nie przypisane';
    const enclosure = enclosures.find(enc => enc.id === enclosureId);
    return enclosure ? enclosure.name : `ID: ${enclosureId}`;
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('pl-PL');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Zadania</Typography>
        {userRole === 'manager' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ bgcolor: '#41522d', '&:hover': { bgcolor: '#2d3a1f' } }}
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            Dodaj zadanie
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Data i czas</TableCell>
              <TableCell>Tytuł</TableCell>
              <TableCell>Pracownik</TableCell>
              <TableCell>Wybieg</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Komentarze</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{formatDateTime(task.task_timestamp)}</TableCell>
                <TableCell>{task.task_type}</TableCell>
                <TableCell>{task.employee_name || 'Nie przypisano'}</TableCell>
                <TableCell>{task.enclosure_name || 'Nie przypisano'}</TableCell>
                <TableCell>
                  <Chip
                    icon={task.is_completed ? <CheckCircleIcon /> : <ScheduleIcon />}
                    label={task.is_completed ? 'Ukończone' : 'W trakcie'}
                    color={task.is_completed ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{task.comments || '-'}</TableCell>
                <TableCell>
                  {userRole === 'manager' ? (
                    <>
                      <IconButton onClick={() => handleEdit(task)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(task.id)}><DeleteIcon /></IconButton>
                    </>
                  ) : canEditTask(task) && (
                    <IconButton onClick={() => handleEdit(task)}><EditIcon /></IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edytuj zadanie' : 'Dodaj zadanie'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {userRole === 'worker' ? (
              // Formularz dla pracownika - tylko komentarze i status ukończenia
              <>
                <TextField
                  fullWidth
                  label="Tytuł zadania"
                  value={formData.task_type}
                  margin="normal"
                  disabled
                />
                <TextField
                  fullWidth
                  label="Data i czas"
                  value={new Date(formData.task_timestamp).toLocaleString()}
                  margin="normal"
                  disabled
                />
                <TextField
                  fullWidth
                  label="Komentarze"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_completed}
                      onChange={(e) => setFormData({ ...formData, is_completed: e.target.checked })}
                      disabled={formData.is_completed}
                    />
                  }
                  label="Ukończone"
                />
              </>
            ) : (
              // Pełny formularz dla managera
              <>
                <TextField
                  type="datetime-local"
                  fullWidth
                  label="Data i czas"
                  value={formData.task_timestamp}
                  onChange={(e) => setFormData({ ...formData, task_timestamp: e.target.value })}
                  margin="normal"
                  required
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="Tytuł zadania"
                  value={formData.task_type}
                  onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  select
                  fullWidth
                  label="Pracownik"
                  value={formData.employee || ''}
                  onChange={(e) => setFormData({ ...formData, employee: e.target.value ? Number(e.target.value) : null })}
                  margin="normal"
                >
                  <MenuItem value="">
                    <em>Nie przypisano</em>
                  </MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.imie} {employee.nazwisko}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  label="Wybieg"
                  value={formData.enclosure || ''}
                  onChange={(e) => setFormData({ ...formData, enclosure: e.target.value ? Number(e.target.value) : null })}
                  margin="normal"
                >
                  <MenuItem value="">
                    <em>Nie przypisano</em>
                  </MenuItem>
                  {enclosures.map((enclosure) => (
                    <MenuItem key={enclosure.id} value={enclosure.id}>
                      {enclosure.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Komentarze"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  margin="normal"
                  multiline
                  rows={3}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.is_completed}
                      onChange={(e) => setFormData({ ...formData, is_completed: e.target.checked })}
                    />
                  }
                  label="Ukończone"
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ bgcolor: '#41522d', '&:hover': { bgcolor: '#2d3a1f' } }}
            >
              {editingId ? 'Zapisz' : 'Dodaj'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
} 