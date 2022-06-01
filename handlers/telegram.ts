import makeHandler from 'lambda-request-handler'
import { Telegraf } from 'telegraf'
import { messageService } from '../src/service/message.service'

const token = process.env.BOT_TOKEN
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!')
}

const bot = new Telegraf(token, {
  telegram: { webhookReply: false }
})

bot.start(async (ctx) => ctx.reply(`${ctx.chat.id} Bot started. Please open: mex://localhost:3333/settings`))

bot.on('message', async (ctx) => {
  //@ts-ignore
  const replyMessage = await messageService.handleMessage(ctx.message.text, ctx.chat.id, 'TELEGRAM')
  if (replyMessage) {
    await ctx.reply(replyMessage)
  }
})

export const handler = makeHandler(bot.webhookCallback('/telegram'))
