import { Serverless } from 'serverless/aws'
import Table from './infra/table'

const serverlessConfig: Partial<Serverless> = {
  service: 'mex-loch',
  frameworkVersion: '3',
  package: {
    individually: true,
    excludeDevDependencies: true
  },
  custom: {
    'serverless-offline': {
      ignoreJWTSignature: true,
      noAuth: true
    },
    enabled: {
      dev: true,
      test: true,
      other: false
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
    customDomain: {
      http: {
        domainName: 'http-${opt:stage, self:provider.stage}.workduck.io',
        basePath: 'loch',
        createRoute53Record: true,
        endpointType: 'regional',
        enabled: '${self:custom.enabled.${opt:stage, self:provider.stage}, self:custom.enabled.other}',
        apiType: 'http'
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
    'serverless-domain-manager',
    'serverless-prune-plugin'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    memorySize: 256,
    logRetentionInDays: 7,
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
    },
    httpApi: {
      cors: true,
      //@ts-ignore
      disableDefaultEndpoint: true,
      authorizers: {
        workduckAuthorizer: {
          identitySource: '$request.header.Authorization',
          issuerUrl:
            'https://cognito-idp.' + '${opt:region, self:provider.region}' + '.amazonaws.com/' + 'us-east-1_Zu7FAh7hj',
          audience: ['6pvqt64p0l2kqkk2qafgdh13qe']
        }
      }
    }
  },
  functions: {
    telegram: {
      handler: 'handlers/telegram.handler',
      events: [
        {
          httpApi: {
            path: '/telegram',
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
            path: '/slack/{proxy+}',
            method: 'ANY'
          }
        },
        {
          httpApi: {
            path: '/slack/oauth_redirect',
            method: 'ANY'
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
            method: 'POST',
            //@ts-ignore
            authorizer: 'workduckAuthorizer'
          }
        }
      ]
    },
    update: {
      handler: 'handlers/register.update',
      events: [
        {
          httpApi: {
            path: '/connect',
            method: 'PUT',
            //@ts-ignore
            authorizer: 'workduckAuthorizer'
          }
        }
      ]
    },
    connected: {
      handler: 'handlers/register.connected',
      events: [
        {
          httpApi: {
            path: '/connect',
            method: 'GET',
            //@ts-ignore
            authorizer: 'workduckAuthorizer'
          }
        }
      ]
    },
    allConfig: {
      handler: 'handlers/register.allConfig',
      events: [
        {
          httpApi: {
            path: '/connect/all',
            method: 'GET',
            //@ts-ignore
            authorizer: 'workduckAuthorizer'
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
