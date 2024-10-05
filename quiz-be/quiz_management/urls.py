from django.urls import path
from . import views

urlpatterns = [
    path('api/sapi/subscribe/', views.subscribe_to_quiz_view),
    path('api/sapi/store_points/', views.store_current_point_view),
    path('api/sapi/leaderboard/', views.get_leaderboard_view),
]