# Projekt BAW - System Zarządzania ZOO

## Instrukcje uruchomienia

### Wymagania systemowe
- Python 3.8+
- Node.js 16+
- npm lub yarn

### Kroki uruchomienia

#### 1. Backend (Django)
```bash
# Przejdź do katalogu BAW
cd BAW

# Zainstaluj zależności Python
pip install -r ../requirements.txt

# Uruchom migracje bazy danych
python manage.py migrate

# Utwórz superużytkownika (opcjonalnie)
python manage.py createsuperuser

# Uruchom serwer Django
python manage.py runserver
```

**Lub użyj skryptu PowerShell:**
```powershell
# Uruchom skrypt startowy
.\start_zoo_manager.ps1
```

#### 2. Frontend (React/TypeScript)
```bash
# Przejdź do katalogu frontend
cd frontend

# Zainstaluj zależności Node.js
npm install

# Uruchom serwer deweloperski
npm run dev
```

#### 3. Dostęp do aplikacji
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:5173
- **Panel admin Django**: http://localhost:8000/admin

### Dane testowe
Po uruchomieniu migracji możesz użyć testowe konta:
- **Manager**: username: `admin`, password: `Admin_123`

### Rozwiązywanie problemów

#### Błąd "Module not found"
```bash
# Zainstaluj ponownie zależności
pip install -r requirements.txt
npm install
```

#### Błąd "Port already in use"
```bash
# Sprawdź jakie procesy używają portów
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Zatrzymaj procesy lub zmień porty
```

#### Błąd migracji
```bash
# Usuń pliki migracji i utwórz ponownie
cd BAW
rm -rf zoo_manager/migrations/0*.py
python manage.py makemigrations
python manage.py migrate
```

