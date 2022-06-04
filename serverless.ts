import { Serverless } from 'serverless/aws'
import Table from './infra/table'

const serverlessConfig: Partial<Serverless> = {
  service: 'telegram-bot-test',
  frameworkVersion: '3',
  package: {
    individually: true,
    excludeDevDependencies: true
  },
  custom: {
    'serverless-offline': {
      noPrependStageInUrl: true
    },
    stage: '${opt:stage, self:provider.stage}',
    esbuild: {
      packager: 'yarn'
    },
    dynamodb: {
      stages: ['local', 'test'],
      dbPath: '/dbMocks',
      start: {
        port: 8000,
        migrate: true,
        noStart: true
      }
    },
    prune: {
      automatic: true,
      number: 3
    }
  },
  plugins: [
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-offline',
    'serverless-dotenv-plugin',
    'serverless-prune-plugin'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    stage: 'dev',
    region: 'us-east-1',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SLS_STAGE: '${self:custom.stage}'
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:Scan',
              'dynamodb:Query',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:DescribeTable',
              'dynamodb:BatchWriteItem',
              'dynamodb:BatchGetItem',
              'dynamodb:UpdateTimeToLive'
            ],
            Resource: 'arn:aws:dynamodb:us-east-1:*:*'
          },
          {
            Effect: 'Allow',
            Action: [
              'lambda:InvokeFunction',
              'lambda:listAliases',
              'lambda:listVersionsByFunction',
              'lambda:deleteFunction',
              'lambda:listLayerVersions',
              'lambda:deleteLayerVersion'
            ],
            Resource: ['*']
          }
        ]
      }
    }
  },
  functions: {
    telegram: {
      handler: 'handlers/telegram.handler',
      events: [
        {
          httpApi: {
            path: '/telegram/{proxy+}',
            method: 'ANY'
          }
        }
      ]
    },
    slack: {
      handler: 'handlers/slack.handler',
      events: [
        {
          httpApi: {
            path: '/slack/events',
            method: 'POST'
          }
        }
      ]
    },
    register: {
      handler: 'handlers/register.handler',
      events: [
        {
          httpApi: {
            path: '/connect',
            method: 'POST'
          }
        }
      ]
    },
    connected: {
      handler: 'handlers/register.connected',
      events: [
        {
          httpApi: {
            path: '/connect/{workspaceId}',
            method: 'GET'
          }
        }
      ]
    }
  },
  resources: {
    Resources: Table
  }
}

module.exports = serverlessConfig
