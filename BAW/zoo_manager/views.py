from django.shortcuts import render, HttpResponse, redirect, get_object_or_404
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test, permission_required
from .models import Task, Enclosure, Animal, Employee
from .forms import EmployeeCreationForm, EnclosureForm, AnimalForm, TaskForm, TaskCompletionForm, EmployeeChangeForm
from django.views.decorators.http import require_POST

# Funkcja pomocnicza do sprawdzania roli managera
def is_manager(user):
    return user.is_authenticated and user.role == 'manager'

# Create your views here.

def home(request):
    return render(request, "home.html")

def login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                auth_login(request, user)
                messages.info(request, f"Witaj, {username}. Zostałeś pomyślnie zalogowany.")
                return redirect('home')
            else:
                messages.error(request, "Nieprawidłowa nazwa użytkownika lub hasło.")
        else:
            messages.error(request, "Nieprawidłowa nazwa użytkownika lub hasło.")
    else:
        form = AuthenticationForm()
    return render(request, "login.html", {'form': form})

def logout_view(request):
    if request.method == 'POST':
        auth_logout(request)
        messages.info(request, "Zostałeś pomyślnie wylogowany.")
        return redirect('home')
    return redirect('home')

@login_required
def task_list_view(request):
    tasks = Task.objects.all().order_by('-task_timestamp')
    context = {
        'tasks': tasks
    }
    return render(request, 'zoo_manager/task_list.html', context)

@login_required
def enclosure_list_view(request):
    enclosures = Enclosure.objects.all().order_by('name')
    context = {
        'enclosures': enclosures
    }
    return render(request, 'zoo_manager/enclosure_list.html', context)

@login_required
def animal_list_view(request):
    animals = Animal.objects.all().order_by('species', 'name')
    context = {
        'animals': animals
    }
    return render(request, 'zoo_manager/animal_list.html', context)

@login_required
@permission_required('zoo_manager.view_employee', login_url='/login/')
def employee_list_view(request):
    employees = Employee.objects.select_related('enclosure').all().order_by('nazwisko', 'imie')
    context = {
        'employees': employees
    }
    return render(request, 'zoo_manager/employee_list.html', context)

# --- Widoki tylko dla Managera ---
@login_required
@permission_required('zoo_manager.add_employee', login_url='/login/')
def add_employee_view(request):
    if request.method == 'POST':
        form = EmployeeCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = EmployeeCreationForm()
    return render(request, 'zoo_manager/add_employee.html', {'form': form})

@login_required
@permission_required('zoo_manager.delete_employee', login_url='/login/')
@require_POST
def delete_employee_view(request, employee_id):
    employee_to_delete = get_object_or_404(Employee, pk=employee_id)
    
    if request.user.pk == employee_to_delete.pk:
        messages.error(request, 'Nie możesz usunąć własnego konta.')
        return redirect('employee_list')
        
    try:
        employee_name = employee_to_delete.get_full_name() or employee_to_delete.username
        employee_to_delete.delete()
        messages.success(request, f'Pracownik "{employee_name}" został pomyślnie usunięty.')
    except Exception as e:
        messages.error(request, f'Wystąpił błąd podczas usuwania pracownika: {e}')
        
    return redirect('employee_list')

@login_required
@permission_required('zoo_manager.add_animal', login_url='/login/')
def add_animal_view(request):
    if request.method == 'POST':
        form = AnimalForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Nowe zwierzę zostało pomyślnie dodane.')
            return redirect('animal_list')
        else:
            messages.error(request, 'Proszę poprawić błędy w formularzu.')
    else:
        form = AnimalForm()
    return render(request, 'zoo_manager/add_animal.html', {'form': form})

@login_required
@permission_required('zoo_manager.add_task', login_url='/login/')
def assign_task_view(request):
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Nowe zadanie zostało pomyślnie dodane/przypisane.')
            return redirect('task_list')
        else:
            messages.error(request, 'Proszę poprawić błędy w formularzu.')
    else:
        form = TaskForm()
    return render(request, 'zoo_manager/assign_task.html', {'form': form})

