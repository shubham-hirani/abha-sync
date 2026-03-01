#!/bin/bash
# ═══════════════════════════════════════
#  ABHA-Sync MVP - Test Runner
# ═══════════════════════════════════════

set -e

echo "═══════════════════════════════════════"
echo "  Running All Tests"
echo "═══════════════════════════════════════"
echo ""

PASS=0
FAIL=0

run_test() {
  local name=$1
  local dir=$2
  echo "─── Testing: $name ───"
  if cd "$dir" && npm test 2>&1; then
    echo "✅ $name: PASSED"
    PASS=$((PASS + 1))
  else
    echo "❌ $name: FAILED"
    FAIL=$((FAIL + 1))
  fi
  cd - > /dev/null
  echo ""
}

run_test "Shared Module" "services/shared"
run_test "AI Extraction" "services/ai-extraction"
run_test "Medical Normalization" "services/medical-normalization"
run_test "FHIR Generator" "services/fhir-generator"
run_test "ABHA Mock Service" "services/abha-mock-service"
run_test "API Gateway" "services/api-gateway"

echo "═══════════════════════════════════════"
echo "  Results: $PASS passed, $FAIL failed"
echo "═══════════════════════════════════════"

[ $FAIL -eq 0 ] && exit 0 || exit 1
