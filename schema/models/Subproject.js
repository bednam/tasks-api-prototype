import axios from 'axios'

class Subproject {
	constructor() {
		this.api = axios.create({
			baseURL: 'http://localhost:4000' // json-server endpoint
		})
	}

	list() {
		return this.api.get('/subprojects').then(res => res.data)
	}

	find(id) {
		return this.api.get(`/subprojects/${id}`).then(res => res.data)
	}

	create(data) {
		// data.friends = data.friends ? data.friends.map(id => ({ id })) : []

		return this.api.post('/subprojects', data).then(res => res.data)
	}

	update(id, data) {
		return this.api.patch(`/subprojects/${id}`, data).then(res => res.data)
	}

	delete(id) {
		return this.api.delete(`/subprojects/${id}`).then(res => res.data)
	}
}

export default new Subproject()
