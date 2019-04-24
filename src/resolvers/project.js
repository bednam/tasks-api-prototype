export default {
  Query: {
    projects: (source, args, { models }) => models.Project.list(),
  },
  Mutation: {
    createProject: (source, args, { models }) => models.Project.create(args),
  },
  Project: {
    subprojects: (source, args, { models }) => !source.subprojects || !source.subprojects.length ? [] : 
    Promise.all(source.subprojects.map(id => models.Subproject.find(id)))
  }
}
