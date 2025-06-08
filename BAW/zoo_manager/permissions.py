from rest_framework import permissions


class IsManagerOrReadOnly(permissions.BasePermission):
    """
    Pozwala na pełny dostęp managerom, a pracownikom tylko na odczyt
    """
    
    def has_permission(self, request, view):
        # Sprawdź czy użytkownik jest zalogowany
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Pozwól na odczyt wszystkim zalogowanym użytkownikom
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Pozwól na modyfikację tylko managerom
        return request.user.role == 'manager'


class IsManagerOnly(permissions.BasePermission):
    """
    Pozwala na dostęp tylko managerom
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.role == 'manager'


class IsOwnerOrManager(permissions.BasePermission):
    """
    Pozwala na dostęp właścicielowi obiektu lub managerowi
    """
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Manager ma dostęp do wszystkiego
        if request.user.role == 'manager':
            return True
        
        # Sprawdź czy obiekt ma pole 'employee' i czy to jest właściciel
        if hasattr(obj, 'employee') and obj.employee == request.user:
            return True
        
        # Sprawdź czy to jest sam użytkownik (dla Employee)
        if obj == request.user:
            return True
        
        return False


class CanEditOwnTasksOnly(permissions.BasePermission):
    """
    Pozwala pracownikom edytować tylko swoje zadania (oznaczanie jako ukończone)
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return True
    
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Manager może edytować wszystkie zadania
        if request.user.role == 'manager':
            return True
        
        # Pracownik może edytować tylko swoje zadania
        if hasattr(obj, 'employee') and obj.employee == request.user:
            # Pracownik może tylko oznaczać jako ukończone i dodawać komentarze
            if request.method in ['PATCH', 'PUT']:
                return True
        
        return False

