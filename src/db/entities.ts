import { Entity } from 'dynamodb-toolbox'
import { nanoid } from 'nanoid'
import { LastMessage } from './interface'
import { lochTable } from './service'

export const messageEntity = new Entity<LastMessage>({
  name: 'message',
  timestamps: false,
  attributes: {
    serviceId: { partitionKey: true },
    serviceType: { map: 'ak', type: 'string', required: 'always' },
    mexId: { type: 'string' },
    nodeId: { type: 'string', default: () => `NODE_${nanoid()}` },
    parentNodeId: { type: 'string' },
    sessionStartTime: { type: 'number', default: () => Date.now() }
  },
  table: lochTable
})
