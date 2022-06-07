import { Entity } from 'dynamodb-toolbox'
import { nanoid } from 'nanoid'
import { LastMessage } from './interface'
import { lochTable } from './service'

export const messageEntity = new Entity<LastMessage>({
  name: 'message',
  timestamps: false,
  attributes: {
    serviceId: { partitionKey: true },
    serviceType: { map: 'sk', type: 'string', required: 'always' },
    mexId: { map: 'ak', type: 'string' },
    nodeId: { type: 'string', default: () => `NODE_${nanoid()}` },
    parentNodeId: { type: 'string' },
    sessionStartTime: { type: 'number', default: () => 0 }
  },
  table: lochTable
})
