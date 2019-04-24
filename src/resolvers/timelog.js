import moment from 'moment'

export default {
  Query: {
    timelogs: (source, args, { models }) => models.Timelog.list(),
    dailyTimelogs: async (source, args, { models }) => {
      const timelogs = await models.Timelog.list().then(list => list.reverse())


      return timelogs.filter(({ finish_time }) => moment().diff(finish_time, 'days') == 0)
    },
    activeTimelog: (source, args, { models }) => models.Timelog.list().then(list => list.find(timelog => !timelog.finish_time))
  },
  Mutation: {
    createTimelog: async (source, args, { models }) => {
      const timelogs = await models.Timelog.list()

      const active = timelogs.find(({ finish_time }) => !finish_time)

      if (active) {
        await models.Timelog.update(active.id, {
          finish_time: new Date()
        })
      }

      return models.Timelog.create(args)
    },
    updateTimelog: (source, args, { models }) =>
      models.Timelog.update(args.input.id, args.input),
    stopTimelog: (source, args, { models }) =>
      models.Timelog.update(args.id, { finish_time: moment().format() }),
  },
  Timelog: {
    task: (source, args, { models }) => {
      return models.Task.find(source.task)
    }
  }
}
