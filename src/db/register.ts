import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { messageEntity } from './entities'
import { LastMessage } from './interface'

// Get user
export const getUser = async (payload: Partial<LastMessage>) => {
  const params = {
    pk: payload.serviceId,
    sk: payload.serviceType
  }
  return ((await messageEntity.get(params as any)) as DocumentClient.GetItemOutput)?.Item
}

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

export const updateUser = async (payload: Partial<LastMessage>) => {
  return (
    (await messageEntity.put(
      { ...payload, sessionStartTime: 0 }, //reset session on config change
      {
        conditions: [
          {
            attr: 'serviceId',
            exists: true
          }
        ]
      }
    )) as DocumentClient.UpdateItemOutput
  ).Attributes
}

export const getConnectedServices = async (workspaceId: string) => {
  return (
    (await messageEntity.query(workspaceId, {
      index: 'ak-index'
    })) as DocumentClient.QueryOutput
  ).Items
}
