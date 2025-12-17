# 🚀 Quick Deployment Guide

## สำหรับ Ubuntu Server

### วิธีที่ 1: ใช้ Automated Script (แนะนำ)

```bash
# 1. ดาวน์โหลด script
wget https://raw.githubusercontent.com/YOUR_REPO/webcomcamp24/main/deploy.sh

# 2. ให้สิทธิ์ execute
chmod +x deploy.sh

# 3. รัน script (ตั้งค่า REPO_URL ก่อน)
REPO_URL="https://github.com/YOUR_REPO/webcomcamp24.git" ./deploy.sh
```

### วิธีที่ 2: Manual Deployment

```bash
# 1. ลบ deployment เก่า (ถ้ามี)
cd /opt/webcomcamp24
docker-compose -f infra/docker-compose.prod.yml down
docker system prune -a --volumes -f
sudo rm -rf /opt/webcomcamp24

# 2. Clone repository ใหม่
cd /opt
git clone <YOUR_REPO_URL> webcomcamp24
cd webcomcamp24

# 3. ตั้งค่า environment
cat > server/.env << 'EOF'
MONGO_URI=mongodb://mongodb:27017/webcomampdb
PORT=5000
EOF

# 4. Build และ start
docker-compose -f infra/docker-compose.prod.yml build --no-cache
docker-compose -f infra/docker-compose.prod.yml up -d

# 5. สร้าง admin account
docker exec -it webcomcamp24-server-prod node scripts/seedAdmin.js admincomcamp comcamp@csmju

# 6. ตรวจสอบ logs
docker-compose -f infra/docker-compose.prod.yml logs -f
```

---

## คำสั่งที่ใช้บ่อย

### ดูสถานะ

```bash
cd /opt/webcomcamp24
docker-compose -f infra/docker-compose.prod.yml ps
```

### ดู Logs

```bash
# ทั้งหมด
docker-compose -f infra/docker-compose.prod.yml logs -f

# เฉพาะ server
docker logs webcomcamp24-server-prod -f
```

### Restart Services

```bash
docker-compose -f infra/docker-compose.prod.yml restart
```

### Stop Services

```bash
docker-compose -f infra/docker-compose.prod.yml down
```

### อัปเดตโค้ด

```bash
cd /opt/webcomcamp24
git pull origin main
docker-compose -f infra/docker-compose.prod.yml up -d --build
```

---

## การตั้งค่า Firewall (UFW)

```bash
# เปิด ports ที่จำเป็น
sudo ufw allow 80/tcp    # Frontend
sudo ufw allow 5000/tcp  # Backend API
sudo ufw allow 22/tcp    # SSH

# เปิดใช้งาน firewall
sudo ufw enable

# ตรวจสอบสถานะ
sudo ufw status
```

---

## ข้อมูลการเข้าถึง

- **Frontend**: `http://YOUR_SERVER_IP`
- **Backend API**: `http://YOUR_SERVER_IP:5000`
- **Admin Login**: ใช้ username/password ที่สร้างไว้

---

📖 **สำหรับรายละเอียดเพิ่มเติม**: ดูที่ [DEPLOYMENT.md](./DEPLOYMENT.md)
