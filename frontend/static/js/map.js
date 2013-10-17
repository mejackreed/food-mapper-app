// Getting CSRF token to allow post requests

function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) == (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}
var csrftoken = getCookie('csrftoken');

// Sets up AJAX requests to use CSRF Token
$(function() {
	$.ajaxSetup({
		headers: {
			"X-CSRFToken": getCookie("csrftoken")
		}
	});
});

// Define basemap layer
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
	maxZoom: 19,
	subdomains: ["otile1", "otile2", "otile3", "otile4"],
	attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});

var gaTech = [33.77764915000493, -84.39986944198608];

var map_detail = L.map("map", {
	zoom: 15,
	center: gaTech,
	layers: [mapquestOSM]
});

//Add geolocation

L.control.locate({
	follow: true,
	stopFollowingOnDrag: true
}).addTo(map_detail);

// Layer group to hold all markers shown on map
var allMarkers = new L.layerGroup();

// Get food sources and parse them to markers in layer group

function getSources() {
	$.getJSON('/api/maps/' + map.pk, function(data) {
		$.each(data.sources, function(i, val) {
			allMarkers.addLayer(L.marker([val.latitude, val.longitude]).on('click', function(e){
				$('#view-source-header').html("<h4 class=''>" + val.name + "</h4>")
				$('#view-source-body').html("<span class='small text-muted pull-right'>" + moment(val.created).fromNow() + "</span>" + val.description);
				$('#view-source-modal').modal('show');
			}))
		})
		allMarkers.addTo(map_detail)
	})
}

getSources();

//post new food source on success clear markers and get all markers... need to modify to get ?Created > initial pageload date/time

function addSource() {
	$('#add-source-modal').modal('hide')
	var latlng = map_detail.getCenter()
	var name = $('#sourceName').val()
	var desc = $('#sourceDesc').val()
	$('#sourceName').val('');
	$('#sourceDesc').val('');
	$.post('/api/sources/', {
		latitude: latlng.lat,
		longitude: latlng.lng,
		name: name,
		description: desc,
		map: map.pk
	}, function(data, status) {
		if (status === 'success') {
			allMarkers.clearLayers();
			getSources();
		}
	})
}