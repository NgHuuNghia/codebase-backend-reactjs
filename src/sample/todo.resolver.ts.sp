import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { ForbiddenError, ApolloError } from 'apollo-server-express'

import { Todo as TodoEntity } from '@models'
import {
	Todo,
	CreateTodoInput,
	UpdateTodoInput
} from '../generator/graphql.schema'

@Resolver('Todo')
export class TodoResolver {
	@Query()
	async todos(): Promise<Todo[]> {
		const result = await getMongoRepository(TodoEntity).find({ isActive: true })

		return result
	}

	@Mutation()
	async createTodo(@Args('input') input: CreateTodoInput): Promise<boolean> {
		try {
			const result = await getMongoRepository(TodoEntity).save(
				new TodoEntity({ ...input })
			)

			return !!result
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async updateTodo(
		@Args('_id') _id: string,
		@Args('input') input: UpdateTodoInput
	): Promise<boolean> {
		try {
			const { title } = input

			const foundTodo = await getMongoRepository(TodoEntity).findOne({ _id })

			if (!foundTodo) {
				throw new ForbiddenError('Not Found: Todo')
			}

			const result = await getMongoRepository(TodoEntity).save({
				...foundTodo,
				title
			})

			return !!result
		} catch (error) {
			throw new ApolloError(error)
		}
	}

	@Mutation()
	async deleteTodo(@Args('_id') _id: string): Promise<boolean> {
		try {
			const foundTodo = await getMongoRepository(TodoEntity).findOne({ _id })

			if (!foundTodo) {
				throw new ForbiddenError('Not Found: Todo')
			}

			const result = await getMongoRepository(TodoEntity).save({
				...foundTodo,
				isActive: false
			})

			return !!result
		} catch (error) {
			throw new ApolloError(error)
		}
	}
}
