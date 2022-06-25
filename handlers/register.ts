import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { getConnectedServices, registerUser, updateUser } from '../src/db/register'
import { getWorkspaceId } from '../src/libs/utils'
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const workspaceId = getWorkspaceId(event)
  const body = JSON.parse(event.body!)
  try {
    await registerUser({ ...body, mexId: workspaceId })
    return {
      statusCode: 204
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 400,
      body: workspaceId ? 'This user is already registered' : 'Please provide a valid workspace id'
    }
  }
}

export async function update(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const workspaceId = getWorkspaceId(event)
  const body = JSON.parse(event.body!)
  try {
    await updateUser({ ...body, mexId: workspaceId })
    return {
      statusCode: 204
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 400,
      body: workspaceId ? 'This user is already registered' : 'Please provide a valid workspace id'
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

export async function allConfig(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  try {
    const allServicesConfig = {
      TELEGRAM: {
        actionGroupId: 'TELEGRAM',
        name: 'Telegram',
        description: `
Integrate Mex with your Telegram and say hello to your new friend Mex Telegram Bot! It's an excellent secret keeper. Will store all your captured insights, random ideas, to-dos....from telegram in here :shushing_face:
You can select which note you would like your telegram messages to be stored in below!`,
        authConfig: {
          authURL: 'https://t.me/Mex_Offical_Bot'
        },
        connected: false,
        icon: 'logos:telegram'
      },
      SLACK: {
        actionGroupId: 'SLACK',
        name: 'Slack',
        connected: false,
        authConfig: {
          authURL: 'https://http-test.workduck.io/loch/slack/install'
        },
        icon: 'logos:slack-icon'
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify(allServicesConfig)
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: 'Cannot find config'
    }
  }
}
