import moment from 'moment'

export default {
  Query: {
    projects: (source, args, { models }) => models.Project.list(),
  },
  Mutation: {
    createProject: (source, args, { models }) => models.Project.create(args),
  },
  Project: {
    subprojects: (source, args, { models }) => !source.subprojects || !source.subprojects.length ? [] : 
    Promise.all(source.subprojects.map(id => models.Subproject.find(id))),
    time_estimate: async (source, args, { models }) => {
      const tasks = await models.Task.list().then(list => list.filter(task => task.project === source.id))

      const estimate = tasks.reduce((acc, curr) => curr.time_estimate ? acc.add(moment.duration(curr.time_estimate, 'HH:mm:ss')) : acc, 
        moment.duration(0))

      return moment.utc(estimate.as('milliseconds')).format('HH:mm:ss')
    }
  }
}
