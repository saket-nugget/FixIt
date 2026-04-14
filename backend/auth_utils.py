import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"

# This looks for the Bearer token in the Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT Secret not configured on server."
        )

    try:
        # Supabase JWTs are encoded with HS256
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_aud": False})
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if user_id is None:
            raise credentials_exception
            
        return {"id": user_id, "email": email}
    except jwt.ExpiredSignatureError:
        print("Auth Error: Token has expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTClaimsError:
        print("Auth Error: Invalid claims (check audience/issuer)")
        raise HTTPException(status_code=401, detail="Invalid token claims")
    except JWTError as e:
        print(f"Auth Error: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"Auth Error (Unexpected): {str(e)}")
        raise credentials_exception