@login_required
@permission_required('zoo_manager.add_enclosure', login_url='/login/')
def add_enclosure_view(request):
    if request.method == 'POST':
        form = EnclosureForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Nowy wybieg został pomyślnie dodany.')
            return redirect('enclosure_list')
        else:
            messages.error(request, 'Proszę poprawić błędy w formularzu.')
    else:
        form = EnclosureForm()
    return render(request, 'zoo_manager/add_enclosure.html', {'form': form})

@login_required
@permission_required('zoo_manager.change_enclosure', login_url='/login/')
def edit_enclosure_view(request, enclosure_id):
    enclosure = get_object_or_404(Enclosure, pk=enclosure_id)
    if request.method == 'POST':
        form = EnclosureForm(request.POST, instance=enclosure)
        if form.is_valid():
            form.save()
            messages.success(request, f'Wybieg "{enclosure.name}" został pomyślnie zaktualizowany.')
            return redirect('enclosure_list')
        else:
            messages.error(request, 'Proszę poprawić błędy w formularzu.')
    else:
        form = EnclosureForm(instance=enclosure)
    return render(request, 'zoo_manager/edit_enclosure.html', {'form': form, 'enclosure': enclosure})

@login_required
@permission_required('zoo_manager.change_animal', login_url='/login/')
def edit_animal_view(request, animal_id):
    animal = get_object_or_404(Animal, pk=animal_id)
    if request.method == 'POST':
        form = AnimalForm(request.POST, instance=animal)
        if form.is_valid():
            form.save()
            messages.success(request, f'Zwierzę "{animal.name}" zostało pomyślnie zaktualizowane.')
            return redirect('animal_list')
        else:
            messages.error(request, 'Proszę poprawić błędy w formularzu.')
    else:
        form = AnimalForm(instance=animal)
    return render(request, 'zoo_manager/edit_animal.html', {'form': form, 'animal': animal})

@login_required
def edit_task_view(request, task_id):
    task = get_object_or_404(Task, pk=task_id)
    is_assigned_employee = (request.user == task.employee)
    is_manager_user = (request.user.role == 'manager')

    if not (is_assigned_employee or is_manager_user):
        messages.error(request, 'Nie masz uprawnień do edycji tego zadania.')
        return redirect('task_list')

    if request.method == 'POST':
        if is_manager_user:
            # Manager używa pełnego formularza TaskForm
            form = TaskForm(request.POST, instance=task)
        elif is_assigned_employee:
            # Pracownik używa uproszczonego formularza TaskCompletionForm
            form = TaskCompletionForm(request.POST, instance=task)
        else:
            # Sytuacja awaryjna, nie powinna wystąpić z uwagi na wcześniejsze sprawdzenie
            messages.error(request, 'Wystąpił nieoczekiwany błąd uprawnień.')
            return redirect('task_list')
            
        if form.is_valid():
            form.save()
            messages.success(request, f'Zadanie "{task.task_type}" zostało pomyślnie zaktualizowane.')
            return redirect('task_list')
        else:
            messages.error(request, 'Proszę poprawić błędy w formularzu.')
    else:
        if is_manager_user:
            form = TaskForm(instance=task)
        elif is_assigned_employee:
            form = TaskCompletionForm(instance=task)
        else:
            # Sytuacja awaryjna
            messages.error(request, 'Wystąpił nieoczekiwany błąd uprawnień.')
            return redirect('task_list')
            
    return render(request, 'zoo_manager/edit_task.html', {'form': form, 'task': task})

# Przypisywanie zwierzęcia do wybiegu - to może być część edycji zwierzęcia lub wybiegu
# Na razie nie tworzymy osobnego widoku, założymy, że będzie to w formularzu edycji Zwierzęcia/Wybiegu.

@login_required
@permission_required('zoo_manager.change_employee', login_url='/login/')
def edit_employee_view(request, employee_id):
    employee = get_object_or_404(Employee, pk=employee_id)
    if request.method == 'POST':
        form = EmployeeChangeForm(request.POST, request.FILES, instance=employee)
        if form.is_valid():
            form.save()
            messages.success(request, f'Dane pracownika "{employee.get_full_name() or employee.username}" zostały pomyślnie zaktualizowane.')
            return redirect('employee_list')
        else:
            messages.error(request, 'Proszę poprawić błędy w formularzu.')
    else:
        form = EmployeeChangeForm(instance=employee)
    
    return render(request, 'zoo_manager/edit_employee.html', {'form': form, 'employee': employee})
