import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { ApolloError } from 'apollo-server-core'
import { CreateShopInput } from '../generator/graphql.schema'
import { getMongoRepository } from 'typeorm'
import { Shop as ShopEntity } from '@models'

@Resolver('Shop')
export class ShopResolver {
	@Query()
	async shops(): Promise<ShopEntity[]> {
		const shops = await getMongoRepository(ShopEntity).find({ isActive: true })
		return shops
	}

	@Query()
	async shop(@Args('_id') _id: string): Promise<ShopEntity> {
		try {
			const existShop = await getMongoRepository(ShopEntity).findOne({ _id })

			if (!existShop) {
				throw new Error('Shop not found!')
			}

			return existShop
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async createShop(
		@Args('shopName') shopInfo: CreateShopInput
	): Promise<ShopEntity> {
		const { name } = shopInfo
		try {
			return await getMongoRepository(ShopEntity).save(
				new ShopEntity({
					name
				})
			)
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async updateShop(
		@Args('_id') _id: string,
		@Args('name') name: string
	): Promise<ShopEntity> {
		try {
			const existShop = await getMongoRepository(ShopEntity).findOne({ _id })

			if (!existShop) {
				throw new Error('Shop not found!')
			}

			return await getMongoRepository(ShopEntity).save(
				new ShopEntity({
					...existShop,
					name
				})
			)
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async deleteShop(@Args('_id') _id: string): Promise<ShopEntity> {
		try {
			const existShop = await getMongoRepository(ShopEntity).findOne({ _id })

			if (!existShop) {
				throw new Error('Shop not found!')
			}

			return await getMongoRepository(ShopEntity).save(
				new ShopEntity({
					...existShop,
					isActive: false
				})
			)
		} catch (error) {
			throw new ApolloError(error)
		}
	}
}
