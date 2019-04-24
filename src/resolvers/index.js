import { GraphQLDateTime } from 'graphql-iso-date';
import taskResolvers from './task';
import timelogResolvers from './timelog';
import projectResolvers from './project'
import subprojectResolvers from './subproject'

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  taskResolvers,
  timelogResolvers,
  projectResolvers,
  subprojectResolvers
];