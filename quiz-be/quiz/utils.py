from django.http import JsonResponse
from quiz import constants


def generate_success_response(message=None, data=None) -> JsonResponse:
    result = {"status": "success"}
    if data:
        result.update({"data": data})
    if message:
        result.update({"message": message})
    response = JsonResponse(result)
    response['Access-Control-Allow-Origin'] = constants.ACCEPT_ORIGIN
    return response


def generate_error_response(message) -> JsonResponse:
    response = JsonResponse({"status": "success", "message": message})
    response['Access-Control-Allow-Origin'] = constants.ACCEPT_ORIGIN
    return response
