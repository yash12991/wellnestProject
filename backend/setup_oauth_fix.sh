#!/bin/bash

echo "=================================================="
echo "🔐 Google OAuth Session Fix - Quick Setup"
echo "=================================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
fi

# Generate random secrets
echo "🔑 Generating JWT secrets..."
ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

echo "✅ Secrets generated!"
echo ""

# Check if secrets already exist in .env
if grep -q "^ACCESS_TOKEN_SECRET=" .env; then
    echo "⚠️  ACCESS_TOKEN_SECRET already exists in .env"
    read -p "Do you want to replace it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i.bak "s/^ACCESS_TOKEN_SECRET=.*/ACCESS_TOKEN_SECRET=$ACCESS_SECRET/" .env
        echo "✅ ACCESS_TOKEN_SECRET updated"
    fi
else
    echo "ACCESS_TOKEN_SECRET=$ACCESS_SECRET" >> .env
    echo "✅ ACCESS_TOKEN_SECRET added"
fi

if grep -q "^REFRESH_TOKEN_SECRET=" .env; then
    echo "⚠️  REFRESH_TOKEN_SECRET already exists in .env"
    read -p "Do you want to replace it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sed -i.bak "s/^REFRESH_TOKEN_SECRET=.*/REFRESH_TOKEN_SECRET=$REFRESH_SECRET/" .env
        echo "✅ REFRESH_TOKEN_SECRET updated"
    fi
else
    echo "REFRESH_TOKEN_SECRET=$REFRESH_SECRET" >> .env
    echo "✅ REFRESH_TOKEN_SECRET added"
fi

# Add token expiry if not exists
if ! grep -q "^ACCESS_TOKEN_EXPIRY=" .env; then
    echo "ACCESS_TOKEN_EXPIRY=15m" >> .env
    echo "✅ ACCESS_TOKEN_EXPIRY added (15 minutes)"
fi

if ! grep -q "^REFRESH_TOKEN_EXPIRY=" .env; then
    echo "REFRESH_TOKEN_EXPIRY=7d" >> .env
    echo "✅ REFRESH_TOKEN_EXPIRY added (7 days)"
fi

echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "📋 Summary:"
echo "  - JWT secrets generated and added to .env"
echo "  - Access token expires in 15 minutes"
echo "  - Refresh token expires in 7 days"
echo "  - Session cookies last 7 days"
echo ""
echo "🚀 Next Steps:"
echo "  1. Restart your backend server: npm start"
echo "  2. Test Google login"
echo "  3. Check console logs for token refresh"
echo ""
echo "📚 Read GOOGLE_OAUTH_SESSION_FIX.md for details"
echo "=================================================="
