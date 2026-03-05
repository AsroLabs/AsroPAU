#!/bin/bash

# AsroPAU Docker Compose Management Script
# Handles cleanup and startup of the entire project

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header() {
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ ! -z "$pid" ]; then
        print_warning "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null || true
    fi
}

# Function to cleanup
cleanup() {
    print_header "🧹 CLEANING UP DOCKER ENVIRONMENT"
    
    # Kill any lingering Python processes
    print_warning "Killing any lingering Python processes..."
    pkill -f "python3.*main.py" 2>/dev/null || true
    
    # Remove containers
    print_warning "Stopping and removing Docker containers..."
    cd "$PROJECT_DIR"
    docker-compose down 2>/dev/null || true
    
    # Kill processes on specific ports
    print_warning "Freeing ports..."
    kill_port 5173
    kill_port 3000
    kill_port 8001
    kill_port 27017
    
    print_success "Cleanup completed"
}

# Function to start services
start() {
    print_header "🚀 STARTING ASROPAU SERVICES"
    
    cd "$PROJECT_DIR"
    
    # Build images
    print_warning "Building Docker images..."
    docker-compose build
    
    # Start services
    print_warning "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_warning "Waiting for services to be ready..."
    sleep 5
    
    # Check status
    docker-compose ps
    
    echo ""
    print_success "All services started!"
    echo ""
    echo -e "${GREEN}📍 Available endpoints:${NC}"
    echo -e "   Frontend:      ${BLUE}http://localhost:5173${NC}"
    echo -e "   Backend API:   ${BLUE}http://localhost:3000${NC}"
    echo -e "   Math Solver:   ${BLUE}http://localhost:8001${NC}"
    echo -e "   MongoDB:       ${BLUE}mongodb://localhost:27017${NC}"
    echo ""
}

# Function to show logs
logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Function to stop services
stop() {
    print_header "🛑 STOPPING SERVICES"
    cd "$PROJECT_DIR"
    docker-compose down
    print_success "Services stopped"
}

# Function to show status
status() {
    print_header "📊 SERVICE STATUS"
    cd "$PROJECT_DIR"
    docker-compose ps
}

# Main script
case "${1:-start}" in
    start)
        cleanup
        start
        ;;
    restart)
        cleanup
        start
        ;;
    stop)
        stop
        ;;
    cleanup)
        cleanup
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    *)
        echo "Usage: $0 {start|restart|stop|cleanup|status|logs [service]}"
        echo ""
        echo "Commands:"
        echo "  start       - Clean up and start all services (default)"
        echo "  restart     - Restart all services"
        echo "  stop        - Stop all services"
        echo "  cleanup     - Remove containers and kill lingering processes"
        echo "  status      - Show service status"
        echo "  logs [svc]  - Show logs (optionally for specific service)"
        exit 1
        ;;
esac
