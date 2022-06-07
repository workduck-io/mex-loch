import { APIGatewayProxyEventV2 } from 'aws-lambda'
import LambdaClient from 'aws-sdk/clients/lambda'

const mexNodeLambda = new LambdaClient({
  region: process.env.SLS_STAGE === 'local' ? 'localhost' : 'us-east-1',
  endpoint: process.env.SLS_STAGE === 'local' ? 'http://localhost:3002' : null
})

interface ProxyLambdaIvokeRequest extends LambdaClient.InvocationRequest {
  Payload: APIGatewayProxyEventV2
}

export default {
  invokeMexNode: (params: ProxyLambdaIvokeRequest) => {
    return mexNodeLambda.invoke({ ...params, Payload: JSON.stringify(params.Payload) }).promise()
  }
}
