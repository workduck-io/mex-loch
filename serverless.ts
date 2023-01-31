import { Serverless } from 'serverless/aws'
import Table from './infra/table'

const serverlessConfig: Partial<Serverless> = {
  service: 'mex-loch',
  useDotenv: true,
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
    getTime: '${file(getTime.js)}',
    gitCommitTracker: {
      location: './gitReleases/mexLoch-${self:custom.getTime}.txt', // generates txt file for upload in s3
      deployment: ['prod', 'staging', 'test'], // Currently, we support all 3 stages
      html: true
    },
    enabled: {
      prod: true,
      staging: true,
      test: true,
      other: false
    },
    stage: '${opt:stage, self:provider.stage}',
    esbuild: {
      packager: 'yarn'
    },
    autoswagger: {
      typefiles: ['./src/db/interface.ts'],
      useStage: false,
      deploySwagger: false,
      swaggerPath: 'swagger',
      apiKeyHeaders: ['Authorization', 'mex-workspace-id', 'wd-request-id']
    },
    dynamodb: {
      stages: ['staging', 'test', 'prod', 'local'],
      dbPath: '/dbMocks',
      start: {
        port: 8000,
        migrate: true,
        noStart: true
      }
    },
    domainMaps: {
      prod: 'http.workduck.io',
      staging: 'http-staging.workduck.io',
      test: 'http-test.workduck.io'
    },
    customDomain: {
      http: {
        domainName: '${self:custom.domainMaps.${opt:stage, self:provider.stage}}',
        basePath: 'loch',
        createRoute53Record: true,
        endpointType: 'regional',
        enabled: '${self:custom.enabled.${opt:stage, self:provider.stage}, self:custom.enabled.other}',
        apiType: 'http'
      }
    },
    cognitoPoolMaps: {
      dev: 'us-east-1_Zu7FAh7hj',
      staging: 'us-east-1_Zu7FAh7hj',
      test: 'us-east-1_O5YTlVrCd',
      local: 'us-east-1_Zu7FAh7hj'
    },
    cognitoClientIDMaps: {
      dev: '6pvqt64p0l2kqkk2qafgdh13qe',
      staging: '6pvqt64p0l2kqkk2qafgdh13qe',
      test: '25qd6eq6vv3906osgv8v3f8c6v',
      local: '6pvqt64p0l2kqkk2qafgdh13qe'
    },

    slackBot: {
      token: '${env:SLACK_RELEASE_TRACKER_BOT_TOKEN}',
      ghToken: '${env:GH_BOT_TOKEN}',
      channel: 'C042RL00W48', // All message will be sent to this channel (# service-releases)
      endpoints: true, // All endpoint deployments and removals will result in a message
      functions: {
        deployed: true, // Function deployments will result in a message
        removed: true // Function removals will result in a message
      }
    },
    assets: {
      auto: true,
      targets: [
        {
          bucket: 'swagger-files-docs',
          prefix: 'public/mexLoch/${opt:stage, self:provider.stage}/',
          files: [
            {
              source: './swagger',
              globs: 'swagger.js'
            }
          ]
        },
        {
          bucket: 'git-releases-files',
          prefix: 'public/mexLoch/${opt:stage, self:provider.stage}/',
          files: [
            {
              source: './gitReleases',
              globs: 'mexLoch-${self:custom.getTime}.txt'
            }
          ]
        }
      ]
    },

    prune: {
      automatic: true,
      number: 3
    }
  },
  plugins: [
    '@workduck-io/serverless-auto-swagger',
    '@workduck-io/serverless-slack-plugin',
    'serverless-git-commit-tracker',
    'serverless-esbuild',
    'serverless-dynamodb-local',
    'serverless-offline',
    'serverless-dotenv-plugin',
    'serverless-domain-manager',
    'serverless-prune-plugin',
    'serverless-s3-deploy'
  ],
  provider: {
    name: 'aws',
    runtime: 'nodejs12.x',
    memorySize: 256,
    logRetentionInDays: 7,
    stage: 'staging',
    region: 'us-east-1',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      SLS_STAGE: '${self:custom.stage}',
      SLACK_RELEASE_TRACKER_BOT_TOKEN: '${env:SLACK_RELEASE_TRACKER_BOT_TOKEN}',
      GH_BOT_TOKEN: '${env:GH_BOT_TOKEN}',
      MEXIT_SERVICE_CLIENT_ID: '${self:custom.cognitoClientIDMaps.${opt:stage, self:provider.stage}}'
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
      cors: {
        allowedOrigins: ['*'],
        allowedHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
          'X-Amzn-Trace-Id',
          'mex-workspace-id',
          'wd-request-id'
        ]
      },
      //@ts-ignore
      disableDefaultEndpoint: true,
      authorizers: {
        workduckAuthorizer: {
          identitySource: '$request.header.Authorization',
          issuerUrl:
            'https://cognito-idp.' +
            '${aws:region}' +
            '.amazonaws.com/' +
            '${self:custom.cognitoPoolMaps.${opt:stage, self:provider.stage}}',
          audience: ['${self:custom.cognitoClientIDMaps.${opt:stage, self:provider.stage}}']
        }
      }
    }
  },
  functions: {
    // whatsapp: {
    //   handler: 'handlers/whatsapp.handler',
    //   events: [
    //     {
    //       httpApi: {
    //         path: '/whatsapp',
    //         method: 'ANY'
    //       }
    //     }
    //   ]
    // },
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
