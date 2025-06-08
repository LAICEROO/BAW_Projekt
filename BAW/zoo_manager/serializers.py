from rest_framework import serializers
from .models import Employee, Enclosure, Animal, Task


class EmployeeSerializer(serializers.ModelSerializer):
    """Serializer dla modelu Employee"""
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Employee
        fields = ['id', 'username', 'imie', 'nazwisko', 'role', 'is_staff', 'is_active', 'enclosure', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def create(self, validated_data):
        """Tworzenie nowego pracownika z hashowanym hasłem"""
        password = validated_data.pop('password', None)
        employee = Employee(**validated_data)
        if password:
            employee.set_password(password)
        employee.save()
        return employee
    
    def update(self, instance, validated_data):
        """Aktualizacja pracownika z opcjonalną zmianą hasła"""
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class EnclosureSerializer(serializers.ModelSerializer):
    """Serializer dla modelu Enclosure"""
    current_animal_count = serializers.ReadOnlyField()
    responsible_employee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Enclosure
        fields = ['id', 'name', 'responsible_employee', 'responsible_employee_name', 'current_animal_count']
    
    def get_responsible_employee_name(self, obj):
        """Zwraca pełne imię i nazwisko odpowiedzialnego pracownika"""
        if obj.responsible_employee:
            return obj.responsible_employee.get_full_name()
        return None


class AnimalSerializer(serializers.ModelSerializer):
    """Serializer dla modelu Animal"""
    enclosure_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Animal
        fields = ['id', 'species', 'name', 'gender', 'enclosure', 'enclosure_name']
    
    def get_enclosure_name(self, obj):
        """Zwraca nazwę wybiegu"""
        if obj.enclosure:
            return obj.enclosure.name
        return None


class TaskSerializer(serializers.ModelSerializer):
    """Serializer dla modelu Task"""
    employee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'task_timestamp', 'employee', 'employee_name', 'task_type', 'comments', 'is_completed']
    
    def get_employee_name(self, obj):
        """Zwraca pełne imię i nazwisko przypisanego pracownika"""
        if obj.employee:
            return obj.employee.get_full_name()
        return None


class TaskCompletionSerializer(serializers.ModelSerializer):
    """Uproszczony serializer dla oznaczania zadań jako ukończone"""
    
    class Meta:
        model = Task
        fields = ['is_completed', 'comments']

