import {
  createFeatureSelect,
  IFeatureSelect
} from "@wsdot/arcgis-feature-select";
import { Polygon } from "esri/geometry";
import Extent from "esri/geometry/Extent";
import Graphic from "esri/Graphic";
import FeatureLayer from "esri/layers/FeatureLayer";
import EsriMap from "esri/Map";
import MapView from "esri/views/MapView";

// Create the map.
const map = new EsriMap({
  basemap: "streets-vector"
});

// Get the center of WA's extent.
const [xmin, ymin, xmax, ymax] = [-124.79, 45.54, -116.91, 49.05];
const waExtent = new Extent({ xmin, ymin, xmax, ymax });
const center = waExtent.center;

// Initialize the map view, setting the center to WA's center.
const view = new MapView({
  container: "mapView",
  map,
  zoom: 7,
  center
});

// Cast to IFeatureSelect, an extension of HTMLSelectElement.
// This allows the typescript transpiler to recognize the
// "featureselect" CustomEvent that is added by the
// createFeatureSelect function.
const featureSelect = document.createElement("select") as IFeatureSelect;

// Disable the select. Only reenable after it has been populated.
featureSelect.disabled = true;

// Add the select to the map.
view.ui.add(featureSelect, "top-right");

// Create the feature layer for querying.
const featureLayer = new FeatureLayer({
  url:
    "https://data.wsdot.wa.gov/arcgis/rest/services/Shared/CountyBoundaries/MapServer/0"
});

// Add an event listener for when the user selects a feature from
// the select element.
featureSelect.addEventListener("featureselect", ev => {
  const features = ev.detail;
  if (features && features.length > 0) {
    // The features in the event's detail are regular JavaScript objects. They must first
    // be converted to ArcGIS API objects before being used  by the map view.
    // Normally there will only be one graphic in the array, unless the select element
    // is set to allow the user to select multiple items at a time.
    const graphics = features.map(Graphic.fromJSON);
    // zoom to the selected features.
    view.goTo(graphics);
    // Open the view's popup.
    view.popup.open({
      features: graphics,
      title: "{JURLBL}",
      location: (graphics[0].geometry as Polygon).centroid
    });
  }
});

// Query the feature layer.
featureLayer
  .queryFeatures({
    where: "1=1", // Return all features
    // Greatly simplify the returned geometry since it will neither be displayed nor used for calculations.
    maxAllowableOffset: 100,
    returnGeometry: true,
    outFields: ["JURLBL"], // Specify output fields returned from query.
    orderByFields: ["JURLBL"] // Specify the sort order.
  })
  .then(featureSet => {
    featureSelect.disabled = false;
    // When the query completes, call the function to populate
    // the select and make it emit the "featureselect" custom event.
    createFeatureSelect(featureSelect, featureSet as any);
  });
