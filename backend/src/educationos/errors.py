class DomainError(Exception):
    def __init__(self, status: int, code: str, message: str):
        self.status, self.code, self.message = status, code, message
        super().__init__(message)


def unavailable():
    return DomainError(503, "UNAVAILABLE", "This capability is unavailable in synthetic preview.")


def forbidden():
    return DomainError(403, "FORBIDDEN", "Access is not permitted.")


def not_found():
    return DomainError(404, "NOT_FOUND", "Resource was not found.")
