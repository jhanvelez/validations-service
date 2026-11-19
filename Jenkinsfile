pipeline {
  agent none

  options {
    timestamps()
    timeout(time: 20, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
  }

  environment {
    IMAGE_NAME = 'validations-service'
    HUSKY = '0'
    CI = 'true'
    COMPOSE_FILES = '-f docker-compose.yml -f docker-compose.ci.yml'
  }

  stages {
    stage('CI') {
      agent {
        docker {
          image 'node:24-bookworm'
        }
      }
      environment {
        npm_config_cache = "${env.WORKSPACE}/.npm"
      }
      stages {
        stage('Install') {
          steps {
            sh 'npm ci'
          }
        }
        stage('Lint') {
          steps {
            sh 'npm run lint'
          }
        }
        stage('Unit Tests') {
          steps {
            sh 'npm test -- --reporter=default --reporter=junit --outputFile.junit=reports/unit.xml'
          }
        }
        stage('E2E Tests') {
          steps {
            sh 'npm run test:e2e -- --reporter=default --reporter=junit --outputFile.junit=reports/e2e.xml'
          }
        }
        stage('Build') {
          steps {
            sh 'npm run build'
          }
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/*.xml'
        }
      }
    }

    stage('Docker Image') {
      agent any
      when {
        anyOf {
          branch 'main'
          branch 'develop'
        }
      }
      steps {
        script {
          def tag = env.GIT_COMMIT.substring(0, 7)
          sh "docker build --target runtime -t ${IMAGE_NAME}:${tag} -t ${IMAGE_NAME}:${env.BRANCH_NAME} ."
        }
      }
    }

    stage('Smoke Test') {
      agent any
      when {
        anyOf {
          branch 'main'
          branch 'develop'
        }
      }
      environment {
        COMPOSE_PROJECT_NAME = "validations-ci-${env.BUILD_NUMBER}"
      }
      steps {
        sh 'cp .env.example .env'
        sh "docker compose ${COMPOSE_FILES} up -d --build --wait --wait-timeout 180 app"
        sh "docker compose ${COMPOSE_FILES} exec -T app wget -qO- http://127.0.0.1:3000/health/ready"
      }
      post {
        always {
          sh "docker compose ${COMPOSE_FILES} logs app || true"
          sh "docker compose ${COMPOSE_FILES} down -v --remove-orphans || true"
        }
      }
    }
  }
}