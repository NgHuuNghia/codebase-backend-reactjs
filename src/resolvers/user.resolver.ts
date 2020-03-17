import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import {
	ApolloError,
	AuthenticationError,
	ForbiddenError
} from 'apollo-server-core'
import * as uuid from 'uuid'

import { Account as AccountEntity, User as UserEntity } from '@models'
import { comparePassword, hashPassword } from '@utils'
import {
	User,
	CreateUserInput,
	UpdateUserInput,
	LoginUserInput,
	LoginResponse,
	UserResponse
} from '../generator/graphql.schema'
import { tradeToken } from '@auth'

@Resolver('User')
export class UserResolver {
	@Query()
	async hello(): Promise<string> {
		return uuid.v1()
	}

	@Query()
	async today(): Promise<Date> {
		return new Date()
	}

	@Query()
	async me(@Context('currentUser') currentUser: User) {
		return currentUser
	}

	@Query()
	async users(
		@Context('currentUser') currentUser: User
	): Promise<UserResponse[]> {
		const aggPipeline = [
			{
				$lookup: {
					from: 'accounts',
					localField: 'idAccount',
					foreignField: '_id',
					as: 'account'
				}
			},
			{
				$unwind: {
					path: '$account',
					preserveNullAndEmptyArrays: true
				}
			},
			{
				$project: {
					fullName: '$fullName',
					idAccount: '$idAccount',
					username: '$account.username',
					isActive: '$isActive',
					createdAt: '$createdAt',
					updatedAt: '$updatedAt'
				}
			}
		]
		const users = await getMongoRepository(UserEntity)
			.aggregate([
				...aggPipeline,
				{
					$match: {
						isActive: true,
						_id: { $ne: currentUser._id },
						username: { $ne: 'superadmin' }
					}
				}
			])
			.toArray()

		return users
	}

	@Query()
	async user(@Args('_id') _id: string): Promise<User> {
		try {
			const foundUser = await getMongoRepository(UserEntity).findOne({ _id })

			if (!foundUser) {
				throw new ForbiddenError('User not found.')
			}

			return foundUser
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async createUser(@Args('input') input: CreateUserInput): Promise<boolean> {
		try {
			const { username, password, fullName } = input

			if (username.toLowerCase() === 'superadmin') {
				throw new ForbiddenError('Username is invalid.')
			}

			const existedUser = await getMongoRepository(AccountEntity).findOne({
				username
			})

			if (existedUser) {
				throw new ForbiddenError('Username already exists.')
			}

			const createdAccount = await getMongoRepository(AccountEntity).save(
				new AccountEntity({
					username: username.toLowerCase(),
					password: await hashPassword(password)
				})
			)

			const createdUser = await getMongoRepository(UserEntity).save(
				new UserEntity({
					idAccount: createdAccount._id,
					fullName
				})
			)

			return !!createdUser
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async updateUser(
		@Args('_id') _id: string,
		@Args('input') input: UpdateUserInput
	): Promise<boolean> {
		try {
			const { password, fullName } = input
			const foundUser = await getMongoRepository(UserEntity).findOne({ _id })

			if (!foundUser) {
				throw new ForbiddenError('User not found.')
			}
			const existedAccount = await getMongoRepository(AccountEntity).findOne({
				_id: foundUser.idAccount
			})
			const updatedAccount = await getMongoRepository(AccountEntity).save(
				new AccountEntity({
					...existedAccount,
					password: password
						? await hashPassword(password)
						: existedAccount.password
				})
			)
			const updatedUser = await await getMongoRepository(UserEntity).save(
				new UserEntity({
					...foundUser,
					fullName
				})
			)

			return !!updatedUser
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async deleteUser(@Args('_id') _id: string): Promise<boolean> {
		try {
			const foundUser = await getMongoRepository(UserEntity).findOne({
				_id,
				isActive: true
			})

			if (!foundUser) {
				throw new ForbiddenError('User not found.')
			}

			const updatedAccount = await getMongoRepository(AccountEntity).deleteOne({
				_id: foundUser.idAccount
			})

			const updatedUser = await await getMongoRepository(UserEntity).save(
				new UserEntity({
					...foundUser,
					isActive: false
				})
			)

			return !!updatedUser
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async login(@Args('input') input: LoginUserInput): Promise<LoginResponse> {
		const { username, password } = input
		const account = await getMongoRepository(AccountEntity).findOne({
			where: {
				username
			}
		})

		if (account && (await comparePassword(password, account.password))) {
			return tradeToken(account)
		}

		throw new AuthenticationError('Login failed.')
	}
}
