# Security Testing Script
# Test all malicious payloads to verify protection

Write-Host "🔒 Security Testing Script" -ForegroundColor Cyan
Write-Host "Testing protection against malicious requests`n" -ForegroundColor Yellow

$baseUrl = "http://localhost:5000/api/auth/login"

# Test 1: NoSQL Injection with $gt operator
Write-Host "Test 1: NoSQL Injection (\$gt operator)" -ForegroundColor Yellow
$payload1 = '{"username":{"$gt":""},"password":{"$gt":""}}'
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $payload1 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ FAILED: Request should have been blocked" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASSED: Blocked with 400 Bad Request" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 2: NoSQL Injection with $ne operator
Write-Host "`nTest 2: NoSQL Injection (\$ne operator)" -ForegroundColor Yellow
$payload2 = '{"username":{"$ne":""},"password":{"$ne":""}}'
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $payload2 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ FAILED: Request should have been blocked" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASSED: Blocked with 400 Bad Request" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 3: Malformed JSON
Write-Host "`nTest 3: Malformed JSON" -ForegroundColor Yellow
$payload3 = '{"username":"test","password":||+1%3d%3d}'
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $payload3 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ FAILED: Request should have been blocked" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASSED: Blocked with 400 Bad Request" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 4: Type confusion - non-string username
Write-Host "`nTest 4: Type Confusion (non-string username)" -ForegroundColor Yellow
$payload4 = '{"username":123,"password":"test"}'
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $payload4 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ FAILED: Request should have been blocked" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASSED: Blocked with 400 Bad Request" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 5: Type confusion - boolean password
Write-Host "`nTest 5: Type Confusion (boolean password)" -ForegroundColor Yellow
$payload5 = '{"username":"admin","password":true}'
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $payload5 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ FAILED: Request should have been blocked" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASSED: Blocked with 400 Bad Request" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 6: Empty strings
Write-Host "`nTest 6: Empty Strings" -ForegroundColor Yellow
$payload6 = '{"username":"","password":""}'
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $payload6 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ FAILED: Request should have been blocked" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASSED: Blocked with 400 Bad Request" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 7: SQL Injection attempt
Write-Host "`nTest 7: SQL Injection Pattern" -ForegroundColor Yellow
$payload7 = '{"username":"admin'' OR 1=1--","password":"test"}'
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $payload7 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ FAILED: Request should have been blocked" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ PASSED: Invalid credentials (safely rejected)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 8: Oversized input
Write-Host "`nTest 8: Oversized Input (>100 chars)" -ForegroundColor Yellow
$longString = "a" * 150
$payload8 = "{`"username`":`"$longString`",`"password`":`"test`"}"
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $payload8 -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ FAILED: Request should have been blocked" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "✅ PASSED: Blocked with 400 Bad Request" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Unexpected status code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Security Testing Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nNote: All malicious requests should be blocked with 400/401 status codes" -ForegroundColor Yellow
Write-Host "Check server logs for security warnings (⚠️ symbols)" -ForegroundColor Yellow
