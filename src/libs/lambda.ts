import https from 'https'
// import { APIGatewayProxyEventV2 } from 'aws-lambda'
// import LambdaClient from 'aws-sdk/clients/lambda'

// const mexNodeLambda = new LambdaClient({
//   region: process.env.SLS_STAGE === 'local' ? 'localhost' : 'us-east-1',
//   endpoint: process.env.SLS_STAGE === 'local' ? 'http://localhost:3002' : null
// })

// interface ProxyLambdaIvokeRequest extends LambdaClient.InvocationRequest {
//   Payload: APIGatewayProxyEventV2
// }

export default {
  // invokeMexNode: (params: ProxyLambdaIvokeRequest) => {
  //   return mexNodeLambda.invoke({ ...params, Payload: JSON.stringify(params.Payload) }).promise()
  // },
  createNodeRequest: async (headers: { [key: string]: string }, data: any) => {
    // const url = 'ip-172-31-33-159.ec2.internal/node'
    return new Promise((resolve) => {
      let req = https.request({
        hostname: process.env.MEXIT_MIDDLEWARE_IP,
        port: 443,
        path: '/api/v1/node',
        method: 'POST'
      })
      Object.entries(headers).forEach(([key, value]) => {
        req.setHeader(key, value)
      })
      req.write(JSON.stringify(data))
      req.end(null, null, () => {
        resolve(req)
      })
    })
  },
  appendNodeRequest: async (nodeId: string, headers: { [key: string]: string }, data: any) => {
    return new Promise((resolve) => {
      let req = https.request({
        hostname: process.env.MEXIT_MIDDLEWARE_IP,
        port: 443,
        path: `/api/v1/node/${nodeId}`,
        method: 'PUT'
      })
      Object.entries(headers).forEach(([key, value]) => {
        req.setHeader(key, value)
      })
      req.write(JSON.stringify(data))
      req.end(null, null, () => {
        resolve(req)
      })
    })
  }
}
