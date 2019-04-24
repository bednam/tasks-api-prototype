import { gql } from 'apollo-server-express';
import taskSchema from './task';
import timelogSchema from './timelog';
import projectSchema from './project'
import subprojectSchema from './subproject'

const linkSchema = gql`
  scalar Date
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

export default [linkSchema, taskSchema, timelogSchema, projectSchema, subprojectSchema];