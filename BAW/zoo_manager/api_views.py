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
    IsManagerOrReadOnly, IsManagerOnly, IsOwnerOrManager, CanEditOwnTasksOnly, CanEditAnimalHealth
)


class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla zarządzania pracownikami
    """
    queryset = Employee.objects.all()  # type: ignore
    serializer_class = EmployeeSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            return [IsOwnerOrManager()]
        elif self.action == 'change_password':
            return [permissions.IsAuthenticated()]
        return [IsManagerOrReadOnly()]
    
    def get_queryset(self):
        """Zwraca listę pracowników"""
        return Employee.objects.all().order_by('nazwisko', 'imie')  # type: ignore
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Endpoint do pobierania informacji o aktualnie zalogowanym użytkowniku"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def change_password(self, request, pk=None):
        """Endpoint do zmiany hasła"""
        print(f"=== CHANGE PASSWORD REQUEST ===")
        print(f"User: {request.user}")
        print(f"User ID: {request.user.id if request.user else 'None'}")
        print(f"User role: {request.user.role if request.user else 'None'}")
        print(f"Requested employee ID: {pk}")
        print(f"Request method: {request.method}")
        print(f"Request headers: {dict(request.headers)}")
        
        employee = self.get_object()
        print(f"Employee found: {employee}")
        print(f"Employee ID: {employee.id if employee else 'None'}")
        
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        print(f"Change password request for employee {employee.id}")
        print(f"Old password provided: {bool(old_password)}")
        print(f"New password provided: {bool(new_password)}")
        print(f"Request data: {request.data}")
        
        if not old_password or not new_password:
            return Response(
                {'error': 'Wymagane są pola old_password i new_password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not employee.check_password(old_password):
            print(f"Password check failed for employee {employee.id}")
            return Response(
                {'error': 'Nieprawidłowe stare hasło'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        employee.set_password(new_password)
        employee.save()
        print(f"Password changed successfully for employee {employee.id}")
        
        return Response({'message': 'Hasło zostało zmienione'})

    def update(self, request, *args, **kwargs):
        """Nadpisuje metodę update z debugowaniem"""
        print(f"=== EMPLOYEE UPDATE REQUEST ===")
        print(f"User: {request.user}")
        print(f"User ID: {request.user.id if request.user else 'None'}")
        print(f"User role: {request.user.role if request.user else 'None'}")
        print(f"Request method: {request.method}")
        print(f"Request data: {request.data}")
        print(f"Instance ID: {kwargs.get('pk')}")
        
        try:
            result = super().update(request, *args, **kwargs)
            print(f"Update successful: {result}")
            return result
        except Exception as e:
            print(f"Update failed with error: {e}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            raise

    def get_object(self):
        """Nadpisuje metodę get_object z debugowaniem"""
        print(f"=== GET_OBJECT CALLED ===")
        print(f"Lookup kwargs: {self.kwargs}")
        try:
            obj = super().get_object()
            print(f"Object found: {obj}")
            return obj
        except Exception as e:
            print(f"Get object failed: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            raise

    def get_serializer(self, *args, **kwargs):
        """Nadpisuje metodę get_serializer z debugowaniem"""
        print(f"=== GET_SERIALIZER CALLED ===")
        print(f"Args: {args}")
        print(f"Kwargs: {kwargs}")
        try:
            serializer = super().get_serializer(*args, **kwargs)
            print(f"Serializer created: {serializer}")
            return serializer
        except Exception as e:
            print(f"Get serializer failed: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            raise


class EnclosureViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla zarządzania wybiegami
    """
    queryset = Enclosure.objects.all()  # type: ignore
    serializer_class = EnclosureSerializer
    permission_classes = [IsManagerOrReadOnly]
    
    def get_queryset(self):
        """Zwraca listę wybiegów"""
        return Enclosure.objects.all().order_by('name')  # type: ignore


class AnimalViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla zarządzania zwierzętami
    """
    queryset = Animal.objects.all()  # type: ignore
    serializer_class = AnimalSerializer
    permission_classes = [CanEditAnimalHealth]
    
    def get_queryset(self):
        """Zwraca listę zwierząt"""
        queryset = Animal.objects.all().order_by('species', 'name')  # type: ignore
        
        # Filtrowanie po wybiegu jeśli podano parametr
        enclosure_id = self.request.query_params.get('enclosure', None)
        if enclosure_id is not None:
            queryset = queryset.filter(enclosure_id=enclosure_id)
        
        return queryset

    def update(self, request, *args, **kwargs):
        """Nadpisuje metodę update, aby pracownicy mogli tylko zmieniać stan zdrowia"""
        instance = self.get_object()
        
        # Debug: wyświetl dane żądania
        print(f"Method: {request.method}")
        print(f"User role: {request.user.role}")
        print(f"Request data: {request.data}")
        print(f"Request data keys: {list(request.data.keys())}")
        print(f"Health value: {request.data.get('health')} (type: {type(request.data.get('health'))})")
        
        # Jeśli użytkownik jest pracownikiem
        if request.user.role == 'worker':
            # Sprawdź czy próbuje zmienić tylko stan zdrowia
            if set(request.data.keys()) != {'health'}:
                print(f"Worker trying to update fields other than health: {request.data.keys()}")
                return Response(
                    {'error': 'Możesz edytować tylko stan zdrowia zwierzęcia'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        try:
            result = super().update(request, *args, **kwargs)
            print(f"Update successful: {result}")
            return result
        except Exception as e:
            print(f"Update failed with error: {e}")
            raise

    def partial_update(self, request, *args, **kwargs):
        """Nadpisuje metodę partial_update, aby używała tej samej logiki co update"""
        return self.update(request, *args, **kwargs)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet dla zarządzania zadaniami
    """
    queryset = Task.objects.all()  # type: ignore
    serializer_class = TaskSerializer
    permission_classes = [CanEditOwnTasksOnly]
    
    def get_queryset(self):
        """Zwraca listę zadań"""
        queryset = Task.objects.all().order_by('-task_timestamp')  # type: ignore
        
        # Filtrowanie po pracowniku jeśli podano parametr (tylko dla managera)
        employee_id = self.request.query_params.get('employee', None)
        if employee_id is not None and self.request.user.role == 'manager':
            queryset = queryset.filter(employee_id=employee_id)
        
        # Filtrowanie po statusie ukończenia
        is_completed = self.request.query_params.get('completed', None)
        if is_completed is not None:
            queryset = queryset.filter(is_completed=is_completed.lower() == 'true')  # type: ignore
        
        return queryset
    
    def get_serializer_class(self):
        """Zwraca odpowiedni serializer w zależności od akcji i roli"""
        if self.action in ['update', 'partial_update']:
            if self.request.user.role == 'worker':
                # Pracownik może tylko oznaczyć zadanie jako ukończone
                return TaskCompletionSerializer
        return TaskSerializer

    def update(self, request, *args, **kwargs):
        """Nadpisuje metodę update, aby pracownicy mogli tylko oznaczać swoje zadania jako ukończone"""
        instance = self.get_object()
        
        # Jeśli użytkownik jest pracownikiem
        if request.user.role == 'worker':
            # Sprawdź czy to jego zadanie
            if instance.employee_id != request.user.id:
                return Response(
                    {'error': 'Możesz edytować tylko swoje zadania'},
                    status=status.HTTP_403_FORBIDDEN
                )
            # Pracownik może tylko oznaczyć zadanie jako ukończone i dodać komentarz
            serializer = TaskCompletionSerializer(instance, data=request.data, partial=True)
        else:
            # Manager może edytować wszystko
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.pop('partial', False))
        
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        """Nadpisuje metodę partial_update, aby używała tej samej logiki co update"""
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


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
        total_employees = Employee.objects.count()  # type: ignore
        total_enclosures = Enclosure.objects.count()  # type: ignore
        total_animals = Animal.objects.count()  # type: ignore
        total_tasks = Task.objects.count()  # type: ignore
        completed_tasks = Task.objects.filter(is_completed=True).count()  # type: ignore
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
            my_tasks = Task.objects.filter(employee=user).count()  # type: ignore
            my_completed_tasks = Task.objects.filter(employee=user, is_completed=True).count()  # type: ignore
            my_pending_tasks = my_tasks - my_completed_tasks
            
            data['my_tasks'] = {
                'total': my_tasks,
                'completed': my_completed_tasks,
                'pending': my_pending_tasks,
            }
        
        return Response(data)

