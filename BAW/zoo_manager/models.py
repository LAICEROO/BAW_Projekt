from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class EmployeeManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        """
        Tworzy i zapisuje użytkownika z podanym username i hasłem.
        """
        if not username:
            raise ValueError('Pole username musi być ustawione')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        """
        Tworzy i zapisuje superużytkownika z podanym username i hasłem.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superużytkownik musi mieć is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superużytkownik musi mieć is_superuser=True.')

        return self.create_user(username, password, **extra_fields)

class Employee(PermissionsMixin, AbstractBaseUser):
    ROLE_CHOICES = [
        ('manager', 'Manager'),
        ('worker', 'Worker'),
    ]
    imie = models.TextField()
    nazwisko = models.TextField()
    username = models.CharField(max_length=150, unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='worker')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    enclosure = models.ForeignKey('Enclosure', on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['imie', 'nazwisko', 'role']

    objects = EmployeeManager()

    class Meta:
        db_table = 'employees'

    def __str__(self):
        return f"{self.imie} {self.nazwisko} ({self.username})"

    def get_full_name(self):
        return f"{self.imie} {self.nazwisko}"

    def get_short_name(self):
        return self.imie

class Enclosure(models.Model):
    name = models.TextField()
    responsible_employee = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='responsible_enclosures',
    )

    class Meta:
        db_table = 'enclosures'

    def __str__(self):
        return self.name

    @property
    def current_animal_count(self):
        return self.animal_set.count()

class Animal(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('M', 'M'),
        ('F', 'F'),
    ]
    species = models.TextField()
    name = models.TextField()
    gender = models.CharField(max_length=6, choices=GENDER_CHOICES)
    enclosure = models.ForeignKey(Enclosure, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        db_table = 'animals'

    def __str__(self):
        return f"{self.name} ({self.species})"

class Task(models.Model):
    task_timestamp = models.DateTimeField()
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    task_type = models.TextField()
    comments = models.TextField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        db_table = 'tasks'

    def __str__(self):
        return f"{self.task_type} for {self.employee_id} at {self.task_timestamp}"
