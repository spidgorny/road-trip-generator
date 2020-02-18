import { Server } from "miragejs"

export default function initMirage() {
	return new Server({
		routes() {
			this.get("src/demoRoute.json", () => {
				return require('../fixture/demoRoute.json');
			});

			this.get("http://overpass-api.de/api/status", (schema, request) => {
				console.log('status', request.queryParams);
				return `Connected as: 3586544248
Current time: 2020-02-18T13:29:55Z
Rate limit: 2
2 slots available now.
Currently running queries (pid, space limit, time limit, start time):`;
			});

			this.get("http://overpass-api.de/api/interpreter", (schema, request) => {
				console.log('interpreter', request.queryParams.data);
				return require('../fixture/demoOverpass.json');
			})
		},
	})
}
