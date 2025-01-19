#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting workflow tests...${NC}\n"

# Test 1: Develop Push
echo -e "${BLUE}Test 1: Push to develop branch${NC}"
echo -e "Expected: Should create canary version\n"
# cp workflows-test/fixtures/package.json package.json
act push -e workflows-test/events/develop-push.json

echo -e "\n${BLUE}Test 2: PR merge to master${NC}"
echo -e "Expected: Should create stable version\n"
act pull_request -e workflows-test/events/master-pr.json

echo -e "\n${BLUE}Test 3: Push to v3 branch${NC}"
echo -e "Expected: Should increment patch version\n"
act push -e workflows-test/events/v3-push.json