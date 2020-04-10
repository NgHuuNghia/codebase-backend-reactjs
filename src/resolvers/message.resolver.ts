import {
	Resolver,
	Query,
	Args,
	Mutation,
	Subscription,
	Context
} from '@nestjs/graphql'
import { Message, MessageResponse, User } from '../generator/graphql.schema'
import { getMongoRepository } from 'typeorm'
import {
	Message as MessageEntity,
	Node as NodeEntity,
	User as UserEntity
} from '@models'
import { ForbiddenError, ApolloError } from 'apollo-server-express'
import { NAME } from '@environments'

const MESSAGE_CREATED_EVENT = 'messageCreated'

@Resolver('Message')
export class MessageResolver {
	@Query()
	async messages(): Promise<Message[]> {
		try {
			return await getMongoRepository(MessageEntity).find({})
		} catch (err) {
			throw new ApolloError(err)
		}
	}

	@Query()
	async messagesByNode(
		@Args('idNode') idNode: string
	): Promise<MessageResponse[]> {
		try {
			return await getMongoRepository(MessageEntity)
				.aggregate([
					{
						$match: {
							idNode,
							isActive: true
						}
					},
					{
						$lookup: {
							from: `${NAME}_users`,
							let: { id: '$idUser' },
							pipeline: [
								{
									$match: {
										$expr: {
											$eq: ['$_id', '$$id']
										}
									}
								},
								{
									$project: { fullName: 1 }
								}
							],
							as: 'user'
						}
					},
					{
						$project: {
							_id: 1,
							content: 1,
							idNode: 1,
							idUser: 1,
							createdAt: 1,
							updatedAt: 1,
							userName: { $arrayElemAt: ['$user.fullName', 0] }
						}
					}
				])
				.toArray()
		} catch (err) {
			throw new ApolloError(err)
		}
	}

	@Mutation()
	async createMessage(
		@Args('content') content: string,
		@Args('idNode') idNode: string,
		@Context('currentUser') currentUser: User,
		@Context('pubsub') pubsub
	): Promise<Message> {
		try {
			// check exist iNode && idUser
			const currentNode = await getMongoRepository(NodeEntity).findOne({
				_id: idNode
			})
			if (!currentNode) {
				throw new ForbiddenError('Node not found')
			}

			const userCurrent = await getMongoRepository(UserEntity).findOne({
				_id: currentUser._id
			})
			if (!userCurrent) {
				throw new ForbiddenError('User not found')
			}

			const newMessage = await getMongoRepository(MessageEntity).save(
				new MessageEntity({
					content,
					idNode,
					idUser: currentUser._id
				})
			)

			pubsub.publish(MESSAGE_CREATED_EVENT, {
				idNode,
				idUser: currentUser._id,
				messageCreated: newMessage
			})

			return newMessage
		} catch (err) {
			throw new ApolloError(err)
		}
	}

	@Subscription('messageCreated', {
		filter: (payload: any, variables: any) => {
			return variables.idNode === payload.idNode
		}
	})
	async messageCreated(@Context('pubsub') pubsub) {
		return pubsub.asyncIterator(MESSAGE_CREATED_EVENT)
	}
}
