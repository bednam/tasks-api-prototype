import axios from 'axios'

class Project {
	constructor() {
		this.api = axios.create({
			baseURL: 'http://localhost:4000' // json-server endpoint
		})
	}

	list() {
		return this.api.get('/timelogs').then(res => res.data)
	}

	find(id) {
		return this.api.get(`/timelogs/${id}`).then(res => res.data)
	}

	async create(data) {
		const timelogs = await this.list()
		if (timelogs.some(({ finish_time }) => !finish_time)) return
		return this.api
			.post('/timelogs', { ...data, start_time: new Date() })
			.then(res => res.data)
	}

	update(id, data) {
		return this.api.patch(`/timelogs/${id}`, data).then(res => res.data)
	}

	delete(id) {
		return this.api.delete(`/timelogs/${id}`).then(res => res.data)
	}
}

export default new Project()
