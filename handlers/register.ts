import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { getConnectedServices, registerUser } from '../src/db/register'
import { getWorkspaceId } from '../src/libs/utils'
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const body = JSON.parse(event.body)
  try {
    await registerUser(body)
    return {
      statusCode: 204
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 400,
      body: 'This user is already registered'
    }
  }
}

export async function connected(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const workspaceId = getWorkspaceId(event)
    const services = await getConnectedServices(workspaceId)
    return {
      statusCode: 200,
      body: JSON.stringify(services)
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 400,
      body: 'Workspace not available'
    }
  }
}
