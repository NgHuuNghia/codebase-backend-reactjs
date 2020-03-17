query q {
  todos {
    _id
    title
    isActive
    createdAt
    updatedAt
  }
}

mutation c {
  createTodo(input: { title: "Di uong cafe" })
}

mutation u {
  updateTodo(
    _id: "ca8afc50-5dc8-11ea-8974-5f59527cbdc7"
    input: { title: "Di ve" }
  )
}

mutation d {
  deleteTodo(_id: "ca8afc50-5dc8-11ea-8974-5f59527cbdc7")
}
