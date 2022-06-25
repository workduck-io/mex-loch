import { App, ExpressReceiver, LogLevel } from '@slack/bolt'
import makeHandler from 'lambda-request-handler'
import { database } from '../src/db/slackAuth'
import { messageService } from '../src/service/message.service'

// Create an ExpressReceiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: 'workduck',
  processBeforeResponse: true,
  scopes: [
    'app_mentions:read',
    'channels:history',
    'channels:read',
    'chat:write',
    'chat:write.customize',
    'commands',
    'conversations.connect:write',
    'groups:history',
    'groups:read',
    'im:history',
    'im:write',
    'mpim:history',
    'mpim:write',
    'reactions:read'
  ],
  redirectUri: `${process.env.REDIRECT_HOST}/slack/oauth_redirect`,

  installerOptions: {
    redirectUriPath: '/slack/oauth_redirect', // and here!
    userScopes: ['chat:write', 'reactions:read'],
    // This flag is available in @slack/bolt v3.7 or higher
    directInstall: true
  },
  installationStore: {
    storeInstallation: async (installation) => {
      // change the line below so it saves to your database
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // support for org wide app installation
        return await database.set(installation.enterprise.id, installation)
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await database.set(installation.team.id, installation)
      }
      throw new Error('Failed saving installation data to installationStore')
    },
    fetchInstallation: async (installQuery) => {
      // change the line below so it fetches from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation lookup
        return await database.get(installQuery.enterpriseId)
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup

        const res = await database.get(installQuery.teamId)
        return res
      }
      throw new Error('Failed fetching installation')
    },
    deleteInstallation: async (installQuery) => {
      // change the line below so it deletes from your database
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation deletion
        return await database.delete(installQuery.enterpriseId)
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await database.delete(installQuery.teamId)
      }
      throw new Error('Failed to delete installation')
    }
  }
})

// Create the Bolt App, using the receiver
const app = new App({
  receiver,
  logLevel: LogLevel.ERROR // set loglevel at the App level
})

app.message(async ({ event, message, say }) => {
  //@ts-ignore
  if (event.bot_id) {
    return
  }
  if (message.channel_type !== 'im') return
  const replyMessage = await messageService.handleMessage(
    //@ts-ignore
    !message.text ? message.attachments[0]?.text : message.text,
    message.channel,
    'SLACK'
  )
  if (replyMessage) {
    try {
      await say(replyMessage)
    } catch (e) {
      console.error(e?.data)
    }
  }
  return
})

app.command('/start', async ({ payload, say, ack, respond }) => {
  await ack()
  if (payload.channel_name !== 'directmessage') await respond('This command can only be used in a direct message')
  else await respond(`Bot started. Please open: https://mexit.workduck.io/OAuth/Slack?serviceId=${payload.channel_id}`)
})

export const handler = makeHandler(receiver.app)
