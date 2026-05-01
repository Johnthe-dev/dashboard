#!/bin/bash
set -e

# ─── Configuration ────────────────────────────────────────────────────────────
REPO_URL="https://github.com/Johnthe-dev/dashboard.git"
DOMAIN="johnthe.dev"
APP_DIR="/var/www/focal"
# ──────────────────────────────────────────────────────────────────────────────

echo "=== [1/6] Installing Node.js 22, git, nginx ==="
sudo apt-get update -qq
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - > /dev/null
sudo apt-get install -y nodejs git nginx

echo "Node $(node -v) | npm $(npm -v)"

echo ""
echo "=== [2/6] Cloning repository ==="
sudo mkdir -p /var/www
sudo git clone "$REPO_URL" "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"

echo ""
echo "=== [3/6] Building application ==="
cd "$APP_DIR"
npm ci
npm run build:web

echo ""
echo "=== [4/6] Configuring Nginx ==="
sudo tee /etc/nginx/sites-available/focal > /dev/null <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    root $APP_DIR/apps/web/dist;
    index index.html;

    # SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Long-cache hashed assets (Vite fingerprints filenames)
    location ~* \.(js|css|woff2?|svg|png|ico)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX

# Disable default site, enable focal
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/focal /etc/nginx/sites-enabled/focal
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo ""
echo "=== [5/6] Opening firewall ==="
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo ""
echo "=== [6/6] Creating deploy script ==="
cat > "$APP_DIR/deploy.sh" <<'DEPLOY'
#!/bin/bash
set -e
cd /var/www/focal
git pull
npm ci
npm run build:web
echo "Deploy complete."
DEPLOY
chmod +x "$APP_DIR/deploy.sh"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Setup complete!"
echo "  App:     http://$DOMAIN"
echo "  Deploys: cd $APP_DIR && ./deploy.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
