from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('tasks/', views.task_list_view, name='task_list'),
    path('enclosures/', views.enclosure_list_view, name='enclosure_list'),
    path('animals/', views.animal_list_view, name='animal_list'),
    
    # URL-e tylko dla Managera
    path('employee/add/', views.add_employee_view, name='add_employee'),
    path('animal/add/', views.add_animal_view, name='add_animal'),
    path('task/assign/', views.assign_task_view, name='assign_task'), # Lub np. 'task/add/'
]
