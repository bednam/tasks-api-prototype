import { gql } from 'apollo-server-express';

export default gql`
	extend type Query {
		subprojects: [Subproject!]!
	}
	extend type Mutation {
		createSubproject(name: String!, project: Int!): Subproject
	}
	type Subproject {
		id: Int!
		name: String!
		project: Project!
		tasks: [Task]
		time_estimate: String
	}
`