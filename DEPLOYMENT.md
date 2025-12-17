# 🚀 Ubuntu Server Deployment Guide - Webcomcamp24

## 📋 สารบัญ

1. [ข้อกำหนดเบื้องต้น](#ข้อกำหนดเบื้องต้น)
2. [การติดตั้ง Docker และ Docker Compose](#การติดตั้ง-docker-และ-docker-compose)
3. [การลบ Deployment เก่า](#การลบ-deployment-เก่า)
4. [การ Deploy เวอร์ชันใหม่](#การ-deploy-เวอร์ชันใหม่)
5. [การสร้างบัญชี Admin](#การสร้างบัญชี-admin)
6. [การตรวจสอบและ Monitoring](#การตรวจสอบและ-monitoring)
7. [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## ข้อกำหนดเบื้องต้น

### ระบบปฏิบัติการ

- Ubuntu 20.04 LTS หรือใหม่กว่า
- สิทธิ์ sudo access

### ฮาร์ดแวร์ขั้นต่ำ

- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB available

---

## การติดตั้ง Docker และ Docker Compose

### 1. อัปเดตระบบ

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. ติดตั้ง Docker

```bash
# ติดตั้ง dependencies
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# เพิ่ม Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# เพิ่ม Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# ติดตั้ง Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# เพิ่ม user ปัจจุบันเข้า docker group (ไม่ต้องใช้ sudo)
sudo usermod -aG docker $USER

# รีสตาร์ท session หรือ logout/login ใหม่
newgrp docker
```

### 3. ติดตั้ง Docker Compose

```bash
# ดาวน์โหลด Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# ให้สิทธิ์ execute
sudo chmod +x /usr/local/bin/docker-compose

# ตรวจสอบการติดตั้ง
docker --version
docker-compose --version
```

### 4. ติดตั้ง Git

```bash
sudo apt install -y git
```

---

## การลบ Deployment เก่า

### 1. หยุดและลบ Containers เก่า

```bash
# เข้าไปที่ directory โปรเจค (ถ้ามี)
cd ~/webcomcamp24 || cd /opt/webcomcamp24 || cd /var/www/webcomcamp24

# หยุด containers ทั้งหมด
docker-compose -f infra/docker-compose.prod.yml down

# หรือหยุดทุก container ที่เกี่ยวข้อง
docker stop $(docker ps -a -q --filter name=webcomcamp24)
docker rm $(docker ps -a -q --filter name=webcomcamp24)
```

### 2. ลบ Images เก่า

```bash
# ลบ images ที่เกี่ยวข้อง
docker rmi $(docker images --filter=reference='infra-*' -q)
docker rmi $(docker images --filter=reference='webcomcamp24*' -q)

# ลบ dangling images
docker image prune -f
```

### 3. ลบ Volumes (⚠️ ระวัง: จะลบข้อมูลในฐานข้อมูล)

```bash
# ดู volumes ที่มี
docker volume ls | grep webcomcamp

# ลบ volumes (ถ้าต้องการเริ่มต้นใหม่)
docker volume rm infra_mongodb_data

# หรือลบทุก unused volumes
docker volume prune -f
```

### 4. ลบโค้ดเก่า

```bash
# สำรองข้อมูลสำคัญก่อน (ถ้ามี)
# เช่น certificates, uploads, etc.

# ลบ directory เก่า
cd ~
sudo rm -rf ~/webcomcamp24
# หรือ
sudo rm -rf /opt/webcomcamp24
# หรือ
sudo rm -rf /var/www/webcomcamp24
```

### 5. ทำความสะอาดระบบ

```bash
# ลบทุกอย่างที่ไม่ได้ใช้
docker system prune -a --volumes -f
```

---

## การ Deploy เวอร์ชันใหม่

### 1. Clone Repository

```bash
# เลือก directory ที่ต้องการติดตั้ง
cd /opt  # หรือ ~ หรือ /var/www

# Clone repository
git clone <YOUR_REPOSITORY_URL> webcomcamp24
cd webcomcamp24
```

### 2. ตั้งค่า Environment Variables

```bash
# สร้างไฟล์ .env สำหรับ server
cat > server/.env << 'EOF'
MONGO_URI=mongodb://mongodb:27017/webcomampdb
PORT=5000
EOF
```

### 3. Build Docker Images

```bash
# Build production images
docker-compose -f infra/docker-compose.prod.yml build --no-cache

# ตรวจสอบ images ที่ build แล้ว
docker images | grep infra
```

### 4. Start Services

```bash
# Start containers ใน detached mode
docker-compose -f infra/docker-compose.prod.yml up -d

# ตรวจสอบสถานะ
docker-compose -f infra/docker-compose.prod.yml ps
```

### 5. ตรวจสอบ Logs

```bash
# ดู logs ทั้งหมด
docker-compose -f infra/docker-compose.prod.yml logs -f

# ดู logs เฉพาะ service
docker-compose -f infra/docker-compose.prod.yml logs -f server
docker-compose -f infra/docker-compose.prod.yml logs -f frontend
docker-compose -f infra/docker-compose.prod.yml logs -f mongodb
```

---

## การสร้างบัญชี Admin

### วิธีที่ 1: ใช้ Seed Script

```bash
# เข้าไปใน server container
docker exec -it webcomcamp24-server-prod sh

# รัน seed script
node scripts/seedAdmin.js <username> <password>

# ตัวอย่าง
node scripts/seedAdmin.js admincomcamp comcamp@csmju

# ออกจาก container
exit
```

### วิธีที่ 2: รันจากภายนอก Container

```bash
# รันคำสั่งโดยตรง
docker exec -it webcomcamp24-server-prod node scripts/seedAdmin.js admincomcamp comcamp@csmju
```

---

## การตรวจสอบและ Monitoring

### 1. ตรวจสอบสถานะ Containers

```bash
# ดูสถานะทั้งหมด
docker ps

# ดูเฉพาะ webcomcamp24
docker ps --filter name=webcomcamp24
```

### 2. ตรวจสอบ Resource Usage

```bash
# ดู CPU, Memory usage
docker stats

# ดูเฉพาะ webcomcamp24
docker stats $(docker ps --filter name=webcomcamp24 -q)
```

### 3. ตรวจสอบ Disk Usage

```bash
# ดู disk usage ของ Docker
docker system df

# ดูรายละเอียด
docker system df -v
```

### 4. ตรวจสอบ Logs

```bash
# Real-time logs
docker-compose -f infra/docker-compose.prod.yml logs -f

# Logs 100 บรรทัดล่าสุด
docker-compose -f infra/docker-compose.prod.yml logs --tail=100

# Logs ของ service เฉพาะ
docker logs webcomcamp24-server-prod --tail=50 -f
```

### 5. ทดสอบการเข้าถึง

```bash
# ทดสอบ backend
curl http://localhost:5000

# ทดสอบ frontend
curl http://localhost

# ทดสอบ MongoDB
docker exec -it webcomcamp24-mongodb-prod mongosh --eval "db.adminCommand('ping')"
```

---

## การแก้ไขปัญหา

### ปัญหา: Container ไม่ขึ้น

```bash
# ตรวจสอบ logs
docker-compose -f infra/docker-compose.prod.yml logs

# Restart containers
docker-compose -f infra/docker-compose.prod.yml restart

# หรือ rebuild
docker-compose -f infra/docker-compose.prod.yml up -d --force-recreate
```

### ปัญหา: MongoDB Connection Error

```bash
# ตรวจสอบว่า MongoDB container ทำงานอยู่
docker ps | grep mongodb

# ตรวจสอบ logs ของ MongoDB
docker logs webcomcamp24-mongodb-prod

# Restart MongoDB
docker restart webcomcamp24-mongodb-prod

# ตรวจสอบ network
docker network inspect infra_webcomcamp24-network
```

### ปัญหา: Port ถูกใช้งานแล้ว

```bash
# ตรวจสอบว่า port ไหนถูกใช้
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :5000
sudo netstat -tulpn | grep :27017

# หยุด service ที่ใช้ port นั้น
sudo systemctl stop nginx  # ถ้ามี nginx ติดตั้งอยู่
sudo systemctl stop apache2  # ถ้ามี apache ติดตั้งอยู่
```

### ปัญหา: Disk เต็ม

```bash
# ลบ unused images, containers, volumes
docker system prune -a --volumes

# ลบ logs เก่า
sudo sh -c "truncate -s 0 /var/lib/docker/containers/*/*-json.log"
```

### ปัญหา: Permission Denied

```bash
# เพิ่ม user เข้า docker group
sudo usermod -aG docker $USER

# Logout และ login ใหม่
exit
# หรือ
newgrp docker
```

---

## คำสั่งที่ใช้บ่อย

### การจัดการ Containers

```bash
# Start
docker-compose -f infra/docker-compose.prod.yml up -d

# Stop
docker-compose -f infra/docker-compose.prod.yml down

# Restart
docker-compose -f infra/docker-compose.prod.yml restart

# Rebuild และ restart
docker-compose -f infra/docker-compose.prod.yml up -d --build --force-recreate
```

### การดู Logs

```bash
# ทั้งหมด
docker-compose -f infra/docker-compose.prod.yml logs -f

# เฉพาะ service
docker logs webcomcamp24-server-prod -f
docker logs webcomcamp24-frontend-prod -f
docker logs webcomcamp24-mongodb-prod -f
```

### การเข้า Container

```bash
# Server
docker exec -it webcomcamp24-server-prod sh

# MongoDB
docker exec -it webcomcamp24-mongodb-prod mongosh

# Frontend (nginx)
docker exec -it webcomcamp24-frontend-prod sh
```

### การ Backup Database

```bash
# Backup
docker exec webcomcamp24-mongodb-prod mongodump --db webcomampdb --out /tmp/backup

# Copy backup ออกมา
docker cp webcomcamp24-mongodb-prod:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)

# Restore
docker exec -i webcomcamp24-mongodb-prod mongorestore --db webcomampdb /tmp/backup/webcomampdb
```

---

## การตั้งค่า Auto-restart

Containers ถูกตั้งค่าให้ `restart: always` อยู่แล้ว จะ restart อัตโนมัติเมื่อ:

- Container crash
- Server reboot

ตรวจสอบได้จาก:

```bash
docker inspect webcomcamp24-server-prod | grep -A 5 RestartPolicy
```

---

## การอัปเดตโค้ด

```bash
# เข้าไปที่ directory
cd /opt/webcomcamp24

# Pull โค้ดใหม่
git pull origin main

# Rebuild และ restart
docker-compose -f infra/docker-compose.prod.yml up -d --build
```

---

## 📞 ติดต่อและสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:

- ตรวจสอบ logs ก่อนเสมอ
- บันทึก error messages
- ตรวจสอบ resource usage (CPU, Memory, Disk)

**สำคัญ:** อย่าลืม backup ข้อมูลก่อนทำการอัปเดตหรือลบ volumes!
