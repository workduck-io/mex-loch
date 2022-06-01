import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { messageEntity } from './entities'
import { LastMessage } from './interface'

export const registerUser = async (payload: Partial<LastMessage>) => {
  try {
    return (
      (await messageEntity.put(payload, {
        conditions: [
          {
            attr: 'serviceId',
            exists: false
          }
        ]
      })) as DocumentClient.UpdateItemOutput
    ).Attributes
  } catch (err) {
    throw err
  }
}
