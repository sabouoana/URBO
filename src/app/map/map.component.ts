import { Component, OnInit } from '@angular/core';
// import { AppServiceService } from './../app-service.service';
import * as mapboxgl from 'mapbox-gl';

import { environment } from './../../environments/environment';
import { ViewChild, ElementRef } from '@angular/core';
import { post, removeData } from 'jquery';
import { ThisReceiver } from '@angular/compiler';
import * as MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import * as MapboxDraw  from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';
import "core-js/stable";
import "regenerator-runtime/runtime";
import "@babel/polyfill";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],

})
export class MapComponent implements OnInit {
 
  style = 'mapbox://styles/sabouoana/ckpzs7a3d3ccp17lmnagghuo3';
  lat = 47.647439;
  lng = 23.558760;

 public ngOnInit(): void {
    
  let map:any = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 0, 
      center: [this.lng, this.lat],
      accessToken: environment.mapbox.accessToken,
  });


 
 
  
  //----------------------------------------------------------------------------------------------


  map.on('load', function() {
    // Add a geojson point source.
    // Heatmap layers also work with a vector tile source.
    map.addSource('earthquakes', {
        'type': 'geojson',
        'data': 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
    });

    map.addLayer({
            'id': 'earthquakes-heat',
            'type': 'heatmap',
            'source': 'earthquakes',
            'maxzoom': 9,
            'paint': {
                // Increase the heatmap weight based on frequency and property magnitude
                'heatmap-weight': [
                    'interpolate', ['linear'],
                    ['get', 'mag'],
                    0,
                    0,
                    6,
                    1
                ],
                // Increase the heatmap color weight weight by zoom level
                // heatmap-intensity is a multiplier on top of heatmap-weight
                'heatmap-intensity': [
                    'interpolate', ['linear'],
                    ['zoom'],
                    0,
                    1,
                    9,
                    3
                ],
                // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                // Begin color ramp at 0-stop with a 0-transparancy color
                // to create a blur-like effect.
                'heatmap-color': [
                    'interpolate', ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(33,102,172,0)',
                    0.2,
                    'rgb(103,169,207)',
                    0.4,
                    'rgb(209,229,240)',
                    0.6,
                    'rgb(253,219,199)',
                    0.8,
                    'rgb(239,138,98)',
                    1,
                    'rgb(178,24,43)'
                ],
                // Adjust the heatmap radius by zoom level
                'heatmap-radius': [
                    'interpolate', ['linear'],
                    ['zoom'],
                    0, 2,
                    9, 20
                ],
                // Transition from heatmap to circle layer by zoom level
                'heatmap-opacity': [
                    'interpolate', ['linear'],
                    ['zoom'],
                    7,
                    1,
                    9,
                    0
                ]
            }
        },
        'waterway-label'
    );

    map.addLayer({
            'id': 'earthquakes-point',
            'type': 'circle',
            'source': 'earthquakes',
            'minzoom': 7,
            'paint': {
                // Size circle radius by earthquake magnitude and zoom level
                'circle-radius': [
                    'interpolate', ['linear'],
                    ['zoom'],
                    7, ['interpolate', ['linear'],
                        ['get', 'mag'], 0, 1, 6, 4
                    ],
                    16, ['interpolate', ['linear'],
                        ['get', 'mag'], 1, 5, 6, 50
                    ]
                ],
                // Color circle by earthquake magnitude
                'circle-color': [
                    'interpolate', ['linear'],
                    ['get', 'mag'],
                    1,
                    'rgba(33,102,172,0)',
                    2,
                    'rgb(103,169,207)',
                    3,
                    'rgb(209,229,240)',
                    4,
                    'rgb(253,219,199)',
                    5,
                    'rgb(239,138,98)',
                    6,
                    'rgb(178,24,43)'
                ],
                'circle-stroke-color': 'white',
                'circle-stroke-width': 1,
                // Transition from heatmap to circle layer by zoom level
                'circle-opacity': [
                    'interpolate', ['linear'],
                    ['zoom'],
                    7,
                    0,
                    8,
                    1
                ]
            }
        },
        'waterway-label'
    );
});



  //------------------------------------------------------------------------------------------------------

  var layerList = document.getElementById('menu');
    var inputs = layerList!.getElementsByTagName('input');


    function switchLayer(layer: any) {
        var layerId = layer.target.id;
        map.setStyle(layerId);
    }

    for (var i = 0; i < inputs.length; i++) {
        inputs[i].onclick = switchLayer;
    }
