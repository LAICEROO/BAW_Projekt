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
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getEnclosures, changePassword } from '../api/endpoints';

interface Employee {
  id: number;
  imie: string;
  nazwisko: string;
  username: string;
  role: 'manager' | 'worker';
  enclosures: number[];
}

interface EmployeeFormData {
  imie: string;
  nazwisko: string;
  username: string;
  password: string;
  repeatPassword: string;
  role: 'manager' | 'worker';
  enclosures: number[];
  oldPassword: string;
  newPassword: string;
  repeatNewPassword: string;
}

const initialFormData: EmployeeFormData = {
  imie: '',
  nazwisko: '',
  username: '',
  password: '',
  repeatPassword: '',
  role: 'worker',
  enclosures: [],
  oldPassword: '',
  newPassword: '',
  repeatNewPassword: '',
};

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [enclosures, setEnclosures] = useState<{ id: number; name: string }[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'manager' | 'worker'>('worker');
  const [userId, setUserId] = useState<number | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });

  useEffect(() => {
    const role = localStorage.getItem('role') as 'manager' | 'worker';
    const id = localStorage.getItem('userId');
    if (role) setUserRole(role);
    if (id) setUserId(Number(id));
  }, []);

  const fetchEnclosures = async () => {
    try {
      const response = await getEnclosures();
      setEnclosures(response.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Błąd podczas pobierania wybiegów', severity: 'error' });
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getEmployees();
      setEmployees(response.data);
    } catch (err) {
      setError('Nie udało się pobrać listy pracowników');
      setSnackbar({ open: true, message: 'Błąd podczas pobierania danych', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchEnclosures();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Sprawdzenie wymaganych pól
    if (!formData.imie || !formData.nazwisko || !formData.username) {
      setFormError('Imię, nazwisko i login są wymagane.');
      return;
    }
    
    // Sprawdź wymagania hasła dla nowego pracownika
    if (!editingId && !checkPasswordRequirements(formData.password, formData.repeatPassword)) {
      setFormError('Hasło nie spełnia wszystkich wymagań!');
      return;
    }
    
    // Sprawdź wymagania hasła dla zmiany hasła
    if (showPasswordChange && !checkNewPasswordRequirements(formData.newPassword, formData.repeatNewPassword)) {
      setFormError('Nowe hasło nie spełnia wszystkich wymagań!');
      return;
    }

    // Sprawdź czy aktualne hasło zostało wprowadzone
    if (showPasswordChange && !formData.oldPassword) {
      setFormError('Nie zostało wprowadzone aktualne hasło!');
      return;
    }

    // Sprawdź czy wszystkie pola zmiany hasła są wypełnione
    if (showPasswordChange && (!formData.oldPassword || !formData.newPassword || !formData.repeatNewPassword)) {
      setFormError('Wszystkie pola zmiany hasła muszą być wypełnione!');
      return;
    }

    try {
      // Dla pracownika edytującego swoje konto - tylko zmiana hasła
      if (userRole === 'worker' && editingId && userId === editingId) {
        if (showPasswordChange) {
          try {
            // Debug: sprawdź tokeny
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');
            console.log('Token available:', !!token);
            console.log('Refresh token available:', !!refreshToken);
            console.log('User ID:', userId);
            console.log('Editing ID:', editingId);
            
            await changePassword(editingId, formData.oldPassword, formData.newPassword);
            
            setSnackbar({
              open: true,
              message: 'Hasło zostało zmienione',
              severity: 'success',
            });
            setOpenDialog(false);
            resetForm();
            return;
          } catch (err: any) {
            console.error('Błąd zmiany hasła:', err);
            console.error('Error response:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Błąd podczas zmiany hasła';
            setSnackbar({
              open: true,
              message: errorMessage,
              severity: 'error',
            });
            return;
          }
        } else {
          // Pracownik nie może edytować innych danych
          setSnackbar({
            open: true,
            message: 'Nie możesz edytować swoich danych osobowych',
            severity: 'error',
          });
          return;
        }
      }
      
      // Dla managera lub dodawania nowego pracownika
      const payload: any = {
        imie: formData.imie,
        nazwisko: formData.nazwisko,
        username: formData.username,
        role: formData.role,
        enclosures: formData.enclosures,
      };
      
      // Dodaj hasło tylko jeśli zostało wprowadzone
      if (formData.password) {
        payload.password = formData.password;
      }

      if (editingId) {
        await updateEmployee(editingId, payload);
        
        // Jeśli użytkownik chce zmienić hasło
        if (showPasswordChange) {
          try {
            // Debug: sprawdź tokeny
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');
            console.log('Token available:', !!token);
            console.log('Refresh token available:', !!refreshToken);
            console.log('User ID:', userId);
            console.log('Editing ID:', editingId);
            
            await changePassword(editingId, formData.oldPassword, formData.newPassword);
          } catch (err: any) {
            console.error('Błąd zmiany hasła:', err);
            console.error('Error response:', err.response?.data);
            const errorMessage = err.response?.data?.error || err.response?.data?.detail || 'Błąd podczas zmiany hasła';
            setSnackbar({
              open: true,
              message: errorMessage,
              severity: 'error',
            });
            return;
          }
        }
        setSnackbar({
          open: true,
          message: 'Pracownik zaktualizowany',
          severity: 'success',
        });
      } else {
        await createEmployee(payload);
        setSnackbar({
          open: true,
          message: 'Pracownik dodany',
          severity: 'success',
        });
      }
      setOpenDialog(false);
      fetchEmployees();
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
    if (!window.confirm('Czy na pewno chcesz usunąć tego pracownika?')) return;
    
    try {
      await deleteEmployee(id);
      setSnackbar({
        open: true,
        message: 'Pracownik został usunięty',
        severity: 'success',
      });
      fetchEmployees();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Błąd podczas usuwania pracownika',
        severity: 'error',
      });
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      imie: employee.imie,
      nazwisko: employee.nazwisko,
      username: employee.username,
      password: '',
      repeatPassword: '',
      role: employee.role,
      enclosures: employee.enclosures || [],
      oldPassword: '',
      newPassword: '',
      repeatNewPassword: '',
    });
    setEditingId(employee.id);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setFormError(null);
    setShowPasswordChange(false);
  };

  const getEnclosureNames = (enclosureIds: number[]) => {
    return enclosureIds.map(id => {
      const enclosure = enclosures.find(e => e.id === id);
      return enclosure ? enclosure.name : `ID: ${id}`;
    }).join(', ');
  };

  // Funkcja do sprawdzania wymagań hasła
  const checkPasswordRequirements = (password: string, repeatPassword: string) => {
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      passwordsMatch: password === repeatPassword && password.length > 0,
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(req => req);
  };

  // Funkcja do sprawdzania wymagań przy zmianie hasła
  const checkNewPasswordRequirements = (newPassword: string, repeatNewPassword: string) => {
    const requirements = {
      minLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
      passwordsMatch: newPassword === repeatNewPassword && newPassword.length > 0,
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(req => req);
  };

  // Komponent do wyświetlania wymagań hasła
  const PasswordRequirements = () => (
    <Box sx={{ mt: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        Wymagania hasła:
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: passwordRequirements.minLength ? 'success.main' : 'error.main',
            }}
          />
          <Typography variant="body2" color={passwordRequirements.minLength ? 'success.main' : 'text.secondary'}>
            Minimum 8 znaków
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: passwordRequirements.hasUpperCase ? 'success.main' : 'error.main',
            }}
          />
          <Typography variant="body2" color={passwordRequirements.hasUpperCase ? 'success.main' : 'text.secondary'}>
            Przynajmniej jedna wielka litera (A-Z)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: passwordRequirements.hasLowerCase ? 'success.main' : 'error.main',
            }}
          />
          <Typography variant="body2" color={passwordRequirements.hasLowerCase ? 'success.main' : 'text.secondary'}>
            Przynajmniej jedna mała litera (a-z)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: passwordRequirements.hasNumber ? 'success.main' : 'error.main',
            }}
          />
          <Typography variant="body2" color={passwordRequirements.hasNumber ? 'success.main' : 'text.secondary'}>
            Przynajmniej jedna cyfra (0-9)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: passwordRequirements.hasSpecialChar ? 'success.main' : 'error.main',
            }}
          />
          <Typography variant="body2" color={passwordRequirements.hasSpecialChar ? 'success.main' : 'text.secondary'}>
            Przynajmniej jeden znak specjalny (!@#$%^&*...)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              bgcolor: passwordRequirements.passwordsMatch ? 'success.main' : 'error.main',
            }}
          />
          <Typography variant="body2" color={passwordRequirements.passwordsMatch ? 'success.main' : 'text.secondary'}>
            Hasła muszą być identyczne
          </Typography>
        </Box>
      </Box>
    </Box>
  );

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
        <Typography variant="h4">Pracownicy</Typography>
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
            Dodaj pracownika
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
              <TableCell>Imię</TableCell>
              <TableCell>Nazwisko</TableCell>
              <TableCell>Login</TableCell>
              <TableCell>Rola</TableCell>
              <TableCell>Wybiegi</TableCell>
              <TableCell>Akcje</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.imie}</TableCell>
                <TableCell>{employee.nazwisko}</TableCell>
                <TableCell>{employee.username}</TableCell>
                <TableCell>
                  {employee.role === 'manager' ? (
                    <Chip
                      icon={<AdminIcon />}
                      label="Menadżer"
                      size="small"
                      color="primary"
                    />
                  ) : (
                    <Chip label="Pracownik" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>
                  {employee.enclosures && employee.enclosures.length > 0 
                    ? getEnclosureNames(employee.enclosures)
                    : 'Brak przypisanych wybiegów'
                  }
                </TableCell>
                <TableCell>
                  {(userRole === 'manager' || (userRole === 'worker' && userId === employee.id)) && (
                    <IconButton onClick={() => handleEdit(employee)}><EditIcon /></IconButton>
                  )}
                  {userRole === 'manager' && (
                    <IconButton onClick={() => handleDelete(employee.id)}><DeleteIcon /></IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingId ? 'Edytuj pracownika' : 'Dodaj pracownika'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>
            )}
            
            {/* Sprawdź czy to pracownik edytujący swoje konto */}
            {userRole === 'worker' && editingId && userId === editingId ? (
              // Formularz dla pracownika edytującego swoje konto
              <>
                <TextField
                  fullWidth
                  label="Imię"
                  value={formData.imie}
                  margin="normal"
                  disabled
                  helperText="Tylko menadżer może zmienić imię"
                />
                <TextField
                  fullWidth
                  label="Nazwisko"
                  value={formData.nazwisko}
                  margin="normal"
                  disabled
                  helperText="Tylko menadżer może zmienić nazwisko"
                />
                <TextField
                  fullWidth
                  label="Login"
                  value={formData.username}
                  margin="normal"
                  disabled
                  helperText="Tylko menadżer może zmienić login"
                />
                
                {/* Sekcja zmiany hasła */}
                <Button
                  variant="outlined"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  sx={{ mt: 2, mb: 2 }}
                >
                  {showPasswordChange ? 'Ukryj zmianę hasła' : 'Zmień hasło'}
                </Button>
                
                {showPasswordChange && (
                  <>
                    {/* Ukryte pole do oszukania menedżera haseł */}
                    <input
                      type="password"
                      style={{ display: 'none' }}
                      autoComplete="username"
                    />
                    <TextField
                      fullWidth
                      label="Aktualne hasło"
                      type="password"
                      value={formData.oldPassword}
                      onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                      margin="normal"
                      required
                      autoComplete="new-password"
                      inputProps={{
                        'data-form-type': 'other'
                      }}
                    />
                    {/* Wymagania hasła nad polem */}
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: passwordRequirements.hasUpperCase && passwordRequirements.hasLowerCase && passwordRequirements.hasNumber && passwordRequirements.hasSpecialChar ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}
                      >
                        Hasło powinno zawierać duże i małe litery, cyfry i znak specjalny
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: passwordRequirements.minLength ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}
                      >
                        Hasło powinno składać się conajmniej z 8 znaków
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: passwordRequirements.passwordsMatch ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}
                      >
                        Hasła powinny być takie same
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      label="Nowe hasło"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, newPassword: e.target.value });
                        checkNewPasswordRequirements(e.target.value, formData.repeatNewPassword);
                      }}
                      margin="normal"
                      required
                      autoComplete="new-password"
                    />
                    <TextField
                      fullWidth
                      label="Powtórz nowe hasło"
                      type="password"
                      value={formData.repeatNewPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, repeatNewPassword: e.target.value });
                        checkNewPasswordRequirements(formData.newPassword, e.target.value);
                      }}
                      margin="normal"
                      required
                      autoComplete="new-password"
                    />
                  </>
                )}
              </>
            ) : (
              // Pełny formularz dla managera lub dodawania nowego pracownika
              <>
                <TextField
                  fullWidth
                  label="Imię"
                  value={formData.imie}
                  onChange={(e) => setFormData({ ...formData, imie: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Nazwisko"
                  value={formData.nazwisko}
                  onChange={(e) => setFormData({ ...formData, nazwisko: e.target.value })}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Login"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  margin="normal"
                  required
                />
                
                {!editingId && (
                  <>
                    <TextField
                      fullWidth
                      label="Hasło"
                      type="password"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        checkPasswordRequirements(e.target.value, formData.repeatPassword);
                      }}
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Powtórz hasło"
                      type="password"
                      value={formData.repeatPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, repeatPassword: e.target.value });
                        checkPasswordRequirements(formData.password, e.target.value);
                      }}
                      margin="normal"
                      required
                    />
                    <PasswordRequirements />
                  </>
                )}
                
                {editingId === userId && userRole === 'manager' && (
                  <Button
                    variant="outlined"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    sx={{ mt: 2, mb: 2 }}
                  >
                    {showPasswordChange ? 'Ukryj zmianę hasła' : 'Zmień hasło'}
                  </Button>
                )}
                
                {showPasswordChange && editingId === userId && userRole === 'manager' && (
                  <>
                    {/* Ukryte pole do oszukania menedżera haseł */}
                    <input
                      type="password"
                      style={{ display: 'none' }}
                      autoComplete="username"
                    />
                    <TextField
                      fullWidth
                      label="Aktualne hasło"
                      type="password"
                      value={formData.oldPassword}
                      onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                      margin="normal"
                      required
                      autoComplete="new-password"
                      inputProps={{
                        'data-form-type': 'other'
                      }}
                    />
                    {/* Wymagania hasła nad polem */}
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: passwordRequirements.hasUpperCase && passwordRequirements.hasLowerCase && passwordRequirements.hasNumber && passwordRequirements.hasSpecialChar ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}
                      >
                        Hasło powinno zawierać duże i małe litery, cyfry i znak specjalny
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: passwordRequirements.minLength ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}
                      >
                        Hasło powinno składać się conajmniej z 8 znaków
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: passwordRequirements.passwordsMatch ? 'success.main' : 'text.secondary', fontWeight: 'bold' }}
                      >
                        Hasła powinny być takie same
                      </Typography>
                    </Box>
                    <TextField
                      fullWidth
                      label="Nowe hasło"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, newPassword: e.target.value });
                        checkNewPasswordRequirements(e.target.value, formData.repeatNewPassword);
                      }}
                      margin="normal"
                      required
                      autoComplete="new-password"
                    />
                    <TextField
                      fullWidth
                      label="Powtórz nowe hasło"
                      type="password"
                      value={formData.repeatNewPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, repeatNewPassword: e.target.value });
                        checkNewPasswordRequirements(formData.newPassword, e.target.value);
                      }}
                      margin="normal"
                      required
                      autoComplete="new-password"
                    />
                  </>
                )}
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.role === 'manager'}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        role: e.target.checked ? 'manager' : 'worker' 
                      })}
                      disabled={userRole === 'worker'}
                    />
                  }
                  label="Menadżer"
                  sx={{ mt: 2 }}
                />
                
                <TextField
                  select
                  fullWidth
                  label="Wybieg(i)"
                  SelectProps={{ multiple: true }}
                  value={formData.enclosures}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    enclosures: Array.isArray(e.target.value) 
                      ? e.target.value.map(v => Number(v))
                      : [Number(e.target.value)]
                  })}
                  margin="normal"
                  helperText="Możesz wybrać kilka wybiegów"
                  disabled={userRole === 'worker'}
                >
                  {enclosures.map((enclosure) => (
                    <MenuItem key={enclosure.id} value={enclosure.id}>
                      {enclosure.name}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
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