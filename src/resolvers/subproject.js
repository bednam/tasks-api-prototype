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
    Promise.all(source.tasks.map(id => models.Task.find(id)))
  }
}
