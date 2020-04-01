import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import {
	Menu,
	CreateMenuInput,
	ByLockMenu,
	VariablesLockMenu,
	DishInfo
} from '../generator/graphql.schema'
import { getMongoRepository } from 'typeorm'
import { ApolloError } from 'apollo-server-core'
import { Menu as MenuEntity, Dish as DishEntity } from '@models'

@Resolver('Menu')
export class MenuResolver {
	@Query()
	async menus(): Promise<Menu[]> {
		return getMongoRepository(MenuEntity).find({
			where: { isActive: true },
			order: { createdAt: 'DESC' }
		})
	}
	@Query()
	async menu(@Args('id') id: string): Promise<Menu> {
		const menu = await getMongoRepository(MenuEntity).findOne({ _id: id })
		return menu
	}
	@Query()
	async menusByNode(@Args('idNode') idNode: string): Promise<MenuEntity[]> {
		try {
			return await getMongoRepository(MenuEntity).find({
				where: { idNode, isActive: true },
				order: { createdAt: 'DESC' }
			})
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Query()
	async menuPublished(): Promise<Menu> {
		const menu = await getMongoRepository(MenuEntity).findOne({
			isPublished: true
		})
		return menu
	}

	@Query()
	async menuPublishedByNode(
		@Args('idNode') idNode: string
	): Promise<MenuEntity> {
		try {
			return await getMongoRepository(MenuEntity).findOne({
				where: { idNode, isActive: true, isPublished: true }
			})
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async closeMenu(): Promise<Menu> {
		const today = new Date()
		const timeIsLock = {
			hourToday: today.getHours(),
			minuteToday: today.getMinutes(),
			secondToday: today.getSeconds()
		}
		try {
			if (
				timeIsLock.hourToday >= 14 &&
				timeIsLock.minuteToday >= 0 &&
				timeIsLock.secondToday >= 1
			) {
				const menuIsLocked = await getMongoRepository(MenuEntity).findOne({
					where: { isLocked: true, isPublished: true }
				})
				await getMongoRepository(MenuEntity).findOneAndUpdate(
					{ isLocked: true, isPublished: true },
					{
						$set: { isActive: false, isPublish: false }
					}
				)
				const createMenuSimilar = await getMongoRepository(MenuEntity).save(
					new MenuEntity({
						name: menuIsLocked.name,
						idNode: menuIsLocked.idNode
					})
				)
				return createMenuSimilar
			}
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Mutation()
	async updateMenuIsSaved(
		@Args('input') input: DishInfo[],
		@Args('menuId') menuId: string,
		@Args('shopId') shopId: string,
		@Args('nodeId') nodeId: string
	): Promise<boolean> {
		try {
			return !!(await getMongoRepository(MenuEntity).findOneAndUpdate(
				{ _id: menuId },
				{ $set: { dishes: input, idShop: shopId, idNode: nodeId } }
			))
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async createMenu(@Args('input') input: CreateMenuInput): Promise<Menu> {
		try {
			const { name, idNode } = input
			const existedMenu = await getMongoRepository(MenuEntity).findOne({
				name,
				idNode,
				isActive: true
			})
			if (existedMenu) {
				throw new ApolloError('Conflict: Menu name', '409', {})
			}
			const createMenu = await getMongoRepository(MenuEntity).save(
				new MenuEntity({ name, idNode })
			)
			return createMenu
		} catch (error) {
			throw new ApolloError(error)
		}
	}
	@Mutation()
	async updateMenu(
		@Args('id') id: string,
		@Args('name') name: string,
		@Args('idShop') idShop: string
	): Promise<Menu> {
		try {
			const currentMenu = await getMongoRepository(MenuEntity).findOne({
				_id: id
			})
			throw new ApolloError('Lam lai')
			return currentMenu
			// if (!currentMenu) {
			// 	throw new ApolloError('Menu not found.')
			// }
			// const idNode = currentMenu.idNode
			// const newname = await getMongoRepository(MenuEntity).findOne({
			// 	name,
			// 	idNode,
			// 	isActive: true
			// })
			// if (newname) {
			// 	throw new ApolloError('The menu name is the same.')
			// }
			// if (!!idShop) {
			// 	const listDish = await getMongoRepository(DishEntity).find({ idShop })
			// 	const infoDishes = listDish.map(
			// 		dish => new DishShopEntity({ name: dish.name, _id: dish._id })
			// 	)
			// 	const menuUpdated = new MenuEntity({
			// 		...currentMenu,
			// 		name,
			// 		idShop,
			// 		dishes: infoDishes
			// 	})
			// 	await getMongoRepository(MenuEntity).save(menuUpdated)
			// 	return menuUpdated
			// } else {
			// 	const updateMenu = new MenuEntity({ ...currentMenu, name, idShop })
			// 	await getMongoRepository(MenuEntity).save(updateMenu)
			// 	return updateMenu
			// }
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async deleteMenu(@Args('id') id: string): Promise<boolean> {
		try {
			return !!(await getMongoRepository(MenuEntity).update(
				{ _id: id },
				{ isActive: false, updatedAt: +new Date() }
			))
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation('lockAndUnlockMenu')
	async lockAndUnlockMenu(@Args('id') id: string): Promise<boolean> {
		try {
			const currentMenu = await getMongoRepository(MenuEntity).findOne({
				_id: id
			})
			if (!currentMenu) {
				throw new ApolloError('Menu not found.')
			}
			if (!currentMenu.isPublished) {
				throw new ApolloError('Menu not published.')
			}
			currentMenu.isLocked = !currentMenu.isLocked
			return !!(await getMongoRepository(MenuEntity).save(currentMenu))
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Query('getMenuPublished')
	async getMenuPublished(): Promise<Menu> {
		const menuPublished = await getMongoRepository(MenuEntity).findOne({
			isPublished: true
		})

		if (!menuPublished) return null
		return menuPublished
	}

	async getLockMenuByDate(
		startDate: number,
		endDate: number
	): Promise<MenuEntity[]> {
		console.log('startDate', startDate, endDate)
		if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
			throw new ApolloError('Invalid startDate or endDate')
		}
		return getMongoRepository(MenuEntity).find({
			where: {
				isLocked: true,
				updatedAt: { $gte: startDate, $lte: endDate }
			}
		})
	}

	@Query()
	async getLockMenus(
		@Args('by') by: ByLockMenu,
		@Args('variables') variables: VariablesLockMenu
	): Promise<MenuEntity[]> {
		try {
			switch (by) {
				case ByLockMenu.DATE: {
					const { startDate, endDate } = variables
					return await this.getLockMenuByDate(startDate, endDate)
				}

				default:
					throw new ApolloError('Unexpected argument "by"')
			}
		} catch (error) {
			throw new ApolloError(error)
		}
	}
}
