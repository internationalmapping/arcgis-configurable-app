# International Mapping - ArcGIS Configurable App

This application is written in [TypeScript](http://www.typescriptlang.org/) and utilizes
[@esri/templates-common-library](https://github.com/Esri/templates-common-library), 
[@esri/configurable-app-components](https://github.com/Esri/configurable-app-components), [@esri/calcite-components](https://github.com/Esri/calcite-components) 
to create an out-of-the-box configurable mapping application.

## Developer quickstart

* `npm start`  - Development server. Outputs to `./output/dev`
* `npm run build` - Production build. Outputs to `./output/dist`
* `npm run lint` - Lint and fix code.

## Configuration

Most `ApplicationConfig` properties can be passed in as URL parameters.

```typescript
interface ApplicationConfig {
    appid?: string;
    center?: string;
    components?: string;
    embed?: boolean;
    extent?: string;
    find?: string;
    group?: string | string[];
    helperServices?: any;
    level?: string;
    marker?: string;
    oauthappid?: string;
    portalUrl?: string;
    proxyUrl?: string;
    title?: string;
    viewpoint?: string;
    webmap?: string | string[];
    webscene?: string | string[];
    [propName: string]: any;
}
```

```typescript
interface ApplicationBaseSettings {
    localStorage?: {
        fetch?: boolean;
    };
    group?: {
        default?: string;
        itemParams?: PortalQueryParams;
        fetchItems?: boolean;
        fetchInfo?: boolean;
        fetchMultiple?: boolean;
    };
    portal?: {
        fetch?: boolean;
    };
    urlParams?: string[];
    webMap?: {
        default?: string;
        fetch?: boolean;
        fetchMultiple?: boolean;
    };
    webScene?: {
        default?: string;
        fetch?: boolean;
        fetchMultiple?: boolean;
    };
}
```

# Deployment to Portal (ArcGIS Online)

This setup is compatible with both [ArcGIS Online](https://www.arcgis.com/) and [Portal for ArcGIS](https://enterprise.arcgis.com/en/portal/latest/administer/windows/what-is-portal-for-arcgis-.htm).

The following directions are using the [ArcGIS REST API](http://resources.arcgis.com/en/help/arcgis-rest-api%20%20/index.html) but you can also do each of these steps in the Portal user interface.

Before you attempt to deploy to Portal you should already have the application hosted on a web server. The location of where you've hosted the built application will be referred to as `{appURL}`.

You will need an [access token](https://developers.arcgis.com/rest/users-groups-and-items/authentication.htm#ESRI_SECTION2_DF50EDF3738343FA8E309D317F7C6CEA) to make each request. We will refer to the base Portal as `{portalURL}` and the access token as `{token}`. If you are using ArcGIS Online, your `{portalURL}` is: https://www.arcgis.com

### Create template item

ESRI Documentation: [Add your template to the Portal](https://enterprise.arcgis.com/en/portal/latest/use/create-app-templates.htm#ESRI_SECTION1_FBEEDC333D2A4765BA3F807B50AD558A) or [Add your template to ArcGIS Online](https://doc.arcgis.com/en/arcgis-online/create-maps/create-app-templates.htm#ESRI_SECTION1_FBEEDC333D2A4765BA3F807B50AD558A), [Create a configuration file
](https://doc.arcgis.com/en/arcgis-online/create-maps/create-app-templates.htm#ESRI_SECTION2_242BA51358AB45879C77C17EE9B1473A)

There will only ever be one of these per organization. This item will be re-used by child applications. The template item holds the "configuration settings" which will control what settings each deployed application will have such as webmap/webscene, theming/colors, etc. This configuration exists on the "data" attribute of the item in Portal

*Notice:* The `url` of this item is required, but irrelevant. The `data` field is the JSON configuration of the item. You can set this when you create the item or simply update the JSON configuration in Portal after you've created the item.

We will refer to this item as `{templateItem}`.

[ArcGIS REST API: Add item](https://developers.arcgis.com/rest/users-groups-and-items/add-item.htm)

`https://{portalURL}/sharing/rest/content/users/{username}/{folderId}/addItem`

```
{
  "title": "WebScene App",
  "type": "Web Mapping Application",
  "typeKeywords": "Web Map, Map, Online Map, Mapping Site, JavaScript, Configurable",
  "thumbnailURL": "https://static.arcgis.com/images/webapp.png",
  "url": "{appURL}",
  "tags": "ArcGIS web application template, express setup, instant apps, instant mapping apps, 4.x, 3Dscene"
  "data": "{SEE FILE ./src/config/applicationConfig.json}"
  "f": "json",
  "token": "{token}"
}
```

```
{
  "success":true,
  "id":"{templateItem}",
  "folder": "{folderId}"
}
```

#### Register template item app id

And you'll need to register this app to get an OAuth2 app id, client id, and client secret. The `{appURL}` in this instance is very important since it is used for authentication against Portal. Any URL the application will be accessed (public or private) needs to be added to Redirect URI's. This is easy to do in Portal.

[ArcGIS REST API: Register App](https://developers.arcgis.com/rest/users-groups-and-items/register-app.htm)

`https://{portalURL}/sharing/rest/oauth2/registerApp`

```
{
  "itemId": "{templateItem}",
  "appType": "browser",
  "redirect_uris": ["{appURL}"]
  "f": "json",
  "token": "{token}"
}
```

```
{
  "itemId":"{templateItem}",
  "client_id":"{clientId}",
  "client_secret":"{clientSecret}",
  "appType":"browser",
  "redirect_uris":["{appURL}"],
  "registered":1607445762000,
  "modified":1607445762000,
  "apnsProdCert":null,
  "apnsSandboxCert":null,
  "gcmApiKey":null,
  "httpReferrers":[],
  "privileges":[]
}
```

#### Create template group for organization

Once the template exists, it needs to be shared into the organization's template group. We will refer to this group as `{templateGroupId}`.

By default the template group is defined by ESRI and is not a group you can share items into. In this case a group must be created and the organization's settings updated. If the organization already has a custom template group configured, this step can be skipped.


***_TO BE CONTINUED..._***

#### Share template item

Share the `{templateItem}` with your organization and your `{templateGroupId}`.

[ArcGIS REST API: Share Item (as item owner)](https://developers.arcgis.com/rest/users-groups-and-items/share-item-as-item-owner-.htm)

`https://{portalURL}/sharing/rest/content/items/{templateItem}/share`
```
{
  "items": "{templateItem}",
  "org": true,
  "groups": "{templateGroupId}",
  "f": "json",
  "token": "{token}"
}
```


## Deploy an application

Deploying a new application with the template item is very easy and can be done within Portal.

#### Create application item

[ArcGIS REST API: Add item](https://developers.arcgis.com/rest/users-groups-and-items/add-item.htm)

`https://{portalURL}/sharing/rest/content/users/{username}/{folderId}/addItem`

```
{
  "title": "My New App",
  "type": "Web Mapping Application",
  "typeKeywords": "Configurable, Map, Mapping Site, Online Map, Web Map",
  "thumbnailURL": "https://static.arcgis.com/images/webapp.png",
  "url": "{appURL}?appid=",
  "tags": "Development",
  "data": {
    "source": "{templateItem}",
    "values": {
      "theme": "white",
      "labelLayers": [],
      "slides": []
    }
  },
  "f": "json",
  "token": "{token}"
}
```

```
{
  "success":true,
  "id":"{appId}",
  "folder": "{folderId}"
}
```

#### Update application item URL

After the item has been created you need to update the `url` of the item to include the newly created `{appId}`.

[ArcGIS REST API: Update item](https://developers.arcgis.com/rest/users-groups-and-items/update-item.htm)

`https://{portalURL}/sharing/rest/content/users/{username}/items/{appId}/update`

```
{
  "url": "{appURL}?appid={appId}"
  "f": "json",
  "token": "{token}"
}
```

Remember `{appURL}` is where you've hosted the built version of the application. To view your application visit:

`https://{appURL}/?appId={appId}`

#### Share application item

You'll want this item to be shared with your organization, or share it publicly if it will be a publicly accessible application.

[ArcGIS REST API: Share Item (as item owner)](https://developers.arcgis.com/rest/users-groups-and-items/share-item-as-item-owner-.htm)

`https://{portalURL}/sharing/rest/content/items/{templateItem}/share`

```
{
  "items": "{appId}",
  "org": true,
  "f": "json",
  "token": "{token}"
}
```

### You're done!

You can configure your new app at:

`https://{portalURL}/home/webmap/configureApp.html?folderid={folderId}&appid={appId}`

## Resources

- [@esri/templates-common-library/baseClasses/support/configParser](https://github.com/Esri/templates-common-library/blob/master/src/baseClasses/support/configParser.MD)
- https://github.com/Esri/templates-common-library/blob/master/src/baseClasses/support/urlUtils.MD
- https://github.com/Esri/templates-common-library/blob/master/src/baseClasses/support/itemUtils.MD
- https://github.com/Esri/templates-common-library/blob/master/src/baseClasses/support/domHelper.MD
- [@esri/templates-common-library/a11yUtils.ts - setupLiveRegion](https://github.com/Esri/templates-common-library/blob/master/src/structuralFunctionality/a11yUtils.ts#L11)
- [@esri/templates-common-library](https://www.npmjs.com/package/templates-common-library)
- [@esri/application-base-js: ApplicationBase](https://github.com/Esri/application-base-js)
- [Esri/configurable-app-examples-4x-js](https://github.com/Esri/configurable-app-examples-4x-js)
- https://developers.arcgis.com/javascript/latest/sample-code/widgets-custom-widget/#register-the-message-bundle

#### Portal for ArcGIS

- [Portal for ArcGIS: Add configurable parameters to templates](https://enterprise.arcgis.com/en/portal/latest/use/configurable-templates.htm)

#### ArcGIS Online

- [Create configurable app templates](https://doc.arcgis.com/en/arcgis-online/create-maps/create-app-templates.htm)
- [Create configurable app templates](https://enterprise.arcgis.com/en/portal/latest/use/create-app-templates.htm)
- [Register the app template/Add your template to ArcGIS Online](https://doc.arcgis.com/en/arcgis-online/create-maps/create-app-templates.htm#ESRI_SECTION1_FBEEDC333D2A4765BA3F807B50AD558A)
- [Making your app configurable](https://doc.arcgis.com/en/arcgis-online/create-maps/create-app-templates.htm#ESRI_SECTION1_B35BA8F76A7745DFA99BBCC8F2A54680)
- [Example configuration file](https://doc.arcgis.com/en/arcgis-online/create-maps/create-app-templates.htm#ESRI_SECTION2_7AD94063904D416997176D17BB89447D)
- [Associate the configuration information with the template item](https://doc.arcgis.com/en/arcgis-online/create-maps/create-app-templates.htm#ESRI_SECTION2_7AD94063904D416997176D17BB89447D)
- [Creating and publishing your own configurable apps](https://www.esri.com/content/dam/esrisites/en-us/about/events/media/UC-2019/technical-workshops/tw-5833-1125.pdf)
- [Configure search in apps](https://doc.arcgis.com/en/arcgis-online/create-maps/configure-search-in-apps.htm)

#### Deprecated Configurable Apps

- https://github.com/Esri/templates-common-library/blob/master/src/baseClasses/CompatibilityChecker.ts#L8
- https://github.com/Esri/application-base-js
- https://github.com/Esri/configurable-app-examples-4x-js
- https://github.com/Esri/filter-gallery
- https://github.com/Esri/zone-lookup
- https://github.com/Esri/interactive-legend
- https://github.com/Esri/media-template
- https://github.com/Esri/attachment-viewer
- https://github.com/Esri/minimalist
- https://github.com/Esri/minimalist/blob/master/minimalist/app/utils/esriWidgetUtils.ts