// map.getCanvas().style.cursor = 'pointer'


var draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
      polygon: true,
      trash: true
  },
  defaultMode: 'draw_polygon'
});



//Get coordinates of the mouse pointer

let isClickedTreeBtn = false;
let isClickedParkBtn = false;
let isClickedReportBtn = false;

map.on('mousemove', function (e:any) {
  document.getElementById('info')!.innerHTML =

  JSON.stringify(e.point) +
  '<br />' +
  JSON.stringify(e.lngLat.wrap());
  });


// Add the control to the map.
map.addControl(
  new MapboxGeocoder({
  accessToken: environment.mapbox.accessToken
  })
  );

map.addControl(new mapboxgl.FullscreenControl());

map.addControl(
  new mapboxgl.GeolocateControl({
  positionOptions: {
  enableHighAccuracy: true
  },
  trackUserLocation: true
  })
  );


map.addControl(new mapboxgl.NavigationControl());
map.addControl(draw);
map.on('draw.create', updateArea);
map.on('draw.delete', updateArea);
map.on('draw.update', updateArea);



//---------------------------------------------------------------------------------


function updateArea(e:any) {
  var data = draw.getAll();
  var answer = document.getElementById('calculated-area');
  if (data.features.length > 0) {
      var area = turf.area(data);
      // restrict to area to 2 decimal points
      var rounded_area = Math.round(area * 100) / 100;
      answer!.innerHTML =
          '<span><strong>' +
          rounded_area +
          '</strong></span><br><span>metrii patrati</span>';
  } else {
      answer!.innerHTML = '';
      if (e.type !== 'draw.delete')
          alert('Use the draw tools to draw a polygon!');
  }
}

//---------------------------------------------------------------------------------

let element = document!.getElementById('listing-group');
element!.addEventListener('change', function (e:any) {
let handler = e.target.id;
if (e.target.checked) {
map[handler].enable();
} else {
map[handler].disable();
}
});


document.getElementById('treeBtn')!.onclick = function() {
  isClickedTreeBtn = true;
    map.on('dblclick', function(e:any) {
  if (isClickedTreeBtn) {
      
      let el = document.createElement('div');
      let pop = document.createElement('div');;
      const removeMarker = document.createElement('div');
      const saveDetails = document.createElement('div');
      const title = document.createElement('div');

      saveDetails.id = 'saveDetails';

      let inputDetails = document.createElement('div');
      

      removeMarker.innerHTML = "<button id='sendDetails'>Sterge</button>";
      saveDetails.innerHTML = "<button id='sendDetails'>Salveaza</button>";
      inputDetails.innerHTML = "<input id='markerInput'></input>";
      title.innerHTML="<h2 class='mt-2'>Details</h2>"

      el.id = 'tree';
      el.setAttribute('style', ' background-size: cover; width: 50px; height: 50px; border-radius: 50%; cursor: pointer;');
      el.style.backgroundImage = "url(../../assets/img/tree.png)";  
      console.log( JSON.stringify(e.lngLat.wrap()))
    
      pop.appendChild(title);
      pop.appendChild(inputDetails);
      pop.appendChild(removeMarker);
      pop.appendChild(saveDetails);

      el.appendChild(pop);

      saveDetails.addEventListener('click', (e) => {
        let x=(<HTMLInputElement>document.getElementById('markerInput')).value;
        console.log(x);
        const txtDetails = document.createElement('p');
        txtDetails.innerHTML=x;
        pop.appendChild(txtDetails);

        fetch('/saveDetails', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          popup: {
            txtDetails: x
          }
        })
      })
      });
      
      removeMarker.addEventListener('click', (e) => {
      el.remove();
      console.log('Marker was deleted');
      });

        let popup = new mapboxgl.Popup({ offset: 25, closeOnClick:true, })
        .setHTML("<h3><b>DETAILS</b></h3></br><button onclick='' id='deleteMarker'>Delete</button>")
        .setDOMContent(pop);
      
        new mapboxgl.Marker(el)
        .setLngLat([e.lngLat.lng, e.lngLat.lat])
        .setPopup(popup)
        .addTo(map);  
        
        
        fetch('/api/saveCoordinates', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
        },
        
        body: JSON.stringify({
          marker: {
            longitude: e.lngLat.lng,
            latitude: e.lngLat.lat,
            type: el.id
          }
        })
        
      })
    isClickedTreeBtn = false;
  }

    });
}​;​