#### Błąd "Permission denied" w PowerShell
```powershell
# Uruchom PowerShell jako administrator lub zmień politykę wykonywania
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Opis Projektu

Projekt BAW to aplikacja webowa stworzona w Django, służąca do zarządzania ogrodem zoologicznym. Umożliwia zarządzanie pracownikami, wybiegami, zwierzętami oraz zadaniami. Aplikacja rozróżnia role użytkowników (manager, pracownik) i dostosowuje dostępne funkcjonalności w zależności od posiadanych uprawnień.

## Struktura Projektu i Opis Plików

```
BAW_Projekt/
├── .git/                   # Katalog repozytorium Git
├── BAW/                    # Główny katalog projektu Django
│   ├── BAW/                # Katalog aplikacji konfiguracyjnej projektu
│   │   ├── __init__.py     # Informuje Python, że ten katalog jest pakietem
│   │   ├── asgi.py         # Konfiguracja ASGI dla projektu, używana do asynchronicznych operacji
│   │   ├── settings.py     # Główny plik konfiguracyjny projektu Django
│   │   ├── urls.py         # Główny plik URL projektu, mapuje URL-e na widoki
│   │   └── wsgi.py         # Konfiguracja WSGI dla projektu, używana do synchronicznych operacji
│   ├── manage.py           # Narzędzie wiersza poleceń Django do zarządzania projektem
│   └── zoo_manager/        # Aplikacja Django "zoo_manager"
│       ├── __init__.py     # Informuje Python, że ten katalog jest pakietem
│       ├── admin.py        # Konfiguracja panelu administracyjnego Django dla modeli aplikacji
│       ├── apps.py         # Konfiguracja aplikacji "zoo_manager"
│       ├── forms.py        # Definicje formularzy Django używanych w aplikacji
│       ├── migrations/     # Katalog przechowujący migracje bazy danych
│       │   ├── 0001_initial.py # Pierwsza migracja, tworząca początkową strukturę bazy danych
│       │   ├── 0002_remove_enclosure_animal_count.py # Migracja usuwająca pole animal_count z modelu Enclosure
│       │   └── __init__.py # Informuje Python, że ten katalog jest pakietem
│       ├── models.py       # Definicje modeli danych (np. Employee, Enclosure, Animal, Task)
│       ├── templates/      # Katalog z szablonami HTML
│       │   ├── base.html       # Główny szablon bazowy, dziedziczony przez inne szablony
│       │   ├── home.html       # Szablon strony głównej
│       │   ├── login.html      # Szablon strony logowania
│       │   └── zoo_manager/    # Szablony specyficzne dla aplikacji "zoo_manager"
│       │       ├── add_animal.html     # Formularz dodawania nowego zwierzęcia
│       │       ├── add_employee.html   # Formularz dodawania nowego pracownika
│       │       ├── add_enclosure.html  # Formularz dodawania nowego wybiegu
│       │       ├── animal_list.html    # Lista zwierząt
│       │       ├── assign_task.html    # Formularz przypisywania zadania
│       │       ├── edit_animal.html    # Formularz edycji zwierzęcia
│       │       ├── edit_employee.html  # Formularz edycji pracownika
│       │       ├── edit_enclosure.html # Formularz edycji wybiegu
│       │       ├── edit_task.html      # Formularz edycji zadania
│       │       ├── employee_list.html  # Lista pracowników
│       │       ├── enclosure_list.html # Lista wybiegów
│       │       └── task_list.html      # Lista zadań
│       ├── tests.py        # Plik do pisania testów jednostkowych dla aplikacji
│       └── urls.py         # Definicje URL-i specyficznych dla aplikacji "zoo_manager"
├── .gitignore              # Określa pliki i katalogi ignorowane przez Git
└── README.md               # Ten plik - dokumentacja projektu
```

### Szczegółowy Opis Plików

#### `BAW_Projekt/.gitignore`
Plik ten zawiera listę wzorców plików i katalogów, które system kontroli wersji Git powinien ignorować. Dzięki temu do repozytorium nie trafiają pliki tymczasowe, skompilowane, logi, pliki konfiguracyjne specyficzne dla środowiska lokalnego (np. `local_settings.py`, `db.sqlite3`) oraz inne niepotrzebne pliki.

#### `BAW_Projekt/BAW/manage.py`
Główne narzędzie wiersza poleceń Django. Umożliwia wykonywanie różnych zadań administracyjnych, takich jak:
- Uruchamianie serwera deweloperskiego (`python manage.py runserver`)
- Tworzenie migracji bazy danych (`python manage.py makemigrations`)
- Aplikowanie migracji bazy danych (`python manage.py migrate`)
- Tworzenie superużytkownika (`python manage.py createsuperuser`)
- Gromadzenie plików statycznych (`python manage.py collectstatic`)
- Uruchamianie testów (`python manage.py test`)
Plik ten ustawia zmienną środowiskową `DJANGO_SETTINGS_MODULE` wskazującą na plik `settings.py` projektu oraz wykonuje polecenia przekazane z wiersza poleceń.

#### `BAW_Projekt/BAW/BAW/__init__.py`
Pusty plik, który sygnalizuje Pythonowi, że katalog `BAW/BAW/` jest pakietem Pythona. Umożliwia to importowanie modułów z tego katalogu.

#### `BAW_Projekt/BAW/BAW/asgi.py`
Plik konfiguracyjny dla ASGI (Asynchronous Server Gateway Interface). ASGI jest następcą WSGI i pozwala na obsługę asynchronicznych aplikacji webowych w Django, co jest przydatne np. przy obsłudze WebSockets. W tym projekcie konfiguracja jest standardowa i wskazuje na aplikację Django.

#### `BAW_Projekt/BAW/BAW/settings.py`
Centralny plik konfiguracyjny projektu Django. Zawiera wszystkie ustawienia dotyczące działania aplikacji, m.in.:
- `SECRET_KEY`: Klucz bezpieczeństwa używany do kryptograficznych operacji.
- `DEBUG`: Tryb debugowania (włączony w środowisku deweloperskim, wyłączony w produkcyjnym).
- `ALLOWED_HOSTS`: Lista hostów, z których aplikacja może być serwowana.
- `INSTALLED_APPS`: Lista zainstalowanych aplikacji Django (zarówno wbudowanych, jak i niestandardowych, np. `zoo_manager`).
- `MIDDLEWARE`: Lista komponentów middleware przetwarzających żądania i odpowiedzi.
- `ROOT_URLCONF`: Wskazuje na główny plik konfiguracyjny URL (`BAW.urls`).
- `TEMPLATES`: Konfiguracja silnika szablonów Django.
- `DATABASES`: Konfiguracja połączenia z bazą danych (w tym przypadku PostgreSQL).
- `AUTH_USER_MODEL`: Określa niestandardowy model użytkownika (`zoo_manager.Employee`).
- `AUTH_PASSWORD_VALIDATORS`: Reguły walidacji haseł.
- Ustawienia internacjonalizacji (`LANGUAGE_CODE`, `TIME_ZONE`, itp.).
- `STATIC_URL`: URL dla plików statycznych.
- `DEFAULT_AUTO_FIELD`: Domyślny typ klucza głównego dla modeli.
Plik ten ładuje również zmienne środowiskowe z pliku `.env` (jeśli istnieje) za pomocą biblioteki `python-dotenv`.

#### `BAW_Projekt/BAW/BAW/urls.py`
Główny plik konfiguracyjny URL dla całego projektu. Definiuje, które widoki (lub inne konfiguracje URL) mają być wywoływane dla poszczególnych ścieżek URL. W tym projekcie zawiera:
- Ścieżkę `/admin/` mapowaną na panel administracyjny Django.
- Dołączenie konfiguracji URL z aplikacji `zoo_manager` dla głównej ścieżki (`''`).

#### `BAW_Projekt/BAW/BAW/wsgi.py`
Plik konfiguracyjny dla WSGI (Web Server Gateway Interface). WSGI jest standardem interfejsu pomiędzy serwerem WWW a aplikacjami Pythona. Ten plik tworzy instancję aplikacji WSGI, która jest używana przez serwery produkcyjne do uruchomienia projektu Django.

---

#### `BAW_Projekt/BAW/zoo_manager/__init__.py`
Pusty plik, który sygnalizuje Pythonowi, że katalog `BAW/zoo_manager/` jest pakietem Pythona, czyli aplikacją Django.

#### `BAW_Projekt/BAW/zoo_manager/admin.py`
Plik służący do konfiguracji panelu administracyjnego Django dla modeli zdefiniowanych w aplikacji `zoo_manager`. Rejestruje modele takie jak `Employee`, `Enclosure`, `Animal`, `Task`, aby były dostępne i zarządzalne z poziomu interfejsu `/admin/`.
- Dla modelu `Employee` definiuje niestandardową klasę `EmployeeAdmin`, która dziedziczy po `UserAdmin` i dostosowuje sposób wyświetlania oraz edycji użytkowników w panelu admina (np. pola wyświetlane na liście, filtry, pola w formularzu dodawania i edycji).

#### `BAW_Projekt/BAW/zoo_manager/apps.py`
Plik konfiguracyjny dla aplikacji `zoo_manager`. Definiuje klasę `ZooManagerConfig`, która zawiera metadane aplikacji, takie jak `name` (nazwa aplikacji) i `default_auto_field` (domyślny typ klucza głównego dla modeli w tej aplikacji).

#### `BAW_Projekt/BAW/zoo_manager/forms.py`
Zawiera definicje formularzy Django używanych w aplikacji `zoo_manager` do tworzenia i modyfikowania danych.
- `EmployeeCreationForm`: Formularz do tworzenia nowych użytkowników (pracowników), dziedziczy po `UserCreationForm`.
- `EmployeeChangeForm`: Formularz do edycji istniejących użytkowników, dziedziczy po `UserChangeForm`.
- `EnclosureForm`: Formularz do tworzenia i edycji wybiegów (`Enclosure`).
- `TaskCompletionForm`: Uproszczony formularz dla pracowników do oznaczania zadań jako ukończone i dodawania komentarzy.
- `AnimalForm`: Formularz do tworzenia i edycji zwierząt (`Animal`).
- `TaskForm`: Pełny formularz do tworzenia i edycji zadań (`Task`), używany przez managerów.
Formularze te są oparte na modelach Django (`ModelForm`) i automatycznie generują pola odpowiadające polom modeli, ale mogą być również dostosowywane (np. przez dodanie widgetów, etykiet, walidacji).

#### `BAW_Projekt/BAW/zoo_manager/models.py`
Definiuje strukturę bazy danych poprzez modele Django. Każda klasa modelu odpowiada tabeli w bazie danych, a atrybuty klasy odpowiadają kolumnom.
- `EmployeeManager`: Niestandardowy manager dla modelu `Employee`, zawiera metody `create_user` i `create_superuser`.
- `Employee`: Niestandardowy model użytkownika dziedziczący po `AbstractBaseUser` i `PermissionsMixin`. Reprezentuje pracownika ZOO, z polami takimi jak `imie`, `nazwisko`, `username`, `role` (manager/worker), `enclosure` (przypisany wybieg).
- `Enclosure`: Model reprezentujący wybieg dla zwierząt, z polami `name` i `responsible_employee`. Zawiera również właściwość `current_animal_count` do dynamicznego obliczania liczby zwierząt w wybiegu.
- `Animal`: Model reprezentujący zwierzę, z polami `species`, `name`, `gender`, `enclosure` (wybieg, w którym przebywa).
- `Task`: Model reprezentujący zadanie do wykonania, z polami `task_timestamp`, `employee` (przypisany pracownik), `task_type`, `comments`, `is_completed`.

#### `BAW_Projekt/BAW/zoo_manager/migrations/`
Katalog zawierający pliki migracji bazy danych. Migracje to skrypty Pythona generowane przez Django (`makemigrations`), które opisują zmiany w modelach i pozwalają na ewolucyjne aktualizowanie schematu bazy danych (`migrate`).
- `0001_initial.py`: Pierwsza migracja, tworząca tabele dla wszystkich modeli zdefiniowanych w `models.py` w momencie jej generowania.
- `0002_remove_enclosure_animal_count.py`: Druga migracja, która usuwa pole `animal_count` z modelu `Enclosure`. Zamiast tego licznik zwierząt jest teraz dynamicznie obliczany przez właściwość w modelu.
- `__init__.py`: Pusty plik oznaczający ten katalog jako pakiet Pythona.

#### `BAW_Projekt/BAW/zoo_manager/templates/`
Katalog główny dla szablonów HTML używanych przez aplikację `zoo_manager`.
- `base.html`: Główny szablon HTML, który definiuje wspólną strukturę strony (nagłówek, stopka, nawigacja, miejsce na komunikaty). Inne szablony dziedziczą po nim i nadpisują bloki (`{% block %}`). Zawiera link do arkusza stylów CSS oraz podstawową nawigację (logowanie/wylogowywanie).
- `home.html`: Szablon strony głównej. Wyświetla powitanie oraz menu nawigacyjne w zależności od tego, czy użytkownik jest zalogowany i jaką ma rolę.
- `login.html`: Szablon strony logowania. Zawiera formularz logowania (`AuthenticationForm`).

#### `BAW_Projekt/BAW/zoo_manager/templates/zoo_manager/`
Podkatalog zawierający szablony HTML specyficzne dla widoków aplikacji `zoo_manager`.
- `add_animal.html`: Szablon formularza dodawania nowego zwierzęcia. Używa formularza `AnimalForm`.
- `add_employee.html`: Szablon formularza dodawania nowego pracownika. Używa formularza `EmployeeCreationForm`.
- `add_enclosure.html`: Szablon formularza dodawania nowego wybiegu. Używa formularza `EnclosureForm`.
- `animal_list.html`: Szablon wyświetlający listę wszystkich zwierząt. Pokazuje gatunek, imię, płeć i przypisany wybieg. Manager ma możliwość dodania nowego zwierzęcia.
- `assign_task.html`: Szablon formularza przypisywania/dodawania nowego zadania. Używa formularza `TaskForm`. Dostępny dla managera.
- `edit_animal.html`: Szablon formularza edycji istniejącego zwierzęcia. Używa formularza `AnimalForm`.
- `edit_employee.html`: Szablon formularza edycji danych istniejącego pracownika. Używa formularza `EmployeeChangeForm`. Dostępny dla managera.
- `edit_enclosure.html`: Szablon formularza edycji istniejącego wybiegu. Używa formularza `EnclosureForm`. Dostępny dla managera.
- `edit_task.html`: Szablon formularza edycji istniejącego zadania. Używa `TaskForm` dla managera lub `TaskCompletionForm` dla przypisanego pracownika.
- `employee_list.html`: Szablon wyświetlający listę wszystkich pracowników. Pokazuje dane pracownika, rolę, przypisany wybieg. Manager ma możliwość dodania, edycji i usunięcia pracownika.
- `enclosure_list.html`: Szablon wyświetlający listę wszystkich wybiegów. Pokazuje nazwę wybiegu, liczbę zwierząt, odpowiedzialnego pracownika. Manager ma możliwość dodania i edycji wybiegu.
- `task_list.html`: Szablon wyświetlający listę wszystkich zadań. Pokazuje typ zadania, przypisanego pracownika, datę, status ukończenia i komentarze. Manager ma możliwość dodania zadania. Zarówno manager, jak i przypisany pracownik mogą edytować zadanie.

#### `BAW_Projekt/BAW/zoo_manager/tests.py`
Plik przeznaczony na testy jednostkowe i integracyjne dla aplikacji `zoo_manager`. Obecnie jest pusty, ale powinien zawierać testy sprawdzające poprawność działania modeli, widoków, formularzy i innych komponentów aplikacji.

#### `BAW_Projekt/BAW/zoo_manager/urls.py`
Plik konfiguracyjny URL specyficzny dla aplikacji `zoo_manager`. Definiuje mapowanie ścieżek URL na widoki zdefiniowane w `views.py` tej aplikacji. Obejmuje ścieżki dla:
- Strony głównej (`/`)
- Logowania (`/login/`) i wylogowywania (`/logout/`)
- List zadań, wybiegów, zwierząt, pracowników
- Formularzy dodawania, edycji i usuwania (dla managerów) poszczególnych obiektów (pracowników, zwierząt, wybiegów, zadań).

#### `BAW_Projekt/BAW/zoo_manager/views.py`
Zawiera logikę aplikacji, czyli widoki Django. Widoki to funkcje (lub klasy) Pythona, które przyjmują żądanie HTTP i zwracają odpowiedź HTTP (najczęściej renderowany szablon HTML).
- `home(request)`: Wyświetla stronę główną.
- `login(request)`: Obsługuje logikę logowania użytkownika.
- `logout_view(request)`: Obsługuje wylogowywanie użytkownika.
- Widoki listujące: `task_list_view`, `enclosure_list_view`, `animal_list_view`, `employee_list_view`. Pobierają dane z bazy i przekazują je do odpowiednich szablonów.
- Widoki dodawania (dostępne dla managera): `add_employee_view`, `add_animal_view`, `assign_task_view`, `add_enclosure_view`. Obsługują formularze dodawania nowych obiektów.
- Widoki edycji: `edit_enclosure_view`, `edit_animal_view`, `edit_task_view`, `edit_employee_view`. Obsługują formularze edycji istniejących obiektów. Widok `edit_task_view` dostosowuje formularz w zależności od roli użytkownika.
- Widok usuwania (dostępny dla managera): `delete_employee_view`.
Wiele widoków używa dekoratorów takich jak `@login_required` (wymaga zalogowania), `@permission_required` (wymaga określonych uprawnień) oraz `@user_passes_test` (sprawdza niestandardowy warunek, np. `is_manager`). Widoki często korzystają z systemu wiadomości Django (`messages`) do informowania użytkownika o wynikach operacji.

## Bezpieczeństwo

Projekt stara się stosować najlepsze praktyki bezpieczeństwa Django:
- **Ochrona CSRF (Cross-Site Request Forgery)**: Django domyślnie włącza ochronę CSRF. W szablonach używany jest tag `{% csrf_token %}` w formularzach POST.
- **Ochrona przed SQL Injection**: Django ORM (Object-Relational Mapper) automatycznie parametryzuje zapytania SQL, co w znacznym stopniu chroni przed atakami SQL Injection.
- **Ochrona przed XSS (Cross-Site Scripting)**: Silnik szablonów Django domyślnie escapuje zmienne, co pomaga zapobiegać atakom XSS. Należy jednak zachować ostrożność przy używaniu tagu `{% autoescape off %}` lub `{{ variable|safe }}`.
- **Zarządzanie hasłami**: Hasła użytkowników są hashowane, a nie przechowywane w postaci jawnej. Używane są wbudowane mechanizmy Django do zarządzania hasłami.
- **Uprawnienia**: Aplikacja wykorzystuje system uprawnień Django oraz niestandardowe role do kontrolowania dostępu do poszczególnych funkcjonalności. Dekoratory `@login_required` i `@permission_required` są stosowane w widokach.
- **DEBUG mode**: W pliku `settings.py` zmienna `DEBUG` jest ustawiona na `True` dla środowiska deweloperskiego. W środowisku produkcyjnym powinna być ustawiona na `False`, aby nie ujawniać wrażliwych informacji.
- **SECRET_KEY**: Klucz `SECRET_KEY` jest przechowywany w `settings.py`. W środowisku produkcyjnym powinien być to unikalny, trudny do odgadnięcia ciąg znaków i przechowywany w bezpieczny sposób (np. jako zmienna środowiskowa).
- **ALLOWED_HOSTS**: W `settings.py` `ALLOWED_HOSTS` jest obecnie puste. W środowisku produkcyjnym powinno zawierać listę domen, z których aplikacja może być serwowana.

## Dalszy Rozwój
- Implementacja testów jednostkowych i integracyjnych.
- Rozbudowa funkcjonalności (np. raporty, bardziej szczegółowe zarządzanie zadaniami, powiadomienia).
- Poprawa interfejsu użytkownika (UI/UX).
- Wdrożenie na serwer produkcyjny z odpowiednią konfiguracją bezpieczeństwa.

## Uwierzytelnianie JWT (JSON Web Token)

Projekt wykorzystuje `djangorestframework-simplejwt` do obsługi uwierzytelniania opartego na tokenach JWT, co jest szczególnie przydatne dla API.

### Instalacja

Niezbędne pakiety zostały dodane do projektu:
```bash
pip install djangorestframework djangorestframework-simplejwt
```

### Konfiguracja

1.  **`settings.py`**:
    *   `rest_framework` i `rest_framework_simplejwt` zostały dodane do `INSTALLED_APPS`.
    *   Skonfigurowano `REST_FRAMEWORK` tak, aby używał `JWTAuthentication` jako domyślnej metody uwierzytelniania dla API, jednocześnie zachowując `SessionAuthentication` dla tradycyjnych widoków webowych.
    *   Dodano przykładową konfigurację `SIMPLE_JWT` określającą m.in. czas życia tokenów.

2.  **`BAW/urls.py`** (główny plik URL projektu):
    *   Dodano ścieżki URL do uzyskiwania i odświeżania tokenów JWT:
        *   `api/token/`: Służy do uzyskiwania pary tokenów (access i refresh) po podaniu prawidłowych danych logowania (nazwa użytkownika i hasło).
        *   `api/token/refresh/`: Służy do uzyskiwania nowego tokenu dostępu (access token) przy użyciu ważnego tokenu odświeżania (refresh token).

### Uzyskiwanie Tokenów

Aby uzyskać tokeny, należy wysłać żądanie POST na adres `/api/token/` z następującymi danymi w ciele żądania (format JSON):
```json
{
    "username": "twoja_nazwa_uzytkownika",
    "password": "twoje_haslo"
}
```
W odpowiedzi serwer zwróci tokeny dostępu i odświeżania.

### Użycie Tokenu Dostępu

Uzyskany token dostępu (access token) powinien być przesyłany w nagłówku `Authorization` każdego żądania do zabezpieczonych endpointów API, np.:
`Authorization: Bearer <access_token>`
