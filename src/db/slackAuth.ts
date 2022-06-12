import { slackAuthEntity } from './entities'

export const database = {
  set: async (id: string, data: any) => {
    return await slackAuthEntity.put({
      pk: id,
      data
    })
  },
  get: async (id: string) => {
    return (await slackAuthEntity.get({ pk: id })).Item?.data
  },
  delete: async (id: string) => {
    return await slackAuthEntity.delete({ pk: id })
  }
}
