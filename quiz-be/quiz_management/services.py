from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.http import JsonResponse
from datetime import datetime
from quiz import connect
from quiz import constants
from quiz.utils import generate_success_response, generate_error_response


db = getattr(connect.client, constants.DB_NAME)
quiz_collection = getattr(db, constants.QUIZ_COLLECTION)


def subscribe_to_quiz(username, quiz_id, session_id):
    subscription = {
        "username": username,
        "quiz_id": quiz_id,
        "session_id": session_id,
        "subscribed_at": datetime.utcnow(),
        "points": 0
    }
    result = quiz_collection.insert_one(subscription)
    if result.acknowledged:
        return generate_success_response(message="Subscribed successfully")
    return generate_error_response(message="Subscription failed")


def store_current_point(username, quiz_id, session_id, points):
    query = {
        "username": username,
        "quiz_id": quiz_id,
        "session_id": session_id
    }
    update = {"$set": {"points": points}}

    if points == 0:
        return generate_success_response(message="Points updated successfully")

    channel_layer = get_channel_layer()
    group_name = f'quiz_{quiz_id}_session_{session_id}'
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'chat_message',
            'message': f'{username}:{points}'
        }
    )

    result = quiz_collection.update_one(query, update)
    if result.matched_count > 0:
        return generate_success_response(message="Points updated successfully")

    return generate_error_response(message="Update failed")


def get_leaderboard(quiz_id, session_id):
    query = {"quiz_id": quiz_id, "session_id": session_id}
    leaderboard = quiz_collection.find(query).sort("points", -1).limit(10)

    result = [
        {"username": entry["username"], "points": entry["points"]}
        for entry in leaderboard
    ]

    return generate_success_response(data=result)

