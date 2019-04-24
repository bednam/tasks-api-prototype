import { gql } from 'apollo-server-express';

export default gql`
	extend type Query {
		activeTimelog: Timelog
		timelogs: [Timelog]
		dailyTimelogs: [Timelog!]!
	}
	extend type Mutation {
		createTimelog(task: Int!): Timelog
		updateTimelog(input: TimelogInput!): Timelog
		stopTimelog(id: Int!): Timelog
	}
	type Timelog {
		id: Int!
		start_time: String!
		finish_time: String
		task: Task
	}
	input TimelogInput {
		id: Int!
		start_time: String!
		finish_time: String!
	}
`