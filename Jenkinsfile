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
                withCredentials([[ $class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-access-key-iam' ]]) {
                    // Sync dist folder to S3 and delete old files not in current build
                    sh "aws s3 sync dist/file-uploader/ s3://${S3_BUCKET}/ --delete"
                }
            }
        }
        
        // stage('Invalidate CloudFront Cache') {
        //     steps {
        //         withCredentials([[ $class: 'AmazonWebServicesCredentialsBinding', credentialsId: 'aws-credentials' ]]) {
        //             // Force CloudFront to fetch the latest files from S3
        //             sh "aws cloudfront create-invalidation --distribution-id ${CF_DIST_ID} --paths '/*'"
        //         }
        //     }
        // }
    }
}
