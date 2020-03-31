import {
	Resolver,
	Query,
	Mutation,
	Args,
	ResolveProperty,
	Parent
} from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { Node as NodeEntity } from '@models'
import { ApolloError, ForbiddenError } from 'apollo-server-core'
import {
	NodeInput,
	Category,
	TreeNodeResponse,
	Node
} from '../generator/graphql.schema'
import { NAME } from '@environments'
@Resolver('Node')
export class NodeResolver {
	@Query()
	async nodes(): Promise<Node[]> {
		const allNode = await getMongoRepository(NodeEntity).find({})
		return allNode
	}

	@Query()
	async treeNodes(): Promise<TreeNodeResponse[]> {
		const treeNodes = await getMongoRepository(NodeEntity)
			.aggregate([
				{
					$graphLookup: {
						from: `${NAME}_nodes`,
						startWith: '$_id',
						connectFromField: '_id',
						connectToField: 'idParent',
						as: 'children'
					}
				},
				{
					$addFields: {
						expanded: true
					}
				},
				{
					$project: {
						_id: '$_id',
						name: '$name',
						category: '$category',
						children: '$children',
						idParent: '$idParent',
						expanded: '$expanded'
					}
				}
			])
			.toArray()
		const final_result = [] // For Storing all parent with childs
		if (treeNodes.length >= 0) {
			treeNodes.map(single_node => {
				// For getting all parent Tree
				const single_child = this.list_to_tree(single_node.children)
				const obj = {
					_id: single_node._id,
					title: single_node.name,
					subtitle: single_node.category,
					idParent: single_node.idParent,
					expanded: single_node.expanded,
					children: single_child
				}
				final_result.push(obj)
			})
		}
		const result = final_result.filter(node => node.idParent === null)
		return result
	}

	@Query()
	async nodesByIDParent(@Args('_id') _id: string): Promise<Node[]> {
		const responseNodes = await getMongoRepository(NodeEntity).find({
			idParent: _id
		})
		return responseNodes
	}

	@Query()
	async getNodeByCategory(
		@Args('category') category: Category
	): Promise<Node[]> {
		const responseNodes = await getMongoRepository(NodeEntity).find({
			category
		})
		return responseNodes
	}

	@Query()
	async parentNodes(@Args('_id') _id: string): Promise<Node[]> {
		const responseNodes = await getMongoRepository(NodeEntity).find({
			idParent: null
		})
		return responseNodes
	}

	@Mutation()
	async createNode(@Args('input') input: NodeInput): Promise<Node> {
		try {
			if (input.idParent) {
				const existNode = await getMongoRepository(NodeEntity).findOne({
					_id: input.idParent
				})
				if (!existNode) {
					throw new ApolloError('Node not found', '404')
				}
			}

			const createdNode = await getMongoRepository(NodeEntity).save(
				new NodeEntity(input)
			)
			return createdNode
		} catch (err) {
			throw new ApolloError(err)
		}
	}

	@Mutation()
	async updateNode(
		@Args('_id') _id: string,
		@Args('input') input: NodeInput
	): Promise<Node> {
		try {
			const currentNode = await getMongoRepository(NodeEntity).findOne({ _id })
			if (!currentNode) {
				throw new ApolloError('Node not found', '404')
			}

			if (input.idParent) {
				const parentNodeUpdate = await getMongoRepository(NodeEntity).findOne({
					_id: input.idParent
				})
				if (!parentNodeUpdate) {
					throw new ApolloError('Not found parent node', '404')
				}
				if (_id === input.idParent) {
					throw new ApolloError('Can not set itself is parent Node', '403')
				}
			} else {
				input.idParent = null
			}
			const graphLookupNode = await getMongoRepository(NodeEntity)
				.aggregate([
					{
						$graphLookup: {
							from: `${NAME}_nodes`,
							startWith: '$_id',
							connectFromField: '_id',
							connectToField: 'idParent',
							as: 'childrens'
						}
					}
				])
				.toArray()
			const currentNodeParent = graphLookupNode.filter(
				ele => ele._id === _id
			)[0]
			// check move into children node
			if (currentNodeParent.childrens.length > 0) {
				currentNodeParent.childrens.forEach(node => {
					if (node._id === input.idParent) {
						throw new ForbiddenError(
							'can not move parent node into children node'
						)
					}
				})
			}
			const updatedNode = await getMongoRepository(NodeEntity).save({
				...currentNode,
				...input,
				_id
			})
			return updatedNode
		} catch (err) {
			throw new ApolloError(err)
		}
	}

	@Mutation()
	async deleteNode(@Args('_id') _id: string): Promise<Boolean> {
		try {
			const createdNode = await getMongoRepository(NodeEntity).findOne({ _id })
			if (!createdNode) {
				throw new ApolloError('Node not found', '404')
			}
			// check delete parent
			const childrenNodes = await getMongoRepository(NodeEntity).find({
				idParent: _id
			})
			if (childrenNodes.length > 0) {
				throw new ForbiddenError('Can not delete parent node')
			}

			const deletedNode = await getMongoRepository(NodeEntity).deleteOne({
				_id
			})
			return !!deletedNode
		} catch (err) {
			throw new ApolloError(err)
		}
	}

	// @ResolveProperty()
	// async parent(@Parent() node) {
	// 	const { idParent } = node
	// 	const parentNode = await getMongoRepository(NodeEntity).findOne({
	// 		_id: idParent
	// 	})
	// 	return parentNode
	// }

	async recursiveCheckAllNode(node, idParentNew) {
		const subNodes = await getMongoRepository(NodeEntity).find({
			idParent: node._id
		})
		if (!subNodes) {
			return
		}
		subNodes.forEach(async subNode => {
			if (subNode._id === idParentNew) {
				throw new Error('can not move parent node into children node')
			}
			await this.recursiveCheckAllNode(subNode, idParentNew)
		})
	}

	list_to_tree(list) {
		const map = {},
			roots = []
		let i, node
		for (i = 0; i < list.length; i += 1) {
			map[list[i]._id] = i
			list[i].children = []
		}
		for (i = 0; i < list.length; i += 1) {
			node = list[i]
			node.expanded = true
			if (node.idParent !== null && map[node.idParent] !== undefined) {
				const node2 = {
					// Because costum node
					_id: node._id,
					title: node.name,
					subtitle: node.category,
					idParent: node.idParent,
					expanded: node.expanded,
					children: node.children
				}
				list[map[node.idParent]].children.push(node2) // You can push direct "node"
			} else {
				const node2 = {
					_id: node._id,
					title: node.name,
					subtitle: node.category,
					idParent: node.idParent,
					expanded: node.expanded,
					children: node.children
				}
				roots.push(node2)
			}
		}
		return roots
	}
}
