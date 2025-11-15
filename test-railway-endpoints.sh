#!/bin/bash

# Test Railway API Endpoints
BASE_URL="https://vehicle-management-api-production.up.railway.app"

echo "============================================"
echo "🧪 Testing Railway API Endpoints"
echo "============================================"
echo ""

# Test 1: Health Check (Public endpoint)
echo "1️⃣ Testing Health/Root endpoint..."
curl -X GET "$BASE_URL/" -w "\nStatus: %{http_code}\n\n"

# Test 2: Swagger Documentation
echo "2️⃣ Testing Swagger endpoint..."
curl -X GET "$BASE_URL/swagger/v1/swagger.json" -w "\nStatus: %{http_code}\n\n" | head -20

# Test 3: Register new admin user (should work without CORS)
echo "3️⃣ Testing user registration..."
curl -X POST "$BASE_URL/api/Auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@test.com",
    "password": "Admin@123",
    "fullName": "System Administrator",
    "role": "Admin"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 4: Login to get token
echo "4️⃣ Testing login..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/Auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }')

echo "$TOKEN_RESPONSE" | head -20
echo ""

# Extract token (if jq is installed)
if command -v jq &> /dev/null; then
  TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token')
  
  if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ Token obtained successfully!"
    echo ""
    
    # Test 5: Get all vehicles (should return empty array)
    echo "5️⃣ Testing vehicles endpoint..."
    curl -X GET "$BASE_URL/api/Vehicles" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus: %{http_code}\n\n"
    
    # Test 6: Get all users
    echo "6️⃣ Testing users endpoint..."
    curl -X GET "$BASE_URL/api/Users" \
      -H "Authorization: Bearer $TOKEN" \
      -w "\nStatus: %{http_code}\n\n"
    
    echo ""
    echo "✅ Save this token for testing:"
    echo "$TOKEN"
  fi
else
  echo "ℹ️  Install 'jq' to automatically extract token"
fi

echo ""
echo "============================================"
echo "✅ Testing complete!"
echo "============================================"
