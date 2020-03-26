import { Resolver, Query, Mutation, Args, ResolveProperty, Parent } from '@nestjs/graphql'
import { getMongoRepository } from 'typeorm'
import { Node as NodeEntity } from '@models'
import {
  ApolloError,
  ForbiddenError
} from 'apollo-server-core'
import {
  NodeInput,
  NodeResponse
} from '../generator/graphql.schema'
import { async } from 'rxjs/internal/scheduler/async'

@Resolver('NodeResponse')
export class NodeResolver {
  @Query()
  async nodes(): Promise<NodeResponse[]> {
    const createdNodes = await getMongoRepository(NodeEntity).find({})
    const responseNodes = []
    createdNodes.forEach((node, index) => {
      responseNodes.push({ ...node })
    })
    return responseNodes
  }

  @Query()
  async nodesByIDParent(@Args('_id') _id: string): Promise<NodeResponse[]> {
    const createdNodes = await getMongoRepository(NodeEntity).find({ idParent: _id })
    const responseNodes = []
    createdNodes.forEach((node, index) => {
      responseNodes.push({ ...node })
    })
    return responseNodes
  }

  @Query()
  async parentNodes(@Args('_id') _id: string): Promise<NodeResponse[]> {
    const createdNodes = await getMongoRepository(NodeEntity).find({ idParent: null })
    const responseNodes = []
    createdNodes.forEach((node) => {
      responseNodes.push({ ...node })
    })
    return responseNodes
  }

  @Mutation()
  async createNode(@Args('input') input: NodeInput): Promise<NodeResponse> {
    try {
      if (input.idParent) {
        const existNode = await getMongoRepository(NodeEntity).findOne({ _id: input.idParent})
        if (!existNode) {
          throw new ApolloError('Node not found', '404')
        }
      }
      else if ( input.category === 'CITY' || input.category === 'DEPARTMENT') {
        throw new ForbiddenError('Please select parent node')
      }
      const createdNode = await getMongoRepository(NodeEntity).save(new NodeEntity(input))
      return createdNode
    } catch (err) {
      throw new ApolloError(err)
    }

  }

  @Mutation()
  async updateNode(@Args('_id') _id: string, @Args('input') input: NodeInput): Promise<NodeResponse> {
    try {
      const createdNode = await getMongoRepository(NodeEntity).find({ _id })
      if (!createdNode) {
        throw new ApolloError('Node not found', '404')
      }
      // check update idParent
      const childrenNodes = await getMongoRepository(NodeEntity).find({ idParent: _id })
      const grandchildrenNodes = []
      childrenNodes.forEach( async (node) => {
        if (!node.idParent) {
          const nodes = await getMongoRepository(NodeEntity).find({ idParent: _id })
          grandchildrenNodes.push(...nodes)
        }
      })
      childrenNodes.forEach((child) => {
        if (child._id === input.idParent) {
          throw new ForbiddenError('Can not move node into children node')
        }
      })
      grandchildrenNodes.forEach((grandchild) => {
        if (grandchild._id === input.idParent) {
          throw new ForbiddenError('Can not move node into grandchildren node')
        }
      })
      const updatedNode = await getMongoRepository(NodeEntity).save({ ...createdNode, ...input, _id })
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
      const childrenNodes = await getMongoRepository(NodeEntity).find({ idParent: _id })
      if (childrenNodes.length > 0) {
        throw new ForbiddenError('Can not delete parent node')
      }

      const deletedNode = await getMongoRepository(NodeEntity).deleteOne({ _id })
      return !!deletedNode
    } catch (err) {
      throw new ApolloError(err)
    }
  }

  @ResolveProperty()
  async parent(@Parent() node) {
    const { idParent } = node;
    const parentNode = await getMongoRepository(NodeEntity).findOne({ _id: idParent })
    return parentNode
  }

  async recursive(node) {
    const subNodes = await getMongoRepository(NodeEntity).find({ idParent: node._id })
    if (!subNodes) {
      return
    }
    subNodes.forEach(async subNode => {
      await this.recursive(subNode)
      await getMongoRepository(NodeEntity).deleteMany({ _id: subNode._id })
    })
  }
}
