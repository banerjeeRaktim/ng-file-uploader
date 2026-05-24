pipeline {
    agent any
    
    environment {
        S3_BUCKET = 'file-uploader-ng-staging-283443834592-ap-south-1-an'
        CF_DIST_ID = 'E186PVC7GMIZ4P'
        AWS_REGION = 'ap-south-1'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                url: 'https://github.com/banerjeeRaktim/ng-file-uploader.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Build') {
            steps {
                // Build production artifacts
                sh 'npm run build'
            }
        }

        stage('Deploy to S3') {
            steps {
                withAWS(region: "${AWS_REGION}", credentials: 'aws-access-key-iam') {
                    s3Delete(bucket: "${S3_BUCKET}", path: "/")
                    s3Upload(
                      bucket: "${S3_BUCKET}",
                      workingDir: 'dist/file-uploader/browser',
                      includePathPattern: '**/*',
                      path: ''
                    )
                    s3Upload(
                      bucket: "${S3_BUCKET}",
                      workingDir: 'dist/file-uploader',
                      includePathPattern: '*',
                      path: ''
                    )
                  }
            }
        }
        
        stage('Invalidate CloudFront Cache') {
            steps {
                withAWS(credentialsId: 'aws-access-key-iam') {
                    // Force CloudFront to fetch the latest files from S3
                    cfInvalidate(
                      distribution: "${CF_DIST_ID}",
                      paths: ['/*']
                    )
                }
            }
        }
    }
}
