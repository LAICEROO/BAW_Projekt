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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getEnclosures, createEnclosure, updateEnclosure, deleteEnclosure } from '../api/endpoints';

interface Enclosure {
  id: number;
  name: string;
  type: string;
  capacity: number;
  description: string;
}

interface EnclosureFormData {
  name: string;
  type: string;
  capacity: number;
  description: string;
}

const initialFormData: EnclosureFormData = {
  name: '',
  type: '',
  capacity: 0,
  description: '',
};

const types = [
  'Sawanna',
  'Dżungla',
  'Tundra',
  'Las',
  'Wodny',
  'Górski',
];

export default function Enclosures() {
  const [enclosures, setEnclosures] = useState<Enclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<EnclosureFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [userRole, setUserRole] = useState<'manager' | 'worker'>('worker');

  const fetchEnclosures = async () => {
    try {
      setLoading(true);
      const response = await getEnclosures();
      setEnclosures(response.data);
    } catch (err) {
      setError('Nie udało się pobrać listy wybiegów');
      setSnackbar({ open: true, message: 'Błąd podczas pobierania danych', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnclosures();
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('role') as 'manager' | 'worker';
    if (role) setUserRole(role);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateEnclosure(editingId, formData);
      } else {
        await createEnclosure(formData);
      }

      setSnackbar({
        open: true,
        message: editingId ? 'Wybieg zaktualizowany' : 'Wybieg dodany',
        severity: 'success',
      });
      
      setOpenDialog(false);
      fetchEnclosures();
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
    if (!window.confirm('Czy na pewno chcesz usunąć ten wybieg?')) return;
    
    try {
      await deleteEnclosure(id);
      setSnackbar({
        open: true,
        message: 'Wybieg został usunięty',
        severity: 'success',
      });
      fetchEnclosures();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Błąd podczas usuwania wybiegu',
        severity: 'error',
      });
    }
  };

  const handleEdit = (enclosure: Enclosure) => {
    setFormData({
      name: enclosure.name,
      type: enclosure.type,
      capacity: enclosure.capacity,
      description: enclosure.description,
    });
    setEditingId(enclosure.id);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
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
        <Typography variant="h4">Wybiegi</Typography>
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
            Dodaj wybieg
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
              <TableCell>Nazwa</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {enclosures.map((enclosure) => (
              <TableRow key={enclosure.id}>
                <TableCell>{enclosure.name}</TableCell>
                <TableCell>
                  {userRole === 'manager' && (
                    <>
                      <IconButton onClick={() => handleEdit(enclosure)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(enclosure.id)}><DeleteIcon /></IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {editingId ? 'Edytuj wybieg' : 'Dodaj wybieg'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nazwa"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Anuluj</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#41522d', '&:hover': { bgcolor: '#2d3a1f' } }}>
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