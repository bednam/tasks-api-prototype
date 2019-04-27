import axios from 'axios'
import moment from 'moment'
import models from './'
import { moveRepeatData, attachTaskToSubproject } from './utils'

class Task {
	constructor() {
		this.api = axios.create({
			baseURL: 'http://localhost:4000' // json-server endpoint
		})
	}

	list() {
		return this.api.get('/tasks').then(res => res.data)
	}

	find(id) {
		return this.api.get(`/tasks/${id}`).then(res => res.data)
	}

	async create(data) {
		return this.api.post('/tasks', data).then(res => res.data)
	}

	update(id, data) {
		return this.api.patch(`/tasks/${id}`, data).then(res => res.data)
	}

	delete(id) {
		return this.api.delete(`/tasks/${id}`).then(res => res.data)
	}

	async repeat() {
		let tasks = await this.list()
		tasks = tasks.filter(task => task.repeat && task.repeat > 0).filter(task => moment(task.max_date, 'DD/MM/YYYY').diff(moment(), 'days') == 0)

		tasks.map(task => {
			this.create(moveRepeatData(task)).then(createdTask => attachTaskToSubproject(models, task.subproject, createdTask.id))

			this.update(task.id, { repeat: '' })
		})

	}
}

export default new Task()
