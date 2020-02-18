import React, { useState } from '/web_modules/react.js';
import {IRoute} from "./declarations";
import {Route} from "./route";

// var L = import('leaflet');
// import('leaflet-routing-machine');
declare var L: any;

export class Generator {
	map: any;

	fromTo = [
		L.latLng(57.74, 11.94),	// Goteborg
		L.latLng(57.6792, 11.949),
		// L.latLng(50.1213479,8.4964827), // Frankfurt
		// L.latLng(52.5069313,13.1445601),	// Berlin
	];

	route: IRoute;

	constructor() {
		this.map = L.map('map');
		new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors'
		}).addTo(this.map);

		// this.map.setView([51.505, -0.09], 13);

		L.control.scale().addTo(this.map);

		this.map.fitBounds(this.bounds);
	}

	setFrom(lat, lon) {
		this.fromTo[0] = L.latLng(lat, lon);
	}

	setTo(lat, lon) {
		this.fromTo[1] = L.latLng(lat, lon);
	}

	get bounds() {
		const bounds = L.latLngBounds();
		this.fromTo.map((pos) => {
			bounds.extend(pos);
		});
		return bounds;
	}

	get waypoints() {
		return this.fromTo.map((pos) => {
			return new L.Routing.Waypoint(pos);
		});
	}

	/// @deprecated
	showControl() {
		const control = L.Routing.control({
			waypoints: this.waypoints,
			routeWhileDragging: true
		});
		control.addTo(this.map);

		control.addEventListener('routesfound', (e) => {
			console.log('routesfound', e);
		});
	}

	startRouting() {
		const plan = new L.Routing.Plan(this.waypoints, {});
		if (plan.isReady()) {
			plan.addEventListener('waypointgeocoded', (e) => {
				console.log('waypointgeocoded', e);
			});
			const osrm = new L.Routing.osrmv1();
			osrm.route(this.waypoints, (err?, routes?: IRoute[]) => {
				if (err) {
					throw new Error(err.toString());
				}
				this.renderRoutes(routes);
			});
		}
	}

	async demoRouting() {
		const plan = new L.Routing.Plan(this.waypoints, {});
		if (plan.isReady()) {
			const json = await fetch('fixture/demoRoute.json');
			let routes = await json.json();

			// fix after JSON serialization
			routes = routes.map((route: IRoute) => {
				route.inputWaypoints = route.inputWaypoints.map((wp) => {
					return new L.Routing.Waypoint(wp.latLng, wp.name, wp.options);
				});
				return route;
			});
			this.renderRoutes(routes);
		}
	}

	renderRoutes(routes: IRoute[]) {
		// console.log('routes', routes);
		for (const route of routes) {
			new Route(this.map,  route).render();
			break;
		}
	}

}
