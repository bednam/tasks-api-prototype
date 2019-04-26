import moment from 'moment'
import _ from 'lodash'

export default {
  Query: {
    tasks:   async (parent, args, { models }) =>  {
      let list = await models.Task.list().then(list => list.reverse())

      if(args.filters.subproject_id) {
        list = list.filter(task => task.subproject === args.filters.subproject_id)
      }

      return list.filter(({ completed, finish_date}) => !completed || completed && moment(finish_date, 'DD/MM/YYYY').isSame(moment(), 'days'))
    },
  },
  Mutation: {
    createTask: (source, args, { models }) => models.Task.create(args),
    createTaskWithTimelog: async (source, args, { models }) => {
      const task = await models.Task.create(args)
      const timelog = await models.Timelog.create({ task: task.id })
      return {
        ...task,
        timelog
      }
     },
    updateTask: async (source, args, { models }) => {
      const task = await models.Task.update(args.input.id)
      
      if(args.input.subproject && task.subproject) {
        const task = await models.Task.find(args.input.id)
        const prevSubproject = await models.Subproject.find(task.subproject)

        await models.Subproject.update(prevSubproject.id, { tasks: _.without(prevSubproject.tasks, args.input.id) })
      }
      if(args.input.subproject) {
        const subproject = await models.Subproject.find(args.input.subproject)
        const tasks = subproject.tasks ? [...subproject.tasks, args.input.id] : [args.input.id]

        await models.Subproject.update(args.input.subproject, { tasks })
      }

      return await models.Task.update(args.input.id, args.input)
    },
    completeTask: async (source, args, { models }) => {
      const task = await models.Task.find(args.id)

      return models.Task.update(args.id, { completed: !task.completed, finish_date: task.completed ? '' : moment().format('DD/MM/YYYY')})
    },
    deleteTask: async (source, args, { models }) => {
      const timelogs = await models.Timelog.list()
      timelogs.map(t => t.task === args.id && models.Timelog.delete(t.id))


      const subprojects = await models.Subproject.list()
      subprojects.map(s => s.tasks.map(taskId => taskId === args.id && models.Subproject.update(s.id, {tasks: _.without(s.tasks, args.id)})))
      
      await models.Task.delete(args.id)

      return { id: args.id }
    },  

  },
  Task: {
    project: (source, args, { models }) => {
      if (!source.project) return

      return models.Project.find(source.project)
    },
    subproject: (source, args, { models }) => {
      if (!source.subproject) return

      return models.Subproject.find(source.subproject)
    },
    activeTimelog: async (source, args, { models }) => {
      const timelogs = await models.Timelog.list()

      return timelogs.find(
        ({ finish_time, task }) => !finish_time && task == source.id
      )
    },
    timelogs: async (source, args, { models }) => {
      const timelogs = await models.Timelog.list()

      return timelogs.filter(
        ({ task, finish_time }) => task == source.id && finish_time
      )
    }
  }
}

