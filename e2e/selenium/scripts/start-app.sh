#!/bin/bash

# Script pour démarrer l'application avant les tests

echo "🚀 Démarrage de l'application pour les tests E2E..."

# Ports possibles pour le backend (3000 par défaut, 3003 si PORT=3003)
BACKEND_PORT=${BACKEND_PORT:-3000}
BACKEND_URL="http://localhost:${BACKEND_PORT}/reconcil/api/shop"

# Vérifier si l'application est déjà démarrée
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}" 2>/dev/null || echo "000")

if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ]; then
  echo "✅ L'application est déjà démarrée!"
  exit 0
fi

# Démarrer le backend en arrière-plan
if [ "$BACKEND_STATUS" != "200" ]; then
  echo "📦 Démarrage du backend..."
  cd ../../api
  npm run start:dev > /tmp/backend.log 2>&1 &
  BACKEND_PID=$!
  echo $BACKEND_PID > /tmp/backend.pid
  echo "Backend démarré (PID: $BACKEND_PID)"
  
  # Attendre que le backend soit prêt
  echo "⏳ Attente du backend sur ${BACKEND_URL}..."
  for i in {1..60}; do
    sleep 2
    # Vérifier plusieurs ports possibles
    STATUS_3000=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/reconcil/api/shop" 2>/dev/null || echo "000")
    STATUS_3001=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/reconcil/api/shop" 2>/dev/null || echo "000")
    STATUS_3003=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3003/reconcil/api/shop" 2>/dev/null || echo "000")
    
    if [ "$STATUS_3000" = "200" ] || [ "$STATUS_3000" = "404" ] || [ "$STATUS_3000" = "401" ]; then
      BACKEND_PORT=3000
      BACKEND_URL="http://localhost:3000/reconcil/api/shop"
      echo "✅ Backend prêt sur port 3000!"
      break
    elif [ "$STATUS_3001" = "200" ] || [ "$STATUS_3001" = "404" ] || [ "$STATUS_3001" = "401" ]; then
      BACKEND_PORT=3001
      BACKEND_URL="http://localhost:3001/reconcil/api/shop"
      echo "✅ Backend prêt sur port 3001!"
      break
    elif [ "$STATUS_3003" = "200" ] || [ "$STATUS_3003" = "404" ] || [ "$STATUS_3003" = "401" ]; then
      BACKEND_PORT=3003
      BACKEND_URL="http://localhost:3003/reconcil/api/shop"
      echo "✅ Backend prêt sur port 3003!"
      break
    fi
    if [ $((i % 5)) -eq 0 ]; then
      echo "   Tentative $i/60... (vérification des ports 3000, 3001, 3003)"
    fi
  done
fi

# Démarrer le frontend en arrière-plan
if [ "$FRONTEND_STATUS" != "200" ]; then
  echo "🌐 Démarrage du frontend..."
  cd ../client
  npm start > /tmp/frontend.log 2>&1 &
  FRONTEND_PID=$!
  echo $FRONTEND_PID > /tmp/frontend.pid
  echo "Frontend démarré (PID: $FRONTEND_PID)"
  
  # Attendre que le frontend soit prêt
  echo "⏳ Attente du frontend..."
  for i in {1..60}; do
    sleep 2
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
    if [ "$STATUS" = "200" ]; then
      echo "✅ Frontend prêt!"
      break
    fi
    echo "   Tentative $i/60..."
  done
fi

# Vérification finale
FRONTEND_FINAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
BACKEND_FINAL=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}" 2>/dev/null || echo "000")

if [ "$FRONTEND_FINAL" = "200" ] && ([ "$BACKEND_FINAL" = "200" ] || [ "$BACKEND_FINAL" = "404" ] || [ "$BACKEND_FINAL" = "401" ]); then
  echo ""
  echo "✅ Application prête pour les tests!"
  echo "   Frontend: http://localhost:3000"
  echo "   Backend: ${BACKEND_URL} (port ${BACKEND_PORT})"
  echo ""
  echo "⚠️  Pour arrêter l'application, exécutez:"
  echo "   ./scripts/stop-app.sh"
  exit 0
else
  echo ""
  echo "❌ L'application n'a pas pu démarrer correctement"
  echo "   Frontend: $FRONTEND_FINAL"
  echo "   Backend: $BACKEND_FINAL (${BACKEND_URL})"
  echo ""
  echo "📝 Logs disponibles:"
  echo "   Backend: tail -f /tmp/backend.log"
  echo "   Frontend: tail -f /tmp/frontend.log"
  echo ""
  echo "💡 Vérifiez les logs pour plus de détails"
  exit 1
fi

