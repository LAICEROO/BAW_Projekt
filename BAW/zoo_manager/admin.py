from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Enclosure, Employee, Animal, Task
from .forms import EmployeeCreationForm, EmployeeChangeForm

class EmployeeAdmin(UserAdmin):
    add_form = EmployeeCreationForm
    form = EmployeeChangeForm

    # Pola wyświetlane na liście użytkowników
    list_display = ('username', 'imie', 'nazwisko', 'role', 'is_staff', 'is_active')
    # Pola, po których można sortować
    ordering = ('username',)
    # Filtry po prawej stronie
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active', 'groups')
    # Jeśli chcesz umożliwić wyszukiwanie po tych polach
    search_fields = ('username', 'imie', 'nazwisko')

    # Fieldset dla edycji istniejącego użytkownika
    fieldsets = (
        (None, {'fields': ('username',)}), # Usunięto 'password' stąd
        ('Informacje osobiste', {'fields': ('imie', 'nazwisko', 'role', 'enclosures')}),
        ('Uprawnienia', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Ważne daty', {'fields': ('last_login',)}), 
    )

    # Fieldset dla tworzenia nowego użytkownika
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password', 'password2'), 
        }),
        ('Informacje osobiste', {
            'classes': ('wide',),
            'fields': ('imie', 'nazwisko', 'role', 'enclosures'),
        }),
        # Temporarily commenting out permissions to isolate the issue
        # ('Uprawnienia', {
        #     'classes': ('wide',),
        #     'fields': ('is_active', 'is_staff', 'is_superuser', 'groups'),
        # }),
    )
    
    # Potrzebne, aby Django wiedziało, które pola są tylko do odczytu w panelu admina dla AbstractBaseUser
    readonly_fields = ('last_login',)

# Zarejestruj swój niestandardowy model Employee z niestandardowym EmployeeAdmin
admin.site.register(Employee, EmployeeAdmin)

class EnclosureAdmin(admin.ModelAdmin):
    list_display = ('name', 'get_responsible_employees')

    def get_responsible_employees(self, obj):
        return ", ".join([e.get_full_name() for e in obj.responsible_employees.all()])
    get_responsible_employees.short_description = 'Odpowiedzialni pracownicy'

# Pozostałe modele rejestrujemy jak wcześniej
admin.site.register(Enclosure, EnclosureAdmin)
admin.site.register(Animal)
admin.site.register(Task)
