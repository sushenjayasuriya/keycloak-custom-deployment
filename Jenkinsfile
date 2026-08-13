pipeline {
    agent any
    environment {
        NAMESPACE = "keycloak"
        KC_IMAGE = "keycloak-custom:${BUILD_NUMBER}"
        SMS_IMAGE = "sms-proxy:${BUILD_NUMBER}"
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build Docker Images') {
            steps {
                sh """
                    # Build the main Keycloak image
                    docker build -t ${KC_IMAGE} -f Dockerfile .
                    
                    # Build the SMS Proxy image
                    cd dialog-sms-proxy
                    docker build -t ${SMS_IMAGE} .
                    cd ..
                """
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    # Export and import into containerd
                    docker save ${KC_IMAGE} -o /tmp/kc-image.tar
                    sudo ctr -n k8s.io images import /tmp/kc-image.tar
                    
                    docker save ${SMS_IMAGE} -o /tmp/sms-image.tar
                    sudo ctr -n k8s.io images import /tmp/sms-image.tar
                    
                    # Update Kubernetes deployments
                    kubectl set image deployment/keycloak keycloak=${KC_IMAGE} -n ${NAMESPACE}
                    kubectl set image deployment/sms-proxy sms-proxy=${SMS_IMAGE} -n ${NAMESPACE}
                    
                    kubectl rollout restart deployment/keycloak -n ${NAMESPACE}
                    kubectl rollout restart deployment/sms-proxy -n ${NAMESPACE}
                    
                    kubectl rollout status deployment/keycloak -n ${NAMESPACE} --timeout=3m
                    kubectl rollout status deployment/sms-proxy -n ${NAMESPACE} --timeout=3m
                """
            }
        }
    }
        post {
        always {
            sh "sudo rm -f /tmp/kc-image.tar /tmp/sms-image.tar || true"
        }
    }
}
