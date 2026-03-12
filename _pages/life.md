---
layout: page
title: Life
permalink: /life/
description: Places I've been around the world
nav: true
nav_order: 7
---

<!-- Section 1: Life Moments Gallery -->
## ✨ Moments That Stay

<div class="row row-cols-1 row-cols-md-3 life-moments">
  <!-- Card 1 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/1.jpg" class="card-img-top" alt="Life moment 1" %}
      <div class="card-body">
        <p class="card-text">Home is wherever I’m with them — Dali, Yunnan.</p>
      </div>
    </div>
  </div>
  
  <!-- Card 2 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/2.jpg" class="card-img-top" alt="Life moment 2" %}
      <div class="card-body">
        <p class="card-text">Found geometry in Kunming.</p>
      </div>
    </div>
  </div>
  
  <!-- Card 3 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/3.jpg" class="card-img-top" alt="Life moment 3" %}
      <div class="card-body">
        <p class="card-text">A small bubble, a big memory - California</p>
      </div>
    </div>
  </div>
  
  <!-- Card 4 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/4.jpg" class="card-img-top" alt="Life moment 4" %}
      <div class="card-body">
        <p class="card-text">A joyful corner with <a href="https://weiyisongsoprano.github.io/" target="_blank">my love - Weiyi</a></p>
      </div>
    </div>
  </div>
  
  <!-- Card 5 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/5.jpg" class="card-img-top" alt="Life moment 5" %}
      <div class="card-body">
        <p class="card-text">The river whispering goodnight to Cincinnati.</p>
      </div>
    </div>
  </div>
  
  <!-- Card 6 -->
  <div class="col mb-4">
    <div class="card h-100 hoverable">
      {% include figure.liquid loading="eager" path="assets/img/life/6.jpg" class="card-img-top" alt="Life moment 6" %}
      <div class="card-body">
        <p class="card-text">Mount Rainier, twice!</p>
      </div>
    </div>
  </div>
</div>

---

<!-- Section 2: Word Cloud - What People Think of Me -->
## 💭 Impressions of Me

<style>
  .impression-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }

  .input-section {
    background: var(--global-bg-color);
    border: 2px solid var(--global-divider-color);
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 40px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .input-section h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: var(--global-theme-color);
  }

  .input-section p {
    margin-bottom: 20px;
    color: var(--global-text-color);
    opacity: 0.8;
  }

  .input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  #impressionInput {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid var(--global-divider-color);
    border-radius: 8px;
    font-size: 16px;
    background: var(--global-bg-color);
    color: var(--global-text-color);
    transition: border-color 0.3s;
  }

  #impressionInput:focus {
    outline: none;
    border-color: var(--global-theme-color);
  }

  #submitBtn {
    padding: 12px 30px;
    background: var(--global-theme-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
  }

  #submitBtn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  #submitBtn:active {
    transform: translateY(0);
  }

  .word-count {
    font-size: 14px;
    color: var(--global-text-color);
    opacity: 0.6;
    text-align: right;
  }

  .cloud-section {
    background: var(--global-bg-color);
    border: 2px solid var(--global-divider-color);
    border-radius: 12px;
    padding: 40px;
    min-height: 400px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .cloud-section h3 {
    text-align: center;
    margin-top: 0;
    margin-bottom: 30px;
    color: var(--global-theme-color);
  }

  #wordCloud {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 15px;
    min-height: 300px;
    padding: 20px;
  }

  .word-item {
    display: inline-block;
    padding: 8px 12px;
    margin: 5px;
    cursor: default;
    transition: all 0.3s;
    border-radius: 6px;
    background: var(--global-code-bg-color);
    color: var(--global-theme-color);
    font-weight: 600;
    line-height: 1.2;
  }

  .word-item:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .empty-state {
    text-align: center;
    color: var(--global-text-color);
    opacity: 0.5;
    padding: 60px 20px;
    font-size: 18px;
  }

  .stats-section {
    text-align: center;
    margin: 20px 0;
    padding: 15px;
    background: var(--global-code-bg-color);
    border-radius: 8px;
    font-size: 14px;
    color: var(--global-text-color);
  }

  .stats-section strong {
    color: var(--global-theme-color);
  }

  .note {
    margin-top: 20px;
    padding: 15px;
    background: var(--global-code-bg-color);
    border-left: 4px solid var(--global-theme-color);
    border-radius: 4px;
    font-size: 14px;
    color: var(--global-text-color);
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .input-group {
      flex-direction: column;
    }
    
    #submitBtn {
      width: 100%;
    }

    .cloud-section {
      padding: 20px;
    }
  }
</style>

<div class="impression-container">
  <div class="input-section">
    <h3>📝 What words or phrases come to mind when you think of me? Feel free to share your impression of me!</h3>
    
    <div class="input-group">
      <input 
        type="text" 
        id="impressionInput" 
        placeholder="Enter words or phrases (e.g., creative, innovative, helpful...)" 
        maxlength="100"
      />
      <button id="submitBtn">Add</button>
    </div>
    
    <div class="word-count">
      <span id="charCount">0</span> / 100 characters
    </div>

    <div class="note">
      💡 <strong>Tip:</strong> You can enter multiple words separated by commas, or submit one word at a time. If a word has more than one part (e.g., warm-smiling), connect the parts with a hyphen instead of a space.
    </div>
  </div>

  <div class="stats-section">
    <strong id="totalWords">0</strong> unique words · <strong id="totalSubmissions">0</strong> total submissions
  </div>

  <div class="cloud-section">
    <div id="wordCloud">
      <div class="empty-state">
        Be the first to share your impression! 🌟
      </div>
    </div>
  </div>
</div>

<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

<script src="{{ '/assets/js/word-cloud.js' | relative_url }}"></script>

---

<!-- Section 3: Travel Map -->
## 🌍 Places I've Visited

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>

<style>
  .map-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .map-wrapper {
    background: var(--global-bg-color);
    border: 2px solid var(--global-divider-color);
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  #map {
    height: 400px;
    width: 100%;
    border-radius: 8px;
    margin-bottom: 20px;
  }
</style>

<div class="map-container">
  <div class="map-wrapper">
    <div id="map"></div>
  </div>
</div>

<script>
// Initialize the map
var map = L.map('map').setView([20, 5], 1.8);

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
