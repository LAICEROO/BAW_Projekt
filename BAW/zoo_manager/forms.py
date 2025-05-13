from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import Employee, Animal, Task

class EmployeeCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = Employee
        fields = UserCreationForm.Meta.fields + ('imie', 'nazwisko', 'role', 'enclosure')
        # Możesz dostosować etykiety lub widżety, jeśli potrzebujesz
        # labels = {
        #     'imie': 'Imię',
        #     'nazwisko': 'Nazwisko',
        # }

class EmployeeChangeForm(UserChangeForm): # Formularz do edycji, może się przydać później
    class Meta(UserChangeForm.Meta):
        model = Employee
        fields = UserChangeForm.Meta.fields # Możesz tu też dodać swoje pola, jeśli mają być edytowalne

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