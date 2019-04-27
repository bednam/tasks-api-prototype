export const moveRepeatData = (task) => ({					
					name: task.name,
					priority: task.priority,
					time_estimate: task.time_estimate,
					time_planned: task.time_planned ? moment(task.time_planned, 'DD/MM/YYYY').add(task.repeat, 'days').format('DD/MM/YYYY') : '',
					max_date: moment(task.max_date, 'DD/MM/YYYY').add(task.repeat, 'days').format('DD/MM/YYYY'),
					comments: task.comments,
					repeat: task.repeat,
					project: task.project,
					subproject: task.subproject
				})

export const attachTaskToSubproject = async (models, subprojectId, taskId) => {
  if(!subprojectId || !taskId) return
  const subproject = await models.Subproject.find(subprojectId)
  const tasks = subproject.tasks ? [...subproject.tasks, taskId] : [taskId]

  await models.Subproject.update(subprojectId, { tasks })
}