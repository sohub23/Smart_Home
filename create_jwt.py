import jwt
import time

JWT_SECRET = "cb485308485e3e45edffd4ece3c8aaae5a599905f48715e97017f6bc446fce2a"

# Create ANON token
anon_payload = {
    "iss": "supabase",
    "ref": "default",
    "role": "anon",
    "iat": int(time.time()),
    "exp": int(time.time()) + (365 * 24 * 60 * 60)  # 1 year
}

anon_token = jwt.encode(anon_payload, JWT_SECRET, algorithm="HS256")
print(f"ANON_KEY={anon_token}")

# Create SERVICE_ROLE token
service_payload = {
    "iss": "supabase", 
    "ref": "default",
    "role": "service_role",
    "iat": int(time.time()),
    "exp": int(time.time()) + (365 * 24 * 60 * 60)
}

service_token = jwt.encode(service_payload, JWT_SECRET, algorithm="HS256")
print(f"SERVICE_ROLE_KEY={service_token}")