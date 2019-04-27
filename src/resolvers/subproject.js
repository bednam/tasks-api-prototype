import moment from 'moment'

export default {
  Query: {
    subprojects: (source, args, { models }) => models.Subproject.list(),
  },
  Mutation: {
    createSubproject: async (source, args, { models }) => {
      const subproject = await models.Subproject.create(args)

      const project = await models.Project.find(args.project)

      const subprojects = project.subprojects ? [...project.subprojects, subproject.id] : [subproject.id]
      
      await models.Project.update(args.project, { subprojects })

      return subproject
    }
  },
  Subproject: {
    tasks: (source, args, { models }) => !source.tasks || !source.tasks.length ? [] : 
    Promise.all(source.tasks.map(id => models.Task.find(id))),
    time_estimate: async (source, args, { models }) => {
      const tasks = await models.Task.list().then(list => list.filter(task => task.subproject === source.id))

      const estimate = tasks.reduce((acc, curr) => curr.time_estimate ? acc.add(moment.duration(curr.time_estimate, 'HH:mm:ss')) : acc, 
        moment.duration(0))

      return moment.utc(estimate.as('milliseconds')).format('HH:mm:ss')
    },
    time_status: async (source, args, { models }) => {
      const tasks = await models.Task.list().then(list => list.filter(task => task.subproject === source.id))      
      let timelogs = await models.Timelog.list().then(list => list.filter(timelog => tasks.some(t => t.id === timelog.task)))

      const estimate = timelogs.reduce((acc, curr) => curr.finish_time ? acc.add(moment(curr.finish_time).diff(moment(curr.start_time))) : acc, 
        moment.duration(0))

      return moment.utc(estimate.as('milliseconds')).format('HH:mm:ss')
    }
  }
}
