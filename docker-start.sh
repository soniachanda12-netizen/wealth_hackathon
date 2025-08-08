#!/bin/bash
echo "Starting Advisor Copilot with Docker..."
cd /home/prakashb/Prakash/project_hackathon
docker-compose up --build -d
echo ""
echo "✅ Services started successfully!"
echo "🔗 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "📋 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo ""
echo "Following logs (Ctrl+C to exit):"
docker-compose logs -f