// document.getElementById('sendDetails')!.onclick = function() {
//   let markerInp = (<HTMLInputElement>document.getElementById('markerInput')).value;
//     console.log(markerInp);
//   }

  document.getElementById('parkBtn')!.onclick = function() {
    isClickedParkBtn = true;
      map.on('dblclick', function(e:any) {
    if (isClickedParkBtn) {
        
        let el = document.createElement('div');
        let pop = document.createElement('div');;
        const removeMarker = document.createElement('div');
        const saveDetails = document.createElement('div');
        const title = document.createElement('div');
  
        saveDetails.id = 'saveDetails';
  
        let inputDetails = document.createElement('div');
        
  
        removeMarker.innerHTML = "<button id='sendDetails'>Sterge</button>";
        saveDetails.innerHTML = "<button id='sendDetails'>Salveaza</button>";
        inputDetails.innerHTML = "<input id='markerInput'></input>";
        title.innerHTML="<h2 class='mt-2'>Details</h2>"
  
        el.id = 'park';
        el.setAttribute('style', ' background-size: cover; width: 75px; height:75px; border-radius: 0%; cursor: pointer;');
        el.style.backgroundImage = "url(../../assets/img/parc4.png)";  
        console.log( JSON.stringify(e.lngLat.wrap()))
      
        pop.appendChild(title);
        pop.appendChild(inputDetails);
        pop.appendChild(removeMarker);
        pop.appendChild(saveDetails);
  
        el.appendChild(pop);
  
        saveDetails.addEventListener('click', (e) => {
          let x=(<HTMLInputElement>document.getElementById('markerInput')).value;
          console.log(x);
          const txtDetails = document.createElement('p');
          txtDetails.innerHTML=x;
          pop.appendChild(txtDetails);
  
          fetch('/saveDetails', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            popup: {
              txtDetails: x
            }
          })
        })
        });
        
        removeMarker.addEventListener('click', (e) => {
        el.remove();
        console.log('Marker was deleted');
        });
  
          let popup = new mapboxgl.Popup({ offset: 25, closeOnClick:true, })
          .setHTML("<h3><b>DETAILS</b></h3></br><button onclick='' id='deleteMarker'>Delete</button>")
          .setDOMContent(pop);
        
          new mapboxgl.Marker(el)
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setPopup(popup)
          .addTo(map);  
          
          
          fetch('/api/saveCoordinates', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
          },
          
          body: JSON.stringify({
            marker: {
              longitude: e.lngLat.lng,
              latitude: e.lngLat.lat,
              type: el.id
            }
          })
          
        })
        isClickedParkBtn = false;
    }
  
      });
  }​;​


  document.getElementById('reportBtn')!.onclick = function() {
    isClickedReportBtn = true;
      map.on('dblclick', function(e:any) {
    if (isClickedReportBtn) {
        
        let el = document.createElement('div');
        let pop = document.createElement('div');;
        const removeMarker = document.createElement('div');
        const saveDetails = document.createElement('div');
        const title = document.createElement('div');
  
        saveDetails.id = 'saveDetails';
  
        let inputDetails = document.createElement('div');
        
  
        removeMarker.innerHTML = "<button id='sendDetails'>Sterge</button>";
        saveDetails.innerHTML = "<button id='sendDetails'>Salveaza</button>";
        inputDetails.innerHTML = "<input id='markerInput'></input>";
        title.innerHTML="<h2 class='mt-2'>Details</h2>"
  
        el.id = 'report';
        el.setAttribute('style', ' background-size: cover; width: 75px; height:75px; border-radius: 0%; cursor: pointer;');
        el.style.backgroundImage = "url(../../assets/img/red-flag.png)";  
        console.log( JSON.stringify(e.lngLat.wrap()))
      
        pop.appendChild(title);
        pop.appendChild(inputDetails);
        pop.appendChild(removeMarker);
        pop.appendChild(saveDetails);
  
        el.appendChild(pop);
  
        saveDetails.addEventListener('click', (e) => {
          let x=(<HTMLInputElement>document.getElementById('markerInput')).value;
          console.log(x);
          const txtDetails = document.createElement('p');
          txtDetails.innerHTML=x;
          pop.appendChild(txtDetails);
  
          fetch('/saveDetails', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            popup: {
              txtDetails: x
            }
          })
        })
        });
        
        removeMarker.addEventListener('click', (e) => {
        el.remove();
        console.log('Marker was deleted');
        });
  
          let popup = new mapboxgl.Popup({ offset: 25, closeOnClick:true, })
          .setHTML("<h3><b>DETAILS</b></h3></br><button onclick='' id='deleteMarker'>Delete</button>")
          .setDOMContent(pop);
        
          new mapboxgl.Marker(el)
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setPopup(popup)
          .addTo(map);  
          
          
          fetch('/api/saveCoordinates', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
          },
          
          body: JSON.stringify({
            marker: {
              longitude: e.lngLat.lng,
              latitude: e.lngLat.lat,
              type: el.id
            }
          })
          
        })
        isClickedReportBtn = false;
    }
  
      });
  }​;​

 document.getElementById('reportBtn')!.onclick = function() {
    isClickedReportBtn = true;
      map.on('dblclick', function(e:any) {
    if (isClickedReportBtn) {
        
        let el = document.createElement('div');
        let pop = document.createElement('div');;
        const removeMarker = document.createElement('div');
        const saveDetails = document.createElement('div');
        const title = document.createElement('div');
  
        saveDetails.id = 'saveDetails';
  
        let inputDetails = document.createElement('div');
        
  
        removeMarker.innerHTML = "<button id='sendDetails'>Sterge</button>";
        saveDetails.innerHTML = "<button id='sendDetails'>Salveaza</button>";
        inputDetails.innerHTML = "<input id='markerInput'></input>";
        title.innerHTML="<h2 class='mt-2'>Details</h2>"
  
        el.id = 'report';
        el.setAttribute('style', ' background-size: cover; width: 75px; height:75px; border-radius: 0%; cursor: pointer;');
        el.style.backgroundImage = "url(../../assets/img/red-flag.png)";  
        console.log( JSON.stringify(e.lngLat.wrap()))
      
        pop.appendChild(title);
        pop.appendChild(inputDetails);
        pop.appendChild(removeMarker);
        pop.appendChild(saveDetails);
  
        el.appendChild(pop);
  
        saveDetails.addEventListener('click', (e) => {
          let x=(<HTMLInputElement>document.getElementById('markerInput')).value;
          console.log(x);
          const txtDetails = document.createElement('p');
          txtDetails.innerHTML=x;
          pop.appendChild(txtDetails);
  
          fetch('/saveDetails', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            popup: {
              txtDetails: x
            }
          })
        })
        });
        
        removeMarker.addEventListener('click', (e) => {
        el.remove();
        console.log('Marker was deleted');
        });
  
          let popup = new mapboxgl.Popup({ offset: 25, closeOnClick:true, })
          .setHTML("<h3><b>DETAILS</b></h3></br><button onclick='' id='deleteMarker'>Delete</button>")
          .setDOMContent(pop);
        
          new mapboxgl.Marker(el)
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .setPopup(popup)
          .addTo(map);  
          
          
          fetch('/api/saveCoordinates', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
          },
          
          body: JSON.stringify({
            marker: {
              longitude: e.lngLat.lng,
              latitude: e.lngLat.lat,
              type: el.id
            }
          })
          
        })
        isClickedReportBtn = false;
    }
  
      });
  }​;​

