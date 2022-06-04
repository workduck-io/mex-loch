export default {
  MexLochTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: '${self:custom.stage}-loch-store',
      AttributeDefinitions: [
        {
          AttributeName: 'pk',
          AttributeType: 'S'
        },
        {
          AttributeName: 'ak',
          AttributeType: 'S'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'pk',
          KeyType: 'HASH'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: '15',
        WriteCapacityUnits: '15'
      },
      GlobalSecondaryIndexes: [
        {
          IndexName: 'ak-index',
          KeySchema: [
            {
              AttributeName: 'ak',
              KeyType: 'HASH'
            }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: '5',
            WriteCapacityUnits: '5'
          }
        }
      ]
    }
  }
}
