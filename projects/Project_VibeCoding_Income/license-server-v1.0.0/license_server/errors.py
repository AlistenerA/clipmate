# Version: v1.0.0
from __future__ import annotations

from dataclasses import dataclass

from flask import Flask, jsonify
from werkzeug.exceptions import BadRequest, RequestEntityTooLarge


@dataclass
class ApiError(Exception):
    error_code: str
    message: str
    status_code: int = 400


def success(data: dict, message: str = "ok", status_code: int = 200):
    return jsonify({"success": True, "data": data, "message": message}), status_code


def failure(error_code: str, message: str, status_code: int):
    return (
        jsonify(
            {
                "success": False,
                "error_code": error_code,
                "message": message,
            }
        ),
        status_code,
    )


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):
        return failure(error.error_code, error.message, error.status_code)

    @app.errorhandler(RequestEntityTooLarge)
    def handle_too_large(_error):
        return failure("REQUEST_TOO_LARGE", "request body is too large", 413)

    @app.errorhandler(BadRequest)
    def handle_bad_request(_error):
        return failure("INVALID_REQUEST", "request body must be valid JSON", 400)

    @app.errorhandler(404)
    def handle_not_found(_error):
        return failure("NOT_FOUND", "endpoint not found", 404)

    @app.errorhandler(Exception)
    def handle_unexpected(error: Exception):
        app.logger.exception("Unhandled license server error: %s", type(error).__name__)
        return failure("INTERNAL_ERROR", "internal server error", 500)
