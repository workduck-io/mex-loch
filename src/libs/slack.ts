import got from 'got'
import queryString from 'query-string'
import { httpAgent } from './utils'

export async function auth(event) {
  const SLACK_URL = queryString.stringifyUrl({
    url: 'https://slack.com/api/oauth.v2.access',
    query: {
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: event.queryStringParameters.code,
      redirect_uri: `${process.env.REDIRECT_HOST}/slack/install`
    }
  })
  console.log(SLACK_URL)

  try {
    const body: any = await got(SLACK_URL, {
      timeout: {
        request: 5000
      },
      agent: {
        http: httpAgent
      }
    }).json()
    console.log({ body })
    if (body.ok) {
      return {
        statusCode: 301,
        headers: {
          Location: 'https://slack.com'
        },
        body: JSON.stringify(body)
      }
    } else {
      return {
        statusCode: 403,
        body: JSON.stringify(body.error)
      }
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      body: 'Something went wrong'
    }
  }
}
