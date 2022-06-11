import { APIGatewayProxyEventV2 } from 'aws-lambda'
import * as http from 'http'

export function getWorkspaceId(event: APIGatewayProxyEventV2): string {
  return event.headers['mex-workspace-id']
}

export const httpAgent = new http.Agent({ keepAlive: true })
