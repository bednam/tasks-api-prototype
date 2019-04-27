import moment from 'moment'
import _ from 'lodash'
import { attachTaskToSubproject } from '../models/utils'

export default {
  Query: {
    tasks:   async (parent, args, { models }) =>  {
      let list = await models.Task.list().then(list => list.reverse())
      if(args.filters.subproject_id) {
        list = list.filter(task => task.subproject === args.filters.subproject_id)
      }
      return list
    },
    weeklyTasks: async (parent, args, { models }) => models.Task.list().then(list => list.filter(task => task.max_date ? Math.abs(moment(task.max_date, 'DD/MM/YYYY').diff(moment(), 'days')) < 4 : false))
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
      const task = await models.Task.find(args.input.id)
      
      if(args.input.subproject && task.subproject) {
        const task = await models.Task.find(args.input.id)
        const prevSubproject = await models.Subproject.find(task.subproject)

        await models.Subproject.update(prevSubproject.id, { tasks: _.without(prevSubproject.tasks, args.input.id) })
      }

      if(args.input.subproject) {
        await attachTaskToSubproject(models, args.input.subproject, args.input.id)
      }

      return models.Task.update(args.input.id, args.input)
    },
    completeTask: async (source, args, { models }) => {
      const task = await models.Task.find(args.id)

      if(task.repeat == 0) {
        const newTask = await models.Task.create({ 
          name: task.name, 
          priority: task.priority,
          time_estimate: task.time_estimate,
          comments: task.comments,
          project: task.project,
          subproject: task.subproject,
          repeat: '0'
        })

        await attachTaskToSubproject(models, task.subproject, newTask.id)
      }

      return models.Task.update(args.id, { completed: !task.completed, finish_date: task.completed ? '' : moment().format('DD/MM/YYYY')})
    },
    deleteTask: async (source, args, { models }) => {
      const timelogs = await models.Timelog.list()
      timelogs.map(t => t.task === args.id && models.Timelog.delete(t.id))


      const subprojects = await models.Subproject.list()
      subprojects.map(s => s.tasks.map(taskId => taskId === args.id && models.Subproject.update(s.id, {tasks: _.without(s.tasks, args.id)})))
      
      const task = await models.Task.find(args.id)
      
      await models.Task.delete(args.id)
      
      return task
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
    },
    time_status: async (source, args, { models }) => {
      const timelogs = await models.Timelog.list().then(list => list.filter(timelog => timelog.task === source.id))

      const estimate = timelogs.reduce((acc, curr) => curr.finish_time ? acc.add(moment(curr.finish_time, 'HH:mm:ss').diff(moment(curr.start_time))) : acc, 
        moment.duration(0))

      return moment.utc(estimate.as('milliseconds')).format('HH:mm:ss')
    }
  }
}

