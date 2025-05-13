from django.shortcuts import render, HttpResponse, redirect
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required, user_passes_test, permission_required
from .models import Task, Enclosure, Animal, Employee
from .forms import EmployeeCreationForm

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
@permission_required('zoo_manager.add_animal', login_url='/login/')
def add_animal_view(request):
    return render(request, 'zoo_manager/add_animal.html', {})

@login_required
@permission_required('zoo_manager.add_task', login_url='/login/')
def assign_task_view(request):
    return render(request, 'zoo_manager/assign_task.html', {})

# Przypisywanie zwierzęcia do wybiegu - to może być część edycji zwierzęcia lub wybiegu
# Na razie nie tworzymy osobnego widoku, założymy, że będzie to w formularzu edycji Zwierzęcia/Wybiegu.
