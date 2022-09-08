import { DefaultAccessCreds } from '@workduck-io/mex-default-user-token'

const REFRESH_TOKEN = process.env.MEX_SERVICE_REFRESH_TOKEN
const CLIENT_ID = process.env.MEX_SERVICE_CLIENT_ID

const initialPublicCreds = () => {
  //expiry set to zero to force refreshToken fort he first time
  return { refreshToken: REFRESH_TOKEN, expiry: 0 }
}
let accessCreds = initialPublicCreds()

const defaultCreds = new DefaultAccessCreds(
  REFRESH_TOKEN,
  CLIENT_ID,
  () => accessCreds,
  (creds) => {
    accessCreds = creds
  }
)

export const getCreds = async () => {
  return await defaultCreds.getCred()
}
