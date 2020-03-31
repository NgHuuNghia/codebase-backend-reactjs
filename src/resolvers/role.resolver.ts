import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import * as uuid from 'uuid'
import {
	CreateRoleInput,
	UpdateRoleInput,
	Role
} from '../generator/graphql.schema'
import { getMongoRepository } from 'typeorm'
import { Role as RoleEntity } from '@models'
import { ForbiddenError, ApolloError } from 'apollo-server-express'

@Resolver('Role')
export class RoleResolver {
	@Query()
	async roles(): Promise<Role[]> {
		try {
			return await getMongoRepository(RoleEntity).find({ isActive: true })
		} catch (err) {
			throw new ApolloError(err)
		}
	}

	@Mutation('createRole')
	async createRole(@Args('input') input: CreateRoleInput): Promise<Role> {
		try {
			const { code, description, permissions } = input

			const roleExists = await getMongoRepository(RoleEntity).findOne({ code })
			if (roleExists) {
				throw new ForbiddenError('Code already exists.')
			}

			const roleCreated = await getMongoRepository(RoleEntity).save(
				new RoleEntity({
					code,
					description,
					permissions
				})
			)
			return roleCreated
		} catch (err) {
			throw new ApolloError(err)
		}
	}

	@Mutation()
	async deleteRole(@Args('_id') _id: string): Promise<boolean> {
		try {
			const foundRole = await getMongoRepository(RoleEntity).findOne({
				_id,
				isActive: true
			})

			if (!foundRole) {
				throw new ForbiddenError('Role not found.')
			}

			const updateRole = await getMongoRepository(RoleEntity).save({
				...foundRole,
				isActive: false
			})

			return !!updateRole
		} catch (err) {
			throw new ApolloError(err)
		}
	}

	@Mutation()
	async updateRole(
		@Args('_id') _id: string,
		@Args('input') input: UpdateRoleInput
	): Promise<Role> {
		try {
			const { code, description, permissions } = input
			const foundRole = await getMongoRepository(RoleEntity).findOne({ _id })

			if (!foundRole) {
				throw new ForbiddenError('Role not found.')
			}
			const roleUpdated = new RoleEntity({
				...foundRole,
				code,
				description,
				permissions
			})

			await getMongoRepository(RoleEntity).save(roleUpdated)

			return roleUpdated
		} catch (err) {
			throw new ApolloError(err)
		}
	}
}
