from rest_framework import serializers
from typing import TYPE_CHECKING
from .models import Employee, Enclosure, Animal, Task

if TYPE_CHECKING:
    from django.db.models import QuerySet


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer dla modelu Employee"""
    password = serializers.CharField(write_only=True, required=False)
    enclosures = serializers.PrimaryKeyRelatedField(many=True, queryset=Enclosure.objects.all(), required=False)  # type: ignore
    
    class Meta:
        model = Employee
        fields = ['id', 'username', 'imie', 'nazwisko', 'role', 'is_staff', 'is_active', 'enclosures', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        """Tworzenie nowego pracownika z hashowanym hasłem i przypisaniem wybiegów"""
        enclosures = validated_data.pop('enclosures', None)
        password = validated_data.pop('password', None)
        employee = Employee(**validated_data)
        if password:
            employee.set_password(password)
        employee.save()
        if enclosures is not None:
            employee.enclosures.set(list(enclosures))  # type: ignore
        return employee
    
    def update(self, instance, validated_data):
        """Aktualizacja pracownika z opcjonalną zmianą hasła"""
        password = validated_data.pop('password', None)
        enclosures = validated_data.pop('enclosures', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        
        # Handle many-to-many enclosures field separately
        if enclosures is not None:
            instance.enclosures.set(list(enclosures))  # type: ignore
        
        return instance


class EnclosureSerializer(serializers.ModelSerializer):
    """Serializer dla modelu Enclosure"""
    current_animal_count = serializers.ReadOnlyField()
    responsible_employees = serializers.SerializerMethodField()
    
    class Meta:
        model = Enclosure
        fields = ['id', 'name', 'responsible_employees', 'current_animal_count']
    
    def get_responsible_employees(self, obj):
        return [emp.get_full_name() for emp in obj.responsible_employees.all()]


class AnimalSerializer(serializers.ModelSerializer):
    """Serializer dla modelu Animal"""
    enclosure_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Animal
        fields = ['id', 'species', 'name', 'gender', 'enclosure', 'enclosure_name', 'health']
        extra_kwargs = {
            'species': {'required': False},
            'name': {'required': False},
            'gender': {'required': False},
            'enclosure': {'required': False},
            'health': {'required': False},
        }
    
    def get_enclosure_name(self, obj):
        """Zwraca nazwę wybiegu"""
        if obj.enclosure:
            return obj.enclosure.name
        return None


class TaskSerializer(serializers.ModelSerializer):
    """Serializer dla modelu Task"""
    employee_name = serializers.SerializerMethodField()
    enclosure_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'task_timestamp', 'employee', 'employee_name', 'enclosure', 'enclosure_name', 'task_type', 'comments', 'is_completed']
    
    def get_employee_name(self, obj):
        """Zwraca pełne imię i nazwisko przypisanego pracownika"""
        if obj.employee:
            return obj.employee.get_full_name()
        return None
    
    def get_enclosure_name(self, obj):
        """Zwraca nazwę wybiegu"""
        if obj.enclosure:
            return obj.enclosure.name
        return None


class TaskCompletionSerializer(serializers.ModelSerializer):
    """Uproszczony serializer dla oznaczania zadań jako ukończone"""
    
    class Meta:
        model = Task
        fields = ['is_completed', 'comments']

