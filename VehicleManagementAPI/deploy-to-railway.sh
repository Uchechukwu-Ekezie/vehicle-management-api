#!/bin/bash

# Railway Deployment Script
# This script helps you prepare and deploy the Vehicle Management API to Railway

echo "================================================"
echo "Vehicle Management API - Railway Deployment"
echo "================================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"

# Check if we're in the right directory
if [ ! -f "VehicleManagementAPI.csproj" ]; then
    echo "❌ Error: VehicleManagementAPI.csproj not found"
    echo "Please run this script from the VehicleManagementAPI directory"
    exit 1
fi

echo "✅ Found VehicleManagementAPI.csproj"
echo ""

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Create/update .gitignore if needed
if [ ! -f ".gitignore" ]; then
    echo "📝 .gitignore not found, using the one in parent directory"
fi

# Add all files
echo ""
echo "📦 Staging files for commit..."
git add .

# Show status
echo ""
echo "📊 Git status:"
git status --short

# Commit
echo ""
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Deploy Vehicle Management API to Railway"
fi

git commit -m "$commit_message" || echo "⚠️  No changes to commit or already committed"

# Check if remote exists
if git remote get-url origin &> /dev/null; then
    echo ""
    echo "✅ Git remote 'origin' is already configured:"
    git remote get-url origin
    echo ""
    read -p "Do you want to push to this remote? (y/n): " push_now
    if [ "$push_now" = "y" ] || [ "$push_now" = "Y" ]; then
        echo "📤 Pushing to GitHub..."
        git push -u origin main || git push -u origin master
        echo "✅ Pushed to GitHub!"
    fi
else
    echo ""
    echo "⚠️  No git remote configured"
    echo ""
    echo "Next steps:"
    echo "1. Create a new repository on GitHub: https://github.com/new"
    echo "2. Run these commands to add the remote and push:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/vehicle-management-api.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi

echo ""
echo "================================================"
echo "✨ Repository prepared for Railway deployment!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. If not done already, push to GitHub (see instructions above)"
echo ""
echo "2. Deploy to Railway:"
echo "   • Go to https://railway.app"
echo "   • Sign in with GitHub"
echo "   • Click 'New Project'"
echo "   • Select 'Deploy from GitHub repo'"
echo "   • Choose your repository"
echo ""
echo "3. Add MySQL Database:"
echo "   • In your Railway project, click '+ New'"
echo "   • Select 'Database' → 'MySQL'"
echo ""
echo "4. Set Environment Variables:"
echo "   • JWT_SECRET_KEY (create a strong secret)"
echo "   • ASPNETCORE_ENVIRONMENT=Production"
echo "   • DATABASE_URL (auto-set by Railway MySQL)"
echo ""
echo "5. Run Migrations:"
echo "   • Install Railway CLI: npm i -g @railway/cli"
echo "   • railway login"
echo "   • railway link (select your project)"
echo "   • railway run dotnet ef database update"
echo ""
echo "6. Generate Domain:"
echo "   • Go to Settings → Domains → Generate Domain"
echo ""
echo "📖 See RAILWAY_DEPLOYMENT.md for detailed instructions"
echo ""
