import { ApplicationConfig } from 'TemplatesCommonLib/interfaces/applicationBase';

export default {
    title: undefined,
    portalUrl: 'https://www.arcgis.com',
    webmap: 'default',
    // webscene: 'default',
    oauthappid: undefined,
    proxyUrl: undefined,
    units: undefined,
    helperServices: {
        geometry: {
            url: undefined,
        },
        printTask: {
            url: 'https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
        },
        elevationSync: {
            url: undefined,
        },

        geocode: [
            {
                url: undefined,
            },
        ],
    },
} as Partial<ApplicationConfig>;
