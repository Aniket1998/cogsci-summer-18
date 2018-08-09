"""experimentserver URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from experiments import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',views.front_view),
    #path('',views.home_view),
    path('form2_1/',views.form2_1),
    path('form2_2/',views.form2_2),
    
    path('exp1/',views.exp1_view),
    path('exp2/',views.exp2_view),
    path('exp3/',views.exp3_view),
    path('exp4/',views.exp4_view),
    path('exp/submit/',views.submit_view),
    path('data/<int:id>/',views.data_view)
    #path('exp/<int:id>/data/',views.data_view)
]
