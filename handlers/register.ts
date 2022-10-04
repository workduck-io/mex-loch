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
      WHATSAPP: {
        actionGroupId: 'WHATSAPP',
        name: 'WhatsApp',
        description: `WhatsApp is a free, cross-platform messaging and Voice over IP (VoIP) service owned by Facebook, Inc. It allows users to send text messages and voice messages, make voice and video calls, and share images, documents, user locations, and other media.
        You can select which note you would like your Whatsapp messages to be stored in below!`,
        authConfig: {
          authURL: 'https://w.me/Mex-Offical-Bot'
        },
        connected: false,
        icon: 'logos:whatsapp-icon'
      },
      TELEGRAM: {
        actionGroupId: 'TELEGRAM',
        name: 'Telegram',
        description: `
Integrate Mex with your Telegram and say hello to your new friend Mex Telegram Bot! It's an excellent secret keeper. Will store all your captured insights, random ideas, to-dos....from Telegram in here.
You can select which note you would like your Telegram messages to be stored in below!`,
        authConfig: {
          authURL: 'https://t.me/Mex_Offical_Bot'
        },
        connected: false,
        icon: 'logos:telegram'
      },
      SLACK: {
        actionGroupId: 'SLACK',
        name: 'Slack',
        description: `Integrate Mex with your Slack and say hello to your new friend Mex Slack Bot! It's an excellent secret keeper. Will store all your captured insights, random ideas, to-dos....from Slack in here.
        You can select which note you would like your Slack messages to be stored in below!`,
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
