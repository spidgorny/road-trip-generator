import { Server } from "miragejs"

export default function initMirage() {
	return new Server({
		routes() {
			this.namespace = "";

			this.get("fixture/demoRoute.json", () => {
				return require('../../fixture/demoRoute.json');
			});

			this.get("https://router.project-osrm.org/route/v1/driving/**", (schema, request) => {
				return require('../../fixture/frankfurt-depanne.json');
			});

// 			this.get("http://overpass-api.de/api/status", (schema, request) => {
// 				console.log('status', request.queryParams);
// 				return `Connected as: 3586544248
// Current time: 2020-02-18T13:29:55Z
// Rate limit: 2
// 2 slots available now.
// Currently running queries (pid, space limit, time limit, start time):`;
// 			});

			// this.get("http://overpass-api.de/api/interpreter", (schema, request) => {
			// 	console.log('interpreter', request.queryParams.data);
			// 	console.log(request);
			// 	if (request.queryParams.data.includes('57.71061,11.92258')) {
			// 		return require('../../fixture/demoOverpass.json');
			// 	}
			// });

			this.passthrough(
				'https://nominatim.openstreetmap.org/search/**',
				// 'https://router.project-osrm.org/route/v1/driving/**',
				'http://overpass-api.de/api/**',
			);
		},
	})
}
