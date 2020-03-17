import { Resolver, Query } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { User as UserEntity, Account as AccountEntity } from '@models'

@Resolver('Account')
export class AccountResolver {
	@Query()
	async accounts(): Promise<AccountEntity[]> {
		const accounts = await getMongoRepository(AccountEntity).find({
			where: { username: { $ne: 'superadmin' } }
		})
		return accounts
	}
}
