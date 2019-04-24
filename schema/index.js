import { gql } from 'apollo-server-express'
// import userModel from './models'
import taskModel from './models/Task'
import projectModel from './models/Project'
import subprojectModel from './models/Subproject'
import timelogModel from './models/Timelog'
import moment from 'moment'

export const typeDefs = gql`
	type Project {
		id: Int!
		name: String!
		subprojects: [Subproject!]!
	}
	type Subproject {
		id: Int!
		name: String!
		project: Project!
	}
	type Task {
		id: Int!
		name: String!
		priority: String
		time_estimate: String
		time_planned: String
		max_date: String
		comments: String
		finish_date: String
		project: Project
		subproject: Subproject
		timelogs: [Timelog!]!
		activeTimelog: Timelog
		total_time: String
		completed: Boolean
	}
	type Timelog {
		id: Int!
		start_time: String!
		finish_time: String
		task: Task
	}
	type Query {
		projects: [Project!]!
		subprojects: [Subproject!]!
		tasks: [Task!]!
		activeTimelog: Timelog
		timelogs: [Timelog]
		dailyTimelogs: [Timelog!]!
	}
	input TaskInput {
		id: Int!
		completed: Boolean
		time_estimate: String
		time_planned: String
		max_date: String
		finish_date: String
		name: String
		priority: String
		comments: String
		project: Int
		subproject: Int
	}
	input TimelogInput {
		id: Int!
		start_time: String!
		finish_time: String!
	}
	type Mutation {
		createTask(name: String!): Task
		updateTask(input: TaskInput!): Task
		completeTask(id: Int!): Task
		deleteTask(id: Int!): Task
		createTimelog(task: Int!): Timelog
		updateTimelog(input: TimelogInput!): Timelog
		createTaskWithTimelog(name: String!): Task
		stopTimelog(id: Int!): Timelog
		createProject(name: String!): Project
		createSubproject(name: String!, project: Int!): Subproject
	}
`

export const resolvers = {
	Query: {
		tasks:   () => taskModel.list().then(list => list.reverse()),
		projects: () => projectModel.list(),
		subprojects: () => subprojectModel.list(),
		activeTimelog: async () => {
			const timelogs = await timelogModel.list()

			return timelogs.find(({ finish_time }) => !finish_time)
		},
		timelogs: () => timelogModel.list(),
		dailyTimelogs: async () => {
			const timelogs = await timelogModel.list().then(list => list.reverse())


			return timelogs.filter(({ finish_time }) => moment().diff(finish_time, 'days') == 0)
		}
	},
	Timelog: {
		task: source => {
			return taskModel.find(source.task)
		}
	},
	Task: {
		project: source => {
			if (!source.project) return

			return projectModel.find(source.project)
		},
		subproject: source => {
			if (!source.subproject) return

			return subprojectModel.find(source.subproject)
		},
		activeTimelog: async source => {
			const timelogs = await timelogModel.list()

			return timelogs.find(
				({ finish_time, task }) => !finish_time && task == source.id
			)
		},
		timelogs: async source => {
			const timelogs = await timelogModel.list()

			return timelogs.filter(
				({ task, finish_time }) => task == source.id && finish_time
			)
		}
	},
	Project: {
		subprojects: source => {
			if (!source.subprojects || !source.subprojects.length) {
				return []
			}

			return Promise.all(
				source.subprojects.map(id => subprojectModel.find(id))
			)
		}
	},
	Mutation: {
		createTask: (source, args) => taskModel.create(args),
		updateTask: (source, args) =>
			taskModel.update(args.input.id, args.input),
		completeTask: async (source, args) => {
			const task = await taskModel.find(args.id)

			return taskModel.update(args.id, { completed: !task.completed, finish_date: task.completed ? '' : moment().format()})
		},
		deleteTask: (source, args) => taskModel.delete(args.id),
		createTimelog: async (source, args) => {
			const timelogs = await timelogModel.list()

			const active = timelogs.find(({ finish_time }) => !finish_time)

			if (active) {
				await timelogModel.update(active.id, {
					finish_time: new Date()
				})
			}

			return timelogModel.create(args)
		},
		updateTimelog: (source, args) =>
			timelogModel.update(args.input.id, args.input),
		createTaskWithTimelog: async (source, args) => {
			const task = await taskModel.create(args)

			const timelog = await timelogModel.create({ task: task.id })

			return {
				...task,
				timelog
			}
		},
		stopTimelog: (source, args) =>
			timelogModel.update(args.id, { finish_time: new Date() }),
		createProject: (source, args) => projectModel.create(args),
		createSubproject: async (source, args) => {
			const subproject = await subprojectModel.create(args)

			const project = await projectModel.find(args.project)

			await projectModel.update(args.project, {
				subprojects: [...project.subprojects, subproject.id]
			})

			return subproject
		}
	}
}
