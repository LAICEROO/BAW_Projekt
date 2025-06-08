from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Employee, Enclosure, Animal, Task
from .serializers import (
    EmployeeSerializer, EnclosureSerializer, AnimalSerializer, 
    TaskSerializer, TaskCompletionSerializer
)
from .permissions import (
    IsManagerOrReadOnly, IsManagerOnly, IsOwnerOrManager, CanEditOwnTasksOnly
)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla zarządzania pracownikami
    """
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsManagerOnly]
    
    def get_queryset(self):
        """Zwraca listę pracowników"""
        return Employee.objects.all().order_by('nazwisko', 'imie')
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Endpoint do pobierania informacji o aktualnie zalogowanym użytkowniku"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsOwnerOrManager])
    def change_password(self, request, pk=None):
        """Endpoint do zmiany hasła"""
        employee = self.get_object()
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response(
                {'error': 'Wymagane są pola old_password i new_password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not employee.check_password(old_password):
            return Response(
                {'error': 'Nieprawidłowe stare hasło'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employee.set_password(new_password)
        employee.save()
        
        return Response({'message': 'Hasło zostało zmienione'})


class EnclosureViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla zarządzania wybiegami
    """
    queryset = Enclosure.objects.all()
    serializer_class = EnclosureSerializer
    permission_classes = [IsManagerOrReadOnly]
    
    def get_queryset(self):
        """Zwraca listę wybiegów"""
        return Enclosure.objects.all().order_by('name')


class AnimalViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla zarządzania zwierzętami
    """
    queryset = Animal.objects.all()
    serializer_class = AnimalSerializer
    permission_classes = [IsManagerOrReadOnly]
    
    def get_queryset(self):
        """Zwraca listę zwierząt"""
        queryset = Animal.objects.all().order_by('species', 'name')
        
        # Filtrowanie po wybiegu jeśli podano parametr
        enclosure_id = self.request.query_params.get('enclosure', None)
        if enclosure_id is not None:
            queryset = queryset.filter(enclosure_id=enclosure_id)
        
        return queryset


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla zarządzania zadaniami
    """
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [CanEditOwnTasksOnly]
    
    def get_queryset(self):
        """Zwraca listę zadań w zależności od roli użytkownika"""
        user = self.request.user
        queryset = Task.objects.all().order_by('-task_timestamp')
        
        # Jeśli to pracownik, pokaż tylko jego zadania
        if user.role == 'worker':
            queryset = queryset.filter(employee=user)
        
        # Filtrowanie po pracowniku jeśli podano parametr (tylko dla managera)
        employee_id = self.request.query_params.get('employee', None)
        if employee_id is not None and user.role == 'manager':
            queryset = queryset.filter(employee_id=employee_id)
        
        # Filtrowanie po statusie ukończenia
        is_completed = self.request.query_params.get('completed', None)
        if is_completed is not None:
            queryset = queryset.filter(is_completed=is_completed.lower() == 'true')
        
        return queryset
    
    def get_serializer_class(self):
        """Zwraca odpowiedni serializer w zależności od akcji i roli"""
        if self.action in ['partial_update', 'update'] and self.request.user.role == 'worker':
            return TaskCompletionSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        """Automatycznie przypisuje managera jako twórcę zadania"""
        serializer.save()
    
    @action(detail=True, methods=['patch'], permission_classes=[CanEditOwnTasksOnly])
    def complete(self, request, pk=None):
        """Endpoint do oznaczania zadania jako ukończone"""
        task = self.get_object()
        
        # Sprawdź czy użytkownik może edytować to zadanie
        if request.user.role != 'manager' and task.employee != request.user:
            return Response(
                {'error': 'Nie masz uprawnień do edycji tego zadania'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        task.is_completed = True
        comments = request.data.get('comments', '')
        if comments:
            task.comments = comments
        task.save()
        
        serializer = TaskSerializer(task)
        return Response(serializer.data)


class LoginAPIView(APIView):
    """
    Endpoint do logowania i otrzymywania tokenów JWT
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Wymagane są pola username i password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': EmployeeSerializer(user).data
            })
        else:
            return Response(
                {'error': 'Nieprawidłowe dane logowania'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


class DashboardAPIView(APIView):
    """
    Endpoint do pobierania danych dashboardu
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Podstawowe statystyki
        total_employees = Employee.objects.count()
        total_enclosures = Enclosure.objects.count()
        total_animals = Animal.objects.count()
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(is_completed=True).count()
        pending_tasks = total_tasks - completed_tasks
        
        data = {
            'user': EmployeeSerializer(user).data,
            'statistics': {
                'total_employees': total_employees,
                'total_enclosures': total_enclosures,
                'total_animals': total_animals,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'pending_tasks': pending_tasks,
            }
        }
        
        # Dodatkowe dane dla pracownika
        if user.role == 'worker':
            my_tasks = Task.objects.filter(employee=user).count()
            my_completed_tasks = Task.objects.filter(employee=user, is_completed=True).count()
            my_pending_tasks = my_tasks - my_completed_tasks
            
            data['my_tasks'] = {
                'total': my_tasks,
                'completed': my_completed_tasks,
                'pending': my_pending_tasks,
            }
        
        return Response(data)

