import bcrypt

def get_password_hash(password: str) -> str:
    # Convert string to bytes, generate salt, and hash
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_bytes.decode('utf-8')  # Return string for database storage

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Check if the plain password matches the hash
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except (ValueError, TypeError):
        # Handles cases where the hash is invalid or malformed
        return False