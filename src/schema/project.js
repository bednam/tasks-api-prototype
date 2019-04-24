import { gql } from 'apollo-server-express';

export default gql`
	extend type Query {
		projects: [Project!]!
	}
	extend type Mutation {	
		createProject(name: String!): Project
	}
	type Project {
		id: Int!
		name: String!
		subprojects: [Subproject!]!
	}
`