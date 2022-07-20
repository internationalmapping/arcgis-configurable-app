import { tsx } from 'esri/widgets/support/widget';
tsx;
import ApplicationBase from 'TemplatesCommonLib/baseClasses/ApplicationBase';
import _applicationBaseConfig from './config/applicationBase';
import _applicationConfig from './config/application';
import i18n from './nls/resources';
import { createMapFromItem, createView, getConfigViewProperties, getItemTitle } from 'TemplatesCommonLib/baseClasses/support/itemUtils';
import PortalItem from 'esri/portal/PortalItem';
import { setPageTitle } from 'TemplatesCommonLib/baseClasses/support/domHelper';

import './main.css';
import '@esri/configurable-app-components/Screenshot/Screenshot/css/Screenshot.css';

import '@esri/calcite-components';
import '@esri/calcite-components/dist/components/calcite-alert';

import { setAssetPath } from '@esri/calcite-components/dist/components';
import App from './widgets/App';
import { ApplicationItemData } from './interfaces';
import { ApplicationConfig } from 'TemplatesCommonLib/interfaces/applicationBase';
// CDN hosted assets
setAssetPath('https://unpkg.com/@esri/calcite-components/dist/calcite/assets');
// setAssetPath(window.location.href);

// init App
const app = new App({
    container: document.querySelector('.app.app--loading') as HTMLDivElement,
});

(async () => {
    // load config file
    const _config = (await (await fetch('./config.json')).json()) as Partial<ApplicationConfig>;

    // init ApplicationBase
    const applicationBase = new ApplicationBase({
        config: {
            // mix ./src/config/application.ts
            ..._applicationConfig,
            // with ./config.json
            ..._config,
        },
        // from ./src/config/applicationBase
        settings: _applicationBaseConfig,
    });

    // ApplicationBase load
    const { config, results } = await applicationBase.load();
    // current appid item
    const applicationItem: __esri.PortalItem | undefined = results.applicationItem?.value;
    // current app data, if present will have been mixed into config
    const applicationItemData: ApplicationItemData = results.applicationData?.value;
    const appProxies = applicationItem && applicationItem.applicationProxies ? applicationItem.applicationProxies : [];

    // webmap or webscene portal item
    let mapItem: __esri.PortalItem | undefined;
    if (applicationItem && applicationItemData) {
        mapItem = new PortalItem({
            id: applicationItemData.values.webscene || applicationItemData.values.webmap,
        });
        // load the webmap or webscene item
        await mapItem.load();
    } else {
        // Find valid WebMaps and WebScene items
        const { webMapItems = [], webSceneItems = [] } = results;
        const validItems = webMapItems.concat(webSceneItems).map((response) => response.value);
        if (validItems.length > 1) console.warn('More than one valid item found in config.');
        // Using the first map or scene, but may not always be valid for your application
        mapItem = validItems.length ? validItems[0] : undefined;
    }

    // console.debug({ applicationBase, app, applicationItem, applicationItemData, mapItem });

    // if no valid webmap or webscene
    if (!mapItem) throw new Error('Could not load an item to display.');
    // update page title to map title
    config.title = config.title || getItemTitle(mapItem);
    setPageTitle(config.title);

    // create map and view
    const defaultViewProperties = getConfigViewProperties(config);
    const map = await createMapFromItem({ item: mapItem, appProxies });
    const view = await createView({
        ...defaultViewProperties,
        map,
    });
    // app init complete
    app.set({
        status: 'complete',
        view,
    });
    // wait for view to be ready
    await view.when();
})().catch(function (error) {
    console.error(error);
    let message = error instanceof Error ? error.message : error.toString();
    // unauthorized message for configurable apps
    if (error === 'identity-manager:not-authorized') message = i18n.root.licenseError.message.toString();
    // app init complete
    app.set({
        status: 'complete',
        errors: [message],
    });
});