map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 }); 

// if(parkBtnClick){
//   map.on('dblclick', function(e) {
//     let el = document.createElement('div');
//     el.id = 'marker';
//     el.setAttribute('style', ' background-size: cover; width: 50px; height: 50px; border-radius: 50%; cursor: pointer;');
//     el.style.backgroundImage = "url(../../assets/img/park.png)";  
//     console.log( JSON.stringify(e.lngLat.wrap()))
  
  
  
//       let popup = new mapboxgl.Popup({ offset: 25, closeOnClick:true, })
//       .setHTML('<h3><b>DETAILS</b></h3><input></input>')
  
//       new mapboxgl.Marker(el)
//       .setLngLat([e.lngLat.lng, e.lngLat.lat])
//       .setPopup(popup)
//       .addTo(map);    
  
//   });
// }

  // Add map controls



 
  
    // map.addControl(
    //   new MapboxGeocoder({
    //   accessToken: mapboxgl.accessToken,
    //   mapboxgl: mapboxgl
    //   })
    //   );

  // getDataFromAPI() {
  //  this.requestService.GET<GetData>('login')
  //   .subscribe(response => {
  //     console.log(response.message);
  //     this.serverResponse = response.message;
  //   }, error => {
  //     console.error(error.message);
  //   });
  // }


 


}
}


function getElementById(arg0: string) {
  throw new Error('Function not implemented.');
}
// https://blog.mapbox.com/introducing-heatmaps-in-mapbox-gl-js-71355ada9e6c