# Jenkins CI/CD Setup & Automation Guide for CabGo

This document provides complete instructions for setting up, configuring, and executing automated continuous integration and continuous deployment (CI/CD) for **CabGo** using **Jenkins LTS**.

---

## 1. Architecture Overview

The CabGo CI/CD pipeline automates the entire lifecycle of the full-stack cab booking application:

```
[Git Commit / PR] ──> [GitHub Webhook] ──> [Jenkins Controller]
                                                  │
 ┌────────────────────────────────────────────────┴───────────────────────────────┐
 │ 1. Checkout SCM                                                                │
 │ 2. Environment Setup (Node 20, npm, Docker CLI)                                │
 │ 3. Code Quality (ESLint + TypeScript Typecheck)                                │
 │ 4. Next.js 16 Frontend Build (Turbopack standalone output)                    │
 │ 5. Express TypeScript Backend Build (tsc -> dist/index.js)                    │
 │ 6. Automated Testing (10 Integration suites -> JUnit XML)                      │
 │ 7. Security Checks (Secret Leak Scanning & npm audit)                          │
 │ 8. Docker Image Build (Multi-stage alpine images for Frontend & Backend)       │
 │ 9. Container Validation (Isolated bridge network & API healthcheck)            │
 │ 10. Multi-Target Deployment (Vercel Frontend & Container Registry/Cloud Host)  │
 │ 11. Post-Deployment Verification (cURL API endpoint smoke test)                │
 │ 12. Notification & JUnit Report Archival                                       │
 └────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites & Jenkins LTS Installation

### macOS (Homebrew)
```bash
# 1. Install OpenJDK 21 and Jenkins LTS
brew install openjdk@21 jenkins-lts

# 2. Start Jenkins as a background service
brew services start jenkins-lts

# Or launch directly in terminal:
/opt/homebrew/opt/openjdk@21/bin/java -jar /opt/homebrew/opt/jenkins-lts/libexec/jenkins.war --httpListenAddress=127.0.0.1 --httpPort=8080
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y openjdk-21-jre docker.io git
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
sudo systemctl enable --now jenkins
sudo usermod -aG docker jenkins
```

### Initial Administrator Setup
1. Open `http://localhost:8080` in your browser.
2. Read the initial password:
   ```bash
   cat ~/.jenkins/secrets/initialAdminPassword
   # Or on Linux:
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Choose **Install suggested plugins**.

---

## 3. Required Jenkins Plugins

Navigate to **Manage Jenkins** -> **Plugins** -> **Available Plugins** and install:

| Plugin Name | Identifier | Purpose |
| :--- | :--- | :--- |
| **NodeJS Plugin** | `nodejs` | Automatic Node.js 20 runtime provisioning |
| **Docker Pipeline** | `docker-workflow` | Docker agent and container orchestration |
| **JUnit Plugin** | `junit` | Test reporting and test trend visualization |
| **GitHub Integration** | `github-branch-source` | GitHub webhook parsing & commit status checks |
| **Credentials Binding** | `credentials-binding` | Masking sensitive tokens in pipeline environment |
| **AnsiColor** | `ansicolor` | Colored terminal output in Jenkins build logs |
| **Workspace Cleanup** | `ws-cleanup` | Cleaning build workspaces after build runs |

---

## 4. Configuring Global Tools

1. Navigate to **Manage Jenkins** -> **Tools**.
2. Scroll to **NodeJS**:
   - Click **Add NodeJS**.
   - Name: `NodeJS-20`
   - Select **Install automatically** -> Version: `NodeJS 20.x.x` (or `22.x.x`).
3. Scroll to **Docker**:
   - Name: `Docker`
   - Path to docker executable: `/usr/local/bin/docker` or `/usr/bin/docker`.

---

## 5. Jenkins Credentials Management

Navigate to **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials (unrestricted)** -> **Add Credentials**:

| Credential ID | Kind | Value / Secret |
| :--- | :--- | :--- |
| `VERCEL_TOKEN` | Secret text | Vercel Personal Access Token for frontend deployment |
| `DOCKER_REGISTRY_USER` | Secret text / Username | Docker Hub / Registry username |
| `DOCKER_REGISTRY_PASS` | Secret text / Password | Docker Hub token or password |
| `STRIPE_SECRET_KEY` | Secret text | Stripe API testing key (`sk_test_...`) |
| `CLERK_SECRET_KEY` | Secret text | Clerk Authentication API Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret text | Supabase PostgreSQL Service Role Key |

---

## 6. GitHub Webhook Configuration

To trigger automatic builds upon pushing to `https://github.com/balamurugan29-commits/cabgo`:

1. Open your GitHub Repository: `https://github.com/balamurugan29-commits/cabgo/settings/hooks`.
2. Click **Add webhook**.
3. **Payload URL**:
   ```
   http://<YOUR_PUBLIC_JENKINS_DOMAIN_OR_NGROK>:8080/github-webhook/
   ```
4. **Content type**: `application/json`.
5. **Which events would you like to trigger this webhook?**:
   - Select **Just the push event** (or **Let me select individual events** -> Pushes & Pull Requests).
6. Click **Add webhook**.

> **Tip for Local Testing**: If Jenkins is running on localhost, use an ngrok or Cloudflare tunnel:
> ```bash
> ngrok http 8080
> ```
> Use the forwarding URL `https://xxxx.ngrok-free.app/github-webhook/`.

---

## 7. Creating the CabGo Jenkins Pipeline

1. In Jenkins, click **New Item**.
2. Enter Name: `CabGo-CI-CD`.
3. Select **Pipeline** (or **Multibranch Pipeline**) and click **OK**.
4. In the configuration page under **Build Triggers**:
   - Check **GitHub hook trigger for GITScm polling**.
5. Under **Pipeline**:
   - Definition: **Pipeline script from SCM**
   - SCM: **Git**
   - Repository URL: `https://github.com/balamurugan29-commits/cabgo.git`
   - Branch Specifier: `*/main`
   - Script Path: `Jenkinsfile`
6. Click **Save**.
7. Click **Build Now** to execute the initial build.

---

## 8. Local Pipeline Emulation (Offline Testing)

To test and validate all 12 stages on your local development machine without waiting for Jenkins:

```bash
chmod +x scripts/run_pipeline_local.sh
./scripts/run_pipeline_local.sh
```

This runs:
1. SCM checkout validation
2. Environment validation
3. Frontend and Backend ESLint & TypeScript checks
4. Next.js production build (`next build`)
5. Express production build (`tsc`)
6. Automated Integration test suite with JUnit XML generation (`test-results/junit.xml`)
7. Secret & vulnerability security audits
8. Multi-stage Docker image build for `cabgo-backend` and `cabgo-frontend`
9. Docker container launch and health check verification (`http://localhost:5002/api/v1/health`)
10. Target deployment dry-run
11. Live endpoint verification
12. Status summary reporting
