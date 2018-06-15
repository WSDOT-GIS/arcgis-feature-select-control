/**
 * Creates controls for selecting features.
 */
import {
  IFeature,
  IFeatureSet,
  IField,
  IGeometry
} from "@esri/arcgis-rest-common-types";

interface IAttributeList {
  [key: string]: any;
}

function getFirstStringField(attributes: IAttributeList | IField[]) {
  if (Array.isArray(attributes)) {
    for (const field of attributes) {
      if (field.type === "esriFieldTypeString") {
        return field.name;
      }
    }
  } else {
    for (const attribName in attributes) {
      if (attributes.hasOwnProperty(attribName)) {
        const value = attributes[attribName];
        if (typeof value === "string") {
          return attribName;
        }
      }
    }
  }
  throw new Error("Could not find string field or attribute.");
}

export interface IFeatureSelectEventMap extends HTMLElementEventMap {
  featureselect: CustomEvent<IFeature[]>;
}

export interface IFeatureSelect extends HTMLSelectElement {
  readonly selectedOptions: HTMLCollectionOf<IFeatureOptionElement>;
  addEventListener<K extends keyof IFeatureSelectEventMap>(
    type: K,
    listener: (this: IFeatureSelect, ev: IFeatureSelectEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof IFeatureSelectEventMap>(
    type: K,
    listener: (this: IFeatureSelect, ev: IFeatureSelectEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
}

function populateElementDataset<T extends HTMLElement>(
  element: T,
  feature: IFeature
) {
  const { geometry, attributes } = feature;
  element.dataset.geometry = JSON.stringify(geometry);
  element.dataset.attributes = JSON.stringify(attributes);
  return element;
}

export interface IFeatureDOMStringMap extends DOMStringMap {
  geometry?: string;
  attributes?: string;
}

export interface IFeatureOptionElement extends HTMLOptionElement {
  dataset: IFeatureDOMStringMap;
}

/**
 * Creates a select element for selecting features from a feature set.
 * @param featureSet - A feature set
 * @param labelField - The field of featureSet used for labelling the option corresponding to a feature.
 * If omitted, the feature set's "displayFieldName" property will be used.
 * If there is no "displayFieldName", then the first string attribute will be used.
 * @throws {TypeError} Throws an error if the displayFieldName cannot be determined and a labelField has
 * not been defined.
 */
export function createFeatureSelect(
  featureSet: IFeatureSet,
  labelField?: string
): IFeatureSelect {
  let { displayFieldName } = featureSet;
  const { features, fields } = featureSet;

  // Determine which field will be used to label the options.
  if (labelField) {
    displayFieldName = labelField;
  } else if (!displayFieldName) {
    displayFieldName = getFirstStringField(fields || features[0].attributes);
  }

  if (!displayFieldName) {
    throw new TypeError(
      "Could not determine display field name from feature set."
    );
  }

  const select = document.createElement("select") as IFeatureSelect;

  for (const feature of features) {
    const { attributes, geometry } = feature;
    const option = document.createElement("option");
    const label = attributes[displayFieldName];
    option.label = option.title = option.innerText = label;
    populateElementDataset(option, feature);
    select.appendChild(option);
  }

  select.addEventListener("select", () => {
    const { selectedOptions } = select;
    const detail = new Array<IFeature>();
    for (const option of selectedOptions) {
      const geometry = option.dataset.geometry
        ? (JSON.parse(option.dataset.geometry) as IGeometry)
        : null;
      const attributes = option.dataset.attributes
        ? (JSON.parse(option.dataset.attributes) as IAttributeList)
        : null;
      const feature: IFeature = {
        attributes: attributes || {},
        geometry: geometry || undefined
      };
      detail.push(feature);
    }

    const customEvent = new CustomEvent("featureselect", {
      detail
    });
    select.dispatchEvent(customEvent);
  });

  return select;
}
