import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { messageEntity } from './entities'
import { LastMessage } from './interface'

export const registerUser = async (payload: Partial<LastMessage>) => {
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
}

export const getConnectedServices = async (workspaceId: string) => {
  return (
    (await messageEntity.query(workspaceId, {
      index: 'ak-index'
    })) as DocumentClient.QueryOutput
  ).Items
}
