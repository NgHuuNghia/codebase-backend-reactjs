import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import {
	ApolloError,
	AuthenticationError,
	ForbiddenError
} from 'apollo-server-core'

import { Dish as DishEntity } from '@models'

import { Dish } from '../generator/graphql.schema'

@Resolver('Dish')
export class DishResolver {
	@Query('dishes')
	async dishes(): Promise<Dish[]> {
		try {
			return await getMongoRepository(DishEntity).find({})
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Query('dish')
	async dish(@Args('id') id: string): Promise<Dish> {
		try {
			return await getMongoRepository(DishEntity).findOne({ _id: id })
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Query('dishesByShop')
	async dishesByShop(@Args('idShop') idShop: string): Promise<Dish[]> {
		try {
			const dishes = await getMongoRepository(DishEntity).find({
				where: { idShop, isActive: true },
				order: { createdAt: 'DESC' }
			})
			return dishes
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation('createDish')
	async createDish(
		@Args('name') name: string,
		@Args('idShop') idShop: string
	): Promise<Dish> {
		const existedDish = await getMongoRepository(DishEntity).findOne({
			name,
			idShop,
			isActive: true
		})

		if (existedDish) {
			throw new ApolloError('Conflict: Dishname', '409', {})
		}

		const createdDish = await getMongoRepository(DishEntity).save(
			new DishEntity({ name, idShop })
		)

		return createdDish
	}

	@Mutation('deleteDishes')
	async deleteDishes(@Args('ids') ids: string[]): Promise<boolean> {
		try {
			return !!(await getMongoRepository(DishEntity).updateMany(
				{ _id: { $in: ids } },
				{ $set: { isActive: false, updatedAt: +new Date() } }
			))
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation('updateDish')
	async updateDish(
		@Args('id') id: string,
		@Args('name') name: string
	): Promise<Dish> {
		const currentDish = await getMongoRepository(DishEntity).findOne({
			_id: id
		})

		if (!currentDish) {
			throw new ForbiddenError('Dish not found.')
		}

		const updatedDish = await getMongoRepository(DishEntity).save(
			new DishEntity({ ...currentDish, name })
		)
		return updatedDish
	}
}
