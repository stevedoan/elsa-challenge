import json
from rest_framework.decorators import api_view
from .services import subscribe_to_quiz, store_current_point, get_leaderboard
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
@api_view(["POST"])
def subscribe_to_quiz_view(request):
    request_body = json.loads(request.body)

    username = request_body.get('username')
    quiz_id = request_body.get('quiz_id')
    session_id = request_body.get('session_id')

    return subscribe_to_quiz(username, quiz_id, session_id)


@csrf_exempt
@api_view(["POST"])
def store_current_point_view(request):
    request_body = json.loads(request.body)

    username = request_body.get('username')
    quiz_id = request_body.get('quiz_id')
    session_id = request_body.get('session_id')
    points = request_body.get('points', 0)

    return store_current_point(username, quiz_id, session_id, points)


@csrf_exempt
@api_view(["GET"])
def get_leaderboard_view(request):
    request_body = request.query_params

    quiz_id = request_body.get('quiz_id')
    session_id = request_body.get('session_id')

    return get_leaderboard(quiz_id, session_id)
