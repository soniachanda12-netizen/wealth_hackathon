#!/bin/bash

# Comprehensive Backend API Testing Script

echo "🧪 Private Banking Advisor Copilot - API Testing"
echo "==============================================="

# Set the backend URL (update this with your deployed URL)
BACKEND_URL="https://advisor-copilot-backend-608187465720.us-central1.run.app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local endpoint=$1
    local method=${2:-GET}
    local data=$3
    local expected_status=${4:-200}
    
    echo -n "Testing $method $endpoint... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL$endpoint")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$BACKEND_URL$endpoint")
    fi
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $response)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $response)"
        return 1
    fi
}

# Test function with response capture
test_endpoint_with_response() {
    local endpoint=$1
    local method=${2:-GET}
    local data=$3
    
    echo "Testing $method $endpoint..."
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$BACKEND_URL$endpoint")
    else
        response=$(curl -s -X "$method" -H "Content-Type: application/json" -d "$data" "$BACKEND_URL$endpoint")
    fi
    
    echo "Response preview: ${response:0:200}..."
    echo ""
}

echo "🏁 Starting API tests..."
echo ""

# Health Check Tests
echo "1. Health Check Endpoints"
echo "========================"
test_endpoint "/"
test_endpoint "/auth-check"
echo ""

# Core Banking Features
echo "2. Core Banking Features"
echo "======================="
test_endpoint "/todo"
test_endpoint "/nba"
test_endpoint "/aggregation"
test_endpoint "/ai-insights"
echo ""

# Message & Communication
echo "3. Message & Communication"
echo "========================="
test_endpoint "/draft-message" "POST" '{"text": "Portfolio review meeting", "client_id": "123"}'
test_endpoint "/calendar-invite" "POST" '{"details": "Portfolio review meeting with client"}'
test_endpoint "/summarize" "POST" '{"text": "Market analysis report for Q3 2025 showing strong performance in tech sector"}'
echo ""

# Data Management
echo "4. Data Management"
echo "=================="
test_endpoint "/ingest-data" "POST" '{"data": "Sample banking data for testing", "type": "txt"}'
echo ""

# Modern Dashboard Features
echo "5. Modern Dashboard Features"
echo "==========================="
test_endpoint "/dashboard-metrics"
test_endpoint "/looker-integration"
echo ""

# Chat System
echo "6. Chat System"
echo "=============="
test_endpoint "/chat" "POST" '{"message": "Show me my top clients", "advisor_name": "John Smith"}'
echo ""

# Detailed Response Tests
echo "7. Detailed Response Analysis"
echo "============================"
echo "Dashboard Metrics Response:"
test_endpoint_with_response "/dashboard-metrics"

echo "Looker Integration Response:"
test_endpoint_with_response "/looker-integration"

echo "AI Insights Response:"
test_endpoint_with_response "/ai-insights"

echo ""
echo "🏆 API Testing Complete!"
echo "========================"
echo "All core endpoints tested. Check individual results above."
echo ""
echo "🔍 Manual Testing Recommendations:"
echo "1. Test dashboard UI at frontend URL"
echo "2. Verify charts load correctly"
echo "3. Test Looker config download"
echo "4. Validate message sending functionality"
echo "5. Check data ingestion with real files"
