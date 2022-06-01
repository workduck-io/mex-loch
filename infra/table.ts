export default {
  MexLochTable: {
    Type: 'AWS::DynamoDB::Table',
    Properties: {
      TableName: '${self:custom.stage}-loch-store',
      AttributeDefinitions: [
        {
          AttributeName: 'pk',
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
      }
    }
  }
}
