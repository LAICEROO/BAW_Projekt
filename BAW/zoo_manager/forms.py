from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
# Import PasswordInput; remove if forms.PasswordInput is directly usable.
# from django.forms.widgets import PasswordInput # No, forms.PasswordInput is the way
from .models import Employee, Animal, Task, Enclosure

class EmployeeCreationForm(UserCreationForm):
    # Password fields will be inherited from UserCreationForm

    class Meta(UserCreationForm.Meta):
        model = Employee
        # Temporarily reduced fields to match simplified add_fieldsets
        fields = ('username', 'imie', 'nazwisko', 'role', 'enclosure')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ustawienie pola 'enclosure' jako nieobowiązkowe w formularzu
        if 'enclosure' in self.fields:
            self.fields['enclosure'].required = False
        # Ustawienie pola 'groups' jako nieobowiązkowe, Django samo zarządza jego wymagalnością
        if 'groups' in self.fields:
            self.fields['groups'].required = False

class EmployeeChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = Employee
        fields = ('username', 'imie', 'nazwisko', 'role', 'enclosure', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Ustawienie pola 'enclosure' jako nieobowiązkowe w formularzu
        if 'enclosure' in self.fields:
            self.fields['enclosure'].required = False
        # Ustawienie pola 'groups' i 'user_permissions' jako nieobowiązkowe
        if 'groups' in self.fields:
            self.fields['groups'].required = False
        if 'user_permissions' in self.fields:
            self.fields['user_permissions'].required = False

class EnclosureForm(forms.ModelForm):
    class Meta:
        model = Enclosure
        fields = ('name', 'responsible_employee') # animal_count is likely managed automatically
        # Można dodać widgety lub etykiety w razie potrzeby

class TaskCompletionForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ('is_completed', 'comments')
        widgets = {
            'comments': forms.Textarea(attrs={'rows': 3}),
        }
        labels = {
            'is_completed': 'Zadanie ukończone',
            'comments': 'Dodatkowe uwagi'
        }

# Formularz do dodawania Zwierzęcia
class AnimalForm(forms.ModelForm):
    class Meta:
        model = Animal
        fields = ('species', 'name', 'gender', 'enclosure')
        # widgets = { # Przykładowe dostosowanie widżetu
        #     'gender': forms.RadioSelect
        # }

# Formularz do dodawania/przypisywania Zadania
class TaskForm(forms.ModelForm):
    # Możemy chcieć ograniczyć wybór pracownika tylko do aktywnych pracowników
    # employee = forms.ModelChoiceField(queryset=Employee.objects.filter(is_active=True), required=False)
    
    class Meta:
        model = Task
        fields = ('task_type', 'employee', 'comments', 'is_completed', 'task_timestamp')
        widgets = {
            'task_timestamp': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'comments': forms.Textarea(attrs={'rows': 3}),
        }
        help_texts = {
            'task_timestamp': 'Kiedy zadanie ma zostać wykonane lub kiedy zostało zarejestrowane.'
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Jeśli chcesz, aby pole pracownika nie było wymagane (np. zadanie ogólne)
        # self.fields['employee'].required = False
        # Ustawienie task_timestamp jako niewymagane, jeśli ma być opcjonalne lub ustawiane automatycznie
        # self.fields['task_timestamp'].required = False 
        # Jeśli pole is_completed ma być domyślnie False i nieedytowalne przy tworzeniu
        # if not self.instance.pk: # Jeśli to jest nowy obiekt
        #     self.fields['is_completed'].disabled = True
        pass 