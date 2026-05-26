#!/bin/bash
# ============================================================
# HomeSync Frontend — Additional Directory Structure
# Repository: homesync-frontend
# 
# Prerequisites: Vite already configured with TypeScript + SWC
# Run this from INSIDE the homesync-frontend directory
# ============================================================

echo ""
echo "🚀 Setting up HomeSync directory structure..."
echo ""

# ── Components ──
mkdir -p src/components
touch src/components/.gitkeep

# ── Pages ──
mkdir -p src/pages
touch src/pages/.gitkeep

# ── Hooks ──
mkdir -p src/hooks
touch src/hooks/.gitkeep

# ── Services (API layer) ──
mkdir -p src/services
touch src/services/.gitkeep

# ── Utils ──
mkdir -p src/utils
touch src/utils/.gitkeep

# ── Types ──
mkdir -p src/types
touch src/types/.gitkeep

# ── Context (React Context providers) ──
mkdir -p src/context
touch src/context/.gitkeep

# ── Styles / Theme ──
mkdir -p src/styles
touch src/styles/.gitkeep

# ── Assets ──
mkdir -p src/assets/icons
mkdir -p src/assets/images
mkdir -p src/assets/fonts
touch src/assets/icons/.gitkeep
touch src/assets/images/.gitkeep
touch src/assets/fonts/.gitkeep

echo "✅ HomeSync directory structure created!"
echo ""
echo "Added to your Vite project:"
echo ""
echo "src/"
echo "├── components/            # Reusable UI components"
echo "│   └── .gitkeep"
echo "├── pages/                 # Route-level page components"
echo "│   └── .gitkeep"
echo "├── hooks/                 # Custom React hooks (useAuth, useChores, etc.)"
echo "│   └── .gitkeep"
echo "├── services/              # API service layer (Axios/Fetch wrappers)"
echo "│   └── .gitkeep"
echo "├── utils/                 # Helpers: formatCurrency, dateUtils, pushNotifications"
echo "│   └── .gitkeep"
echo "├── types/                 # TypeScript type definitions"
echo "│   └── .gitkeep"
echo "├── context/               # AuthContext, HouseholdContext"
echo "│   └── .gitkeep"
echo "├── styles/                # Global styles, CSS variables, theme tokens"
echo "│   └── .gitkeep"
echo "└── assets/"
echo "    ├── icons/             # Lucide or custom SVG icons"
echo "    │   └── .gitkeep"
echo "    ├── images/            # Empty state illustrations, logo"
echo "    │   └── .gitkeep"
echo "    └── fonts/             # Local font files (if not using Google Fonts CDN)"
echo "        └── .gitkeep"
echo ""
echo "📋 Next steps:"
echo "   1. npm install react-router-dom"
echo "   2. npm install axios"
echo "   3. Create .env with VITE_API_BASE_URL=http://localhost:3000/api"
echo "   4. npm run dev"
echo ""