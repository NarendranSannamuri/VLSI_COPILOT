class AppError(Exception):
    """Base application error with an HTTP status and public detail."""

    def __init__(self, detail: str, status_code: int = 400):
        self.detail = detail
        self.status_code = status_code
        super().__init__(detail)


class ValidationError(AppError):
    def __init__(self, detail: str):
        super().__init__(detail=detail, status_code=400)


class NotFoundError(AppError):
    def __init__(self, detail: str = "Resource not found."):
        super().__init__(detail=detail, status_code=404)


class AIServiceError(AppError):
    def __init__(self, detail: str = "AI service unavailable. Please try again."):
        super().__init__(detail=detail, status_code=502)
