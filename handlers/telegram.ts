import makeHandler from 'lambda-request-handler'
import { Telegraf } from 'telegraf'
import { messageService } from '../src/service/message.service'

const token = process.env.BOT_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token, {
  telegram: { webhookReply: true }
})

console.log('Bot Started!')

bot.start(async (ctx) => {
  {
    ctx.reply(
      `Bot started. Please open: Bot started. Please open: mex://navigate/integrations/portal/TELEGRAM?serviceId=${ctx.chat.id}`
    )
  }
})

bot.on('message', async (ctx) => {
  //@ts-ignore
  const replyMessage = await messageService.handleMessage(ctx.message.text, ctx.chat.id, 'TELEGRAM')
  if (replyMessage) {
    await ctx.reply(replyMessage)
  }
})

export const handler = makeHandler(bot.webhookCallback('/telegram'))
