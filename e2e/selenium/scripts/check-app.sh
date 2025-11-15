#!/bin/bash

# Script pour vérifier si l'application est démarrée

echo "🔍 Vérification de l'application..."

# Vérifier le frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")

# Vérifier le backend (plusieurs ports possibles)
BACKEND_STATUS_3000=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/reconcil/api/shop 2>/dev/null || echo "000")
BACKEND_STATUS_3001=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/reconcil/api/shop 2>/dev/null || echo "000")
BACKEND_STATUS_3003=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/reconcil/api/shop 2>/dev/null || echo "000")

# Utiliser le premier port qui répond
if [ "$BACKEND_STATUS_3000" = "200" ] || [ "$BACKEND_STATUS_3000" = "404" ] || [ "$BACKEND_STATUS_3000" = "401" ]; then
  BACKEND_STATUS=$BACKEND_STATUS_3000
  BACKEND_PORT=3000
elif [ "$BACKEND_STATUS_3001" = "200" ] || [ "$BACKEND_STATUS_3001" = "404" ] || [ "$BACKEND_STATUS_3001" = "401" ]; then
  BACKEND_STATUS=$BACKEND_STATUS_3001
  BACKEND_PORT=3001
elif [ "$BACKEND_STATUS_3003" = "200" ] || [ "$BACKEND_STATUS_3003" = "404" ] || [ "$BACKEND_STATUS_3003" = "401" ]; then
  BACKEND_STATUS=$BACKEND_STATUS_3003
  BACKEND_PORT=3003
else
  BACKEND_STATUS="000"
  BACKEND_PORT="?"
fi

if [ "$FRONTEND_STATUS" = "200" ] || [ "$FRONTEND_STATUS" = "000" ]; then
  if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend: http://localhost:3000 - DÉMARRÉ"
  else
    echo "❌ Frontend: http://localhost:3000 - NON DÉMARRÉ"
  fi
else
  echo "⚠️  Frontend: http://localhost:3000 - Code: $FRONTEND_STATUS"
fi

if [ "$BACKEND_STATUS" = "200" ] || [ "$BACKEND_STATUS" = "404" ] || [ "$BACKEND_STATUS" = "401" ]; then
  echo "✅ Backend: http://localhost:${BACKEND_PORT}/reconcil/api/shop - DÉMARRÉ"
elif [ "$BACKEND_STATUS" = "000" ]; then
  echo "❌ Backend: NON DÉMARRÉ (vérifié ports 3000, 3001, 3003)"
else
  echo "⚠️  Backend: Code: $BACKEND_STATUS"
fi

if [ "$FRONTEND_STATUS" != "200" ] || ([ "$BACKEND_STATUS" != "200" ] && [ "$BACKEND_STATUS" != "404" ] && [ "$BACKEND_STATUS" != "401" ]); then
  echo ""
  echo "📝 Pour démarrer l'application:"
  echo ""
  echo "Terminal 1 - Backend:"
  echo "  cd api && npm run start:dev"
  echo ""
  echo "Terminal 2 - Frontend:"
  echo "  cd client && npm start"
  echo ""
  exit 1
else
  echo ""
  echo "✅ L'application est prête pour les tests!"
  exit 0
fi

