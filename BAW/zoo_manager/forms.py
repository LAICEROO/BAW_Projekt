from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import Employee, Animal, Task, Enclosure

class EmployeeCreationForm(UserCreationForm):
    """Formularz do tworzenia nowego pracownika"""
    enclosures = forms.ModelMultipleChoiceField(queryset=Enclosure.objects.all(), required=False)  # type: ignore

    class Meta(UserCreationForm.Meta):
        model = Employee
        fields = ('username', 'imie', 'nazwisko', 'role', 'enclosures')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'enclosures' in self.fields:
            self.fields['enclosures'].required = False
        if 'groups' in self.fields:
            self.fields['groups'].required = False

class EmployeeChangeForm(UserChangeForm):
    """Formularz do edycji pracownika"""
    enclosures = forms.ModelMultipleChoiceField(queryset=Enclosure.objects.all(), required=False)  # type: ignore
    
    class Meta(UserChangeForm.Meta):
        model = Employee
        fields = ('username', 'imie', 'nazwisko', 'role', 'enclosures', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if 'enclosures' in self.fields:
            self.fields['enclosures'].required = False
        if 'groups' in self.fields:
            self.fields['groups'].required = False
        if 'user_permissions' in self.fields:
            self.fields['user_permissions'].required = False

class EnclosureForm(forms.ModelForm):
    """Formularz dla modelu Enclosure"""
    responsible_employees = forms.ModelMultipleChoiceField(queryset=Employee.objects.all(), required=False)  # type: ignore
    
    class Meta:
        model = Enclosure
        fields = ['name', 'responsible_employees']

class TaskCompletionForm(forms.ModelForm):
    """Formularz do oznaczania zadań jako ukończone"""
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

class AnimalForm(forms.ModelForm):
    """Formularz do dodawania zwierzęcia"""
    class Meta:
        model = Animal
        fields = ('species', 'name', 'gender', 'enclosure')

class TaskForm(forms.ModelForm):
    """Formularz do dodawania/przypisywania zadania"""
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
        pass 