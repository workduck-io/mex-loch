import { App, AwsLambdaReceiver } from '@slack/bolt'
import { messageService } from '../src/service/message.service'
// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
})

// Initializes your app with your bot token and the AWS Lambda ready receiver
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver

  // processBeforeResponse: true
})

app.message(async ({ event, message, say }) => {
  if (message.channel_type !== 'im') return
  const replyMessage = await messageService.handleMessage(
    //@ts-ignore
    !message.text ? message.attachments[0]?.text : message.text,
    message.channel,
    'SLACK'
  )
  if (replyMessage) {
    await say(replyMessage)
  }
})

app.command('/start', async ({ payload, command, ack, respond }) => {
  ack()

  if (command.channel_type !== 'im') respond('This command can only be used in a direct message')

  respond(`Bot started. Please open: https://mexit.workduck.io/integration/?serviceId=${payload.channel_id}`)
})

export const handler = async (event, context, callback) => {
  const handler = await awsLambdaReceiver.start()
  return handler(event, context, callback)
}
