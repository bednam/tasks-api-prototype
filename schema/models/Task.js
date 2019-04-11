import axios from 'axios'

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

	create(data) {
		return this.api.post('/tasks', data).then(res => res.data)
	}

	async update(id, data) {
		console.log(data)
		const a = await this.api
			.patch(`/tasks/${id}`, data)
			.then(res => res.data)
		console.log(a)
		return a
	}

	delete(id) {
		return this.api.delete(`/tasks/${id}`).then(res => res.data)
	}
}

export default new Task()
