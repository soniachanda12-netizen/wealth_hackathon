#!/bin/bash
echo "Restarting Advisor Copilot with fresh build..."
cd /home/prakashb/Prakash/project_hackathon
docker-compose down
echo "🔄 Rebuilding and starting services..."
docker-compose up --build -d
echo ""
echo "✅ Services restarted successfully!"
echo "🔗 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "📋 To view logs: docker-compose logs -f"
