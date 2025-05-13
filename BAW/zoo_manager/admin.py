from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Enclosure, Employee, Animal, Task
from .forms import EmployeeCreationForm

class EmployeeAdmin(UserAdmin):
    add_form = EmployeeCreationForm
    # Pola wyświetlane na liście użytkowników
    list_display = ('username', 'imie', 'nazwisko', 'role', 'is_staff', 'is_active')
    # Pola, po których można sortować
    ordering = ('username',)
    # Filtry po prawej stronie
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'groups')
    # Jeśli chcesz umożliwić wyszukiwanie po tych polach
    search_fields = ('username', 'imie', 'nazwisko')

    # Całkowicie nadpisujemy fieldsets, aby używać tylko pól z modelu Employee
    fieldsets = (
        (None, {'fields': ('username', 'password')}), # Dane logowania
        ('Informacje osobiste', {'fields': ('imie', 'nazwisko', 'role', 'enclosure')}), # Twoje niestandardowe pola
        ('Uprawnienia', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}), # Uprawnienia Django
        ('Ważne daty', {'fields': ('last_login',)}), # Django automatycznie zarządza last_login i date_joined (jeśli by było)
    )

    # Całkowicie nadpisujemy add_fieldsets dla formularza dodawania użytkownika
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password', 'password2'), # password2 dla potwierdzenia hasła
        }),
        ('Informacje osobiste', {
            'classes': ('wide',),
            'fields': ('imie', 'nazwisko', 'role', 'enclosure'),
        }),
        # Możesz tu dodać sekcję uprawnień, jeśli chcesz je ustawiać od razu przy tworzeniu
        # np. ('Uprawnienia', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Uprawnienia', {  # Dodana sekcja
            'classes': ('wide',),
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups'),
        }),
    )

    # Możesz chcieć zdefiniować `form` i `add_form`, jeśli potrzebujesz bardziej zaawansowanej walidacji
    # lub chcesz użyć niestandardowych formularzy dziedziczących z UserChangeForm i UserCreationForm.
    # Na razie powyższe powinno wystarczyć, aby pozbyć się błędu FieldError.

# Zarejestruj swój niestandardowy model Employee z niestandardowym EmployeeAdmin
admin.site.register(Employee, EmployeeAdmin)

# Pozostałe modele rejestrujemy jak wcześniej
admin.site.register(Enclosure)
admin.site.register(Animal)
admin.site.register(Task)
