import jwt
import time
import os
import sys

def create_jwt_token(role):
    """Create JWT token for given role with error handling"""
    try:
        jwt_secret = os.getenv('JWT_SECRET', 'default-secret-for-development-only')
        current_time = int(time.time())
        expiry_time = current_time + (365 * 24 * 60 * 60)  # 1 year
        
        payload = {
            "iss": "supabase",
            "ref": "default", 
            "role": role,
            "iat": current_time,
            "exp": expiry_time
        }
        
        token = jwt.encode(payload, jwt_secret, algorithm="HS256")
        return token
    except Exception as e:
        print(f"Error creating {role} token: {e}", file=sys.stderr)
        return None

if __name__ == "__main__":
    # Create ANON token
    anon_token = create_jwt_token("anon")
    if anon_token:
        print(f"ANON_KEY=[REDACTED]")
    
    # Create SERVICE_ROLE token  
    service_token = create_jwt_token("service_role")
    if service_token:
        print(f"SERVICE_ROLE_KEY=[REDACTED]")
    
    if not anon_token or not service_token:
        sys.exit(1)