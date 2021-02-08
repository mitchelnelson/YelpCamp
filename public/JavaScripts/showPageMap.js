mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/omgbeandip/ckkww2l2c5gn617mli11iyqpp', // stylesheet location
	center: campground.geometry.coordinates, // starting position [lng, lat]
	zoom: 12 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
	.setLngLat(campground.geometry.coordinates)
	.setPopup(
		new mapboxgl.Popup({ closeOnClick: false, offset: 25 })
			.setHTML(
				`<h4>${campground.title}</h4><p>${campground.location}</p>`
			)
			.addTo(map)
	)
	.addTo(map);
