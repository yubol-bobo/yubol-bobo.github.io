---
layout: page
title: Life
permalink: /life/
description: Places I've been around the world
nav: true
nav_order: 7
---

<!-- Section 1: Life Moments Gallery -->
## 📸 Life Moments

<style>
  .life-moments .card-img-top {
    max-height: 300px;
    object-fit: cover;
    width: 100%;
  }
  .life-moments .card-body {
    padding: 0.75rem;
  }
  .life-moments .card-text {
    font-size: 0.9rem;
    margin-bottom: 0;
  }
</style>

<div class="row row-cols-1 row-cols-md-3 life-moments">
  <!-- Card 1 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/1.jpg" class="card-img-top" alt="Life moment 1" %}
      <div class="card-body">
        <p class="card-text">Description of this life moment. Share your story, experience, or memory here.</p>
      </div>
    </div>
  </div>
  
  <!-- Card 2 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/2.jpg" class="card-img-top" alt="Life moment 2" %}
      <div class="card-body">
        <p class="card-text">Another meaningful moment from your journey. Add your personal touch here.</p>
      </div>
    </div>
  </div>
  
  <!-- Card 3 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/3.jpg" class="card-img-top" alt="Life moment 3" %}
      <div class="card-body">
        <p class="card-text">Share another experience, adventure, or special memory that defines your journey.</p>
      </div>
    </div>
  </div>
  
  <!-- Card 4 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/4.jpg" class="card-img-top" alt="Life moment 4" %}
      <div class="card-body">
        <p class="card-text">Tell your story. What makes this moment special to you?</p>
      </div>
    </div>
  </div>
  
  <!-- Card 5 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/5.jpg" class="card-img-top" alt="Life moment 5" %}
      <div class="card-body">
        <p class="card-text">Continue sharing your meaningful experiences and memories here.</p>
      </div>
    </div>
  </div>
  
  <!-- Card 6 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/6.jpg" class="card-img-top" alt="Life moment 6" %}
      <div class="card-body">
        <p class="card-text">Add as many cards as you like to showcase your life journey!</p>
      </div>
    </div>
  </div>
</div>

---

<!-- Section 2: Travel Map -->
## 🗺️ Places I've Been

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>

<div id="map" style="height: 400px; width: 75%; margin-bottom: 20px;"></div>

<script>
// Initialize the map
var map = L.map('map').setView([20, 5], 1.3);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
}).addTo(map);

// Define your cities here - ADD YOUR CITIES TO THIS ARRAY
var cities = [
    // Format: {name: "City Name", lat: latitude, lng: longitude, note: "Optional note"}
    
    // Example cities - Replace with your own!
    {name: "Pittsburgh, PA", lat: 40.4406, lng: -79.9959, note: "Living"},

    {name: "Beijing", lat: 39.9042, lng: 116.4074, note: "Visited"},
    {name: "New York City", lat: 40.7128, lng: -74.0060, note: "Visited"},
    {name: "ShenYang", lat: 41.8057, lng: 123.431473, note: "Hometown"},
    {name: "San Diego", lat: 32.715736, lng: -117.161087, note: "Visited"},
    {name: "Irvine", lat: 33.684566, lng: -117.826508, note: "Visited"},
    {name: "San Francisco", lat: 37.774929, lng: -122.419418, note: "Visited"},
    {name: "Utah", lat: 39.320980, lng: -111.093735, note: "Visited"},
    {name: "Washington D.C.", lat: 38.907192, lng: -77.036873, note: "Visited"},
    {name: "Philadelphia", lat: 39.952583, lng: -75.165222, note: "Visited"},
    {name: "Cincninati", lat: 39.103697, lng: -84.513613, note: "Visited"},
    {name: "Seattle", lat: 47.606209, lng: -122.332069, note: "Visited"},
    {name: "Orlando", lat: 28.538336, lng: -81.379234, note: "Visited"},
    {name: "Savannah", lat: 32.080898, lng: -81.091202, note: "Visited"},
    {name: "Virginia", lat: 37.431572, lng: -78.656891, note: "Visited"},
    {name: "Las Vegas", lat: 36.169941, lng: -115.139832, note: "Visited"},
    {name: "Singapore", lat: 1.352083, lng: 103.819839, note: "Visited"},
    {name: "Tokyo", lat: 35.689487, lng: 139.691711, note: "Visited"},
    {name: "Taibei", lat: 23.295410, lng: 120.276398, note: "Visited"},
    {name: "Hongkong", lat: 22.396427, lng: 114.109497, note: "Visited"},
    {name: "Tibet", lat: 30.153360, lng: 88.787865, note: "Visited"},
    {name: "Wulumuqi", lat: 43.825592, lng: 87.616852, note: "Visited"},
    {name: "Kunming", lat: 24.880095, lng: 102.832893, note: "Visited"},
    {name: "Xi'an", lat: 34.341576, lng: 108.939774, note: "Visited"},

    
    

    
    
    // Add more cities below - you can find coordinates at https://www.latlong.net/
    // {name: "City Name", lat: 0.0000, lng: 0.0000, note: "Your note"},
];

// Define custom icon colors
var blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

var greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Add markers for each city
cities.forEach(function(city) {
    // Choose icon color based on note (you can customize this logic)
    var icon = blueIcon;
    if (city.note && city.note.toLowerCase().includes('living')) {
        icon = redIcon;
    } else if (city.note && city.note.toLowerCase().includes('hometown')) {
        icon = greenIcon;
    }
    
    var marker = L.marker([city.lat, city.lng], {icon: icon}).addTo(map);
    
    // Create popup content
    var popupContent = '<div style="color: #000;"><b>' + city.name + '</b>';
    if (city.note) {
        popupContent += '<br>' + city.note;
    }
    popupContent += '</div>';
    
    marker.bindPopup(popupContent);
});

// Optional: Add a legend
var legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = '<div style="background: white; padding: 10px; border-radius: 5px; box-shadow: 0 0 15px rgba(0,0,0,0.2); color: #000;">' +
                   '<h4 style="margin: 0 0 10px 0; color: #000;">Legend</h4>' +
                   '<div style="color: #000;"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" style="width: 15px; height: 25px; vertical-align: middle;"> Currently Living</div>' +
                   '<div style="color: #000;"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png" style="width: 15px; height: 25px; vertical-align: middle;"> Hometown</div>' +
                   '<div style="color: #000;"><img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png" style="width: 15px; height: 25px; vertical-align: middle;"> Visited</div>' +
                   '</div>';
    return div;
};
legend.addTo(map);
</script>

---

<!-- Section 3: Additional Life Content -->
## 📸 Memories & Experiences

Share your favorite memories, hobbies, or experiences here. This could include:
- Photos from your travels
- Life milestones
- Hobbies and interests
- Personal achievements
- Or anything else you'd like to share!

---

## How to Add Cities

To add more cities to the map, edit the `cities` array in the code above. Here's the format:

```javascript
{name: "City Name", lat: latitude, lng: longitude, note: "Your note"},
```

**Finding Coordinates:**
- Visit [LatLong.net](https://www.latlong.net/)
- Search for your city
- Copy the latitude and longitude

**Icon Colors:**
- 🔴 Red: Cities where you're currently living (notes containing "living")
- 🟢 Green: Hometown (notes containing "hometown")
- 🔵 Blue: All other cities (visited, studied, etc.)
