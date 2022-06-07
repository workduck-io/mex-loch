import { DynamoDB } from 'aws-sdk'
import { Table } from 'dynamodb-toolbox'

export const getEndpoint = () => {
  if (process.env.AWS_EXECUTION_ENV) {
    return undefined
  } else if (process.env.DYNAMODB_ENDPOINT) {
    return `http://${process.env.DYNAMODB_ENDPOINT}`
  } else {
    return 'http://localhost:8000'
  }
}

export const getRegion = () => {
  if (process.env.AWS_EXECUTION_ENV) {
    return undefined
  } else if (process.env.AWS_REGION) {
    return process.env.AWS_REGION
  } else if (process.env.AWS_DEFAULT_REGION) {
    return process.env.AWS_DEFAULT_REGION
  } else {
    return 'local'
  }
}

export const DocumentClient = new DynamoDB.DocumentClient({
  service: new DynamoDB({
    endpoint: getEndpoint(),
    region: getRegion()
  })
})

export const lochTable = new Table({
  // Specify table name (used by DynamoDB)
  name: `${process.env.SLS_STAGE}-loch-store`,

  // Define partition and sort keys
  partitionKey: 'pk',
  indexes: {
    'ak-index': {
      partitionKey: 'ak'
    }
  },

  // Add the DocumentClient
  DocumentClient
})
