type Todo {
	_id: ID!
	title: String
	isActive: Boolean
	createdAt: Float
	updatedAt: Float
}

input CreateTodoInput {
	title: String!
}

input UpdateTodoInput {
	title: String
}

type Query {
	todos: [Todo]
}

type Mutation {
	createTodo(input: CreateTodoInput!): Boolean
	updateTodo(_id: ID!, input: UpdateTodoInput!): Boolean
	deleteTodo(_id: ID!): Boolean
}
