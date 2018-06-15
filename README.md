# @wsdot/arcgis-feature-select

Creates an HTML select control for selecting [features].

[![npm](https://img.shields.io/npm/v/@wsdot/arcgis-feature-select.svg?style=flat-square)](https://www.npmjs.org/package/@wsdot/arcgis-feature-select)

## Installation

```console
npm install -S @wsdot/arcgis-feature-select
```

## Use

```typescript
import { createFeatureSelect } from "@wsdot/arcgis-feature-select";

// Query an ArcGIS feature or map service layer to get a feature set
// This example assumes you have done this and that variable is called
// featureSet

const select = createFeatureSelect(featureSet);

select.addEventListener("featureselect", event => {
    const features = event.detail;
    // features will be an array of IFeature objects. See https://esri.github.io/arcgis-rest-js/api/common-types/IFeature/
    // Do something with the features.
});
```

[features]:https://esri.github.io/arcgis-rest-js/api/common-types/IFeature/