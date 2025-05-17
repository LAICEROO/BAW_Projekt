from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('tasks/', views.task_list_view, name='task_list'),
    path('enclosures/', views.enclosure_list_view, name='enclosure_list'),
    path('animals/', views.animal_list_view, name='animal_list'),
    path('employees/', views.employee_list_view, name='employee_list'),
    
    # URL-e tylko dla Managera
    path('employee/add/', views.add_employee_view, name='add_employee'),
    path('employee/edit/<int:employee_id>/', views.edit_employee_view, name='edit_employee'),
    path('employee/delete/<int:employee_id>/', views.delete_employee_view, name='delete_employee'),
    path('animal/add/', views.add_animal_view, name='add_animal'),
    path('animal/edit/<int:animal_id>/', views.edit_animal_view, name='edit_animal'),
    path('enclosure/add/', views.add_enclosure_view, name='add_enclosure'),
    path('enclosure/edit/<int:enclosure_id>/', views.edit_enclosure_view, name='edit_enclosure'),
    path('task/assign/', views.assign_task_view, name='assign_task'),
    path('task/edit/<int:task_id>/', views.edit_task_view, name='edit_task'),
]
