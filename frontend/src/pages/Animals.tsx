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
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Sick as SickIcon,
  HealthAndSafety as HealthyIcon,
} from '@mui/icons-material';
import { getAnimals, createAnimal, updateAnimal, updateAnimalHealth, deleteAnimal, getEnclosures } from '../api/endpoints';

interface Animal {
  id: number;
  name: string;
  species: string;
  gender: string;
  enclosure: number | null;
  enclosure_name: string | null;
  health: boolean;
}

interface AnimalFormData {
  name: string;
  species: string;
  gender: string;
  enclosure: number | null;
  health: boolean;
}

const initialFormData: AnimalFormData = {
  name: '',
  species: '',
  gender: 'M',
  enclosure: null,
  health: true,
};

const species = [
  'Lew Afrykański',
  'Tygrys azjatycki',
  'Słoń afrykański',
  'Żyrafa masajska',
  'Hipopotam nilowy',
  'Panda wielka',
  'Pingwin cesarski',
  'Jaguar amerykański',
  'Makak',
];

const genders = [
  { value: 'M', label: 'Samiec' },
  { value: 'F', label: 'Samica' },
];

export default function Animals() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<AnimalFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [enclosures, setEnclosures] = useState<{ id: number; name: string }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'manager' | 'worker'>('manager');

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      const response = await getAnimals();
      setAnimals(response.data);
    } catch (err) {
      setError('Nie udało się pobrać listy zwierząt');
      setSnackbar({ open: true, message: 'Błąd podczas pobierania danych', severity: 'error' });
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchAnimals();
    fetchEnclosures();
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('role') as 'manager' | 'worker';
    if (role) setUserRole(role);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      if (userRole === 'worker') {
        if (editingId) {
          const healthData = { health: formData.health };
          console.log('Sending health data:', healthData);
          await updateAnimalHealth(editingId, healthData);
          setSnackbar({
            open: true,
            message: 'Stan zdrowia został zaktualizowany',
            severity: 'success',
          });
        }
      } else {
        if (!formData.name || !formData.species || !formData.gender) {
          setFormError('Wypełnij wszystkie wymagane pola!');
          return;
        }
        const payload = {
          name: formData.name,
          species: formData.species,
          gender: formData.gender,
          enclosure: formData.enclosure,
          health: formData.health
        };
        
        if (editingId) {
          await updateAnimal(editingId, payload);
          setSnackbar({
            open: true,
            message: 'Zwierzę zaktualizowane',
            severity: 'success',
          });
        } else {
          await createAnimal(payload);
          setSnackbar({
            open: true,
            message: 'Zwierzę dodane',
            severity: 'success',
          });
        }
      }
      
      setOpenDialog(false);
      fetchAnimals();
      resetForm();
    } catch (err: any) {
      console.error('Błąd:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        console.error('Response headers:', err.response.headers);
      }
      setSnackbar({
        open: true,
        message: 'Wystąpił błąd podczas zapisywania',
        severity: 'error',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to zwierzę?')) return;
    
    try {
      await deleteAnimal(id);
      setSnackbar({
        open: true,
        message: 'Zwierzę zostało usunięte',
        severity: 'success',
      });
      fetchAnimals();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Błąd podczas usuwania zwierzęcia',
        severity: 'error',
      });
    }
  };

  const handleEdit = (animal: Animal) => {
    setFormData({
      name: animal.name,
      species: animal.species,
      gender: animal.gender,
      enclosure: animal.enclosure,
      health: animal.health,
    });
    setEditingId(animal.id);
    setOpenDialog(true);
  };

  const handleHealthUpdate = async (animal: Animal) => {
    setFormData({
      name: animal.name,
      species: animal.species,
      gender: animal.gender,
      enclosure: animal.enclosure,
      health: animal.health
    });
    setEditingId(animal.id);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setFormError(null);
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
        <Typography variant="h4">Zwierzęta</Typography>
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
            Dodaj zwierzę
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
              <TableCell>Gatunek</TableCell>
              <TableCell>Imię</TableCell>
              <TableCell>Płeć</TableCell>
              <TableCell>Wybieg</TableCell>
              <TableCell>Stan zdrowia</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {animals.map((animal) => (
              <TableRow key={animal.id}>
                <TableCell>{animal.species}</TableCell>
                <TableCell>{animal.name}</TableCell>
                <TableCell>{animal.gender}</TableCell>
                <TableCell>{animal.enclosure_name || 'Nie przypisano'}</TableCell>
                <TableCell>
                  <Chip
                    label={animal.health ? 'Zdrowy' : 'Chory'}
                    color={animal.health ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {userRole === 'manager' ? (
                    <>
                      <IconButton onClick={() => handleEdit(animal)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDelete(animal.id)}><DeleteIcon /></IconButton>
                    </>
                  ) : (
                    <IconButton onClick={() => handleHealthUpdate(animal)}>
                      <EditIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edytuj zwierzę' : 'Dodaj zwierzę'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {userRole === 'worker' ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!formData.health}
                    onChange={(e) => setFormData({ ...formData, health: !e.target.checked })}
                  />
                }
                label="Chory"
              />
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Gatunek"
                  value={formData.species}
                  onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Imię"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  select
                  fullWidth
                  label="Płeć"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  margin="normal"
                  required
                >
                  <MenuItem value="male">Samiec</MenuItem>
                  <MenuItem value="female">Samica</MenuItem>
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
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.health}
                      onChange={(e) => setFormData({ ...formData, health: e.target.checked })}
                    />
                  }
                  label="Zdrowy"
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