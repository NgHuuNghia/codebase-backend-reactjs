import { verify } from 'jsonwebtoken'
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { User as UserEntity, Account as AccountEntity } from '@models'
import { ACCESS_TOKEN_SECRET } from '@environments'
import { AuthenticationError } from 'apollo-server-express'

@Resolver('Account')
export class AccountResolver {
	@Query()
	async accounts(): Promise<AccountEntity[]> {
		const accounts = await getMongoRepository(AccountEntity).find({
			where: { username: { $ne: 'superadmin' } }
		})
		return accounts
	}
	@Query()
	async getRole(@Args('token') token: string): Promise<string> {
		let roleCode
		await verify(token, ACCESS_TOKEN_SECRET!, async (err, data) => {
			if (err) {
				throw new AuthenticationError(
					'Authentication token is invalid, please try again.'
				)
			}
			roleCode = data.role
		})
		return roleCode
	}
}
