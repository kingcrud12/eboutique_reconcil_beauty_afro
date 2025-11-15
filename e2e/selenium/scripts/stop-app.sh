#!/bin/bash

# Script pour arrêter l'application

echo "🛑 Arrêt de l'application..."

# Arrêter le backend
if [ -f /tmp/backend.pid ]; then
  BACKEND_PID=$(cat /tmp/backend.pid)
  if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo "Arrêt du backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm /tmp/backend.pid
  fi
fi

# Arrêter le frontend
if [ -f /tmp/frontend.pid ]; then
  FRONTEND_PID=$(cat /tmp/frontend.pid)
  if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo "Arrêt du frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm /tmp/frontend.pid
  fi
fi

# Nettoyer les processus Node.js restants
pkill -f "npm run start:dev" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

echo "✅ Application arrêtée"

