#!/bin/bash

# SUGRS MongoDB Setup Script
# This script helps set up MongoDB for local development

echo "🍃 SUGRS MongoDB Setup"
echo "======================================"
echo ""
echo "Choose MongoDB setup option:"
echo "1) Docker (Recommended - Auto setup)"
echo "2) Manual Docker commands"
echo "3) MongoDB Atlas (Cloud - Manual)"
echo "4) Local Homebrew installation"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
  1)
    echo "📦 Setting up MongoDB via Docker..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
      echo "❌ Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
      exit 1
    fi

    # Stop existing MongoDB container if running
    echo "Stopping existing MongoDB container (if any)..."
    docker stop mongodb 2>/dev/null || true
    docker rm mongodb 2>/dev/null || true

    # Start MongoDB container
    echo "Starting MongoDB container..."
    docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:latest

    echo "✅ MongoDB is running on localhost:27017"
    echo "   Database: sugrs"
    echo "   Connection: mongodb://localhost:27017/sugrs"
    echo ""
    echo "Next step: Run 'npm run start-servers' from the project root"
    ;;

  2)
    echo "📋 Docker Commands:"
    echo ""
    echo "1. Start MongoDB:"
    echo "   docker run -d --name mongodb -p 27017:27017 -v mongodb_data:/data/db mongo:latest"
    echo ""
    echo "2. Stop MongoDB:"
    echo "   docker stop mongodb"
    echo ""
    echo "3. Remove MongoDB:"
    echo "   docker rm mongodb"
    echo ""
    echo "4. View logs:"
    echo "   docker logs -f mongodb"
    ;;

  3)
    echo "☁️  MongoDB Atlas Setup:"
    echo ""
    echo "1. Go to https://www.mongodb.com/cloud/atlas"
    echo "2. Create a free account"
    echo "3. Create a new cluster (free tier available)"
    echo "4. In Database Access, create a user"
    echo "5. In Network Access, add your IP (or 0.0.0.0/0)"
    echo "6. Click 'Connect' and copy the connection string"
    echo "7. Update backend/.env with your MONGODB_URI"
    echo ""
    echo "Example .env line:"
    echo "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sugrs"
    ;;

  4)
    echo "📦 Installing MongoDB via Homebrew..."
    echo ""
    echo "Running: brew tap mongodb/brew && brew install mongodb-community"
    brew tap mongodb/brew
    brew install mongodb-community

    echo ""
    echo "Starting MongoDB service..."
    brew services start mongodb-community

    echo "✅ MongoDB is installed and running"
    echo "   Connection: mongodb://localhost:27017/sugrs"
    echo ""
    echo "To stop: brew services stop mongodb-community"
    echo "To restart: brew services restart mongodb-community"
    ;;

  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

