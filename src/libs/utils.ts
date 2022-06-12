import { APIGatewayProxyEventV2 } from 'aws-lambda'

export function getWorkspaceId(event: APIGatewayProxyEventV2): string {
  return event.headers['mex-workspace-id']
}
