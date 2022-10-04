import bodyParser from 'body-parser'
import express from 'express'
import got from 'got'
import makeHandler from 'lambda-request-handler'
import { messageService } from '../src/service/message.service'

const app = express().use(bodyParser.json())
app.get('/whatsapp', (req, res) => {
  /**
   * UPDATE YOUR VERIFY TOKEN
   *This will be the Verify Token value when you set up webhook
   **/
  const verify_token = process.env.WHATSAPP_VERIFY_TOKEN

  // Parse params from the webhook verification request
  let mode = req.query['hub.mode']
  let token = req.query['hub.verify_token']
  let challenge = req.query['hub.challenge']

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === verify_token) {
      // Respond with 200 OK and challenge token from the request
      // console.log('WEBHOOK_VERIFIED')
      res.status(200).send(challenge)
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403)
    }
  }
})
// Accepts POST requests at /webhook endpoint
app.post('/whatsapp', async (req, res) => {
  // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let message = req.body.entry[0].changes[0].value
      let from = message.messages[0].from // extract the phone number from the webhook payload
      let msg_body = message.messages[0].text.body // extract the message text from the webhook payload
      let phone_number_id = message.metadata.phone_number_id
      let request: any = {}

      const sendingUrl = `https://graph.facebook.com/v12.0/${phone_number_id}/messages?access_token=${process.env.WHATSAPP_BOT_TOKEN}`

      // Bot to be started
      if (msg_body === '/start') {
        request.json = {
          messaging_product: 'whatsapp',
          to: from,
          text: {
            body: `Bot started. Please open: https://mexit.workduck.io/OAuth/Whatsapp/?serviceId=${phone_number_id} `
          }
        }
        request.headers = {
          'Content-Type': 'application/json'
        }
        const response = await got.post(sendingUrl, request)
        res.sendStatus(200)
      } else {
        try {
          const replyMessage = await messageService.handleMessage({
            message: msg_body,
            serviceId: phone_number_id,
            sourceUrl: `https://wa.me/${process.env.WHATSAPP_BOT_NUMBER}?text=${message.messages[0].id}}`,
            serviceType: 'WHATSAPP'
          })
          if (replyMessage) {
            request.json = {
              messaging_product: 'whatsapp',
              to: from,
              text: { body: `${replyMessage}`}
            }
            request.headers = {
              'Content-Type': 'application/json'
            }
            const response = await got.post(sendingUrl, request)
            res.sendStatus(200)
          }
        } catch (error) {
          console.log('error', error)
        }
      }
    }
  } else {
    // Return a '404 Not Found' if event is not from a WhatsApp API
    res.sendStatus(404)
  }
})

// Whatsapp webhook handler function to recieve events
export const handler = makeHandler(app)
