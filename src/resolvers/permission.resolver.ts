import { Resolver, Query } from '@nestjs/graphql'
import { Permission } from '../generator/graphql.schema'
import { getMongoRepository } from 'typeorm'
import { Permission as PermissionEntity } from '@models'
import { ForbiddenError, ApolloError } from 'apollo-server-express'

@Resolver('Permission')
export class PermissionResolver {
	@Query()
	async permissions(): Promise<Permission[]> {
		try {
			return await getMongoRepository(PermissionEntity).find({})
		} catch (err) {
			throw new ApolloError(err)
		}
	}
}
