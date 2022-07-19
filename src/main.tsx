import ApplicationBase from 'TemplatesCommonLib/baseClasses/ApplicationBase';
import applicationBaseConfig from './config/applicationBase';
import applicationConfig from './config/application';
import i18n from './nls/resources';
import { createMapFromItem, createView, getConfigViewProperties, getItemTitle } from 'TemplatesCommonLib/baseClasses/support/itemUtils';
import PortalItem from 'esri/portal/PortalItem';
import { setPageTitle } from 'TemplatesCommonLib/baseClasses/support/domHelper';

import './main.css';
import '@esri/configurable-app-components/Screenshot/Screenshot/css/Screenshot.css';

import '@esri/calcite-components';
import '@esri/calcite-components/dist/components/calcite-button';

import { setAssetPath } from '@esri/calcite-components/dist/components';
// CDN hosted assets
setAssetPath('https://unpkg.com/@esri/calcite-components/dist/calcite/assets');
// setAssetPath(window.location.href);

export const applicationBase = new ApplicationBase({
    config: applicationConfig,
    settings: applicationBaseConfig,
});

const container = document.querySelector('.app.app--loading') as HTMLDivElement;

(async () => {
    await applicationBase.load();
    const { config, results } = applicationBase;
    const { webMapItems, webSceneItems } = results;

    const validItems = webMapItems.map((response) => response.value).concat(webSceneItems.map((response) => response.value));

    let item: __esri.PortalItem = validItems.length ? validItems[0] : undefined;
    if (!item && applicationBaseConfig.webMap.default) {
        item = new PortalItem({
            id: applicationBaseConfig.webMap.default,
        });
    }
    if (!item) {
        console.error('Could not load an item to display');
        return;
    }

    await item.load();

    config.title = config.title || getItemTitle(item);
    setPageTitle(config.title);

    const applicationItem: __esri.PortalItem = results.applicationItem.value;
    const appProxies = applicationItem && applicationItem.applicationProxies ? applicationItem.applicationProxies : [];

    // console.debug({ item, applicationItem, applicationBase, applicationConfig, applicationBaseConfig });

    const defaultViewProperties = getConfigViewProperties(config);
    const map = await createMapFromItem({ item, appProxies });
    const view = await createView({
        ...defaultViewProperties,
        container,
        map,
    });
    await view.when();
    container.classList.remove('app--loading');
})().catch(function (error) {
    if (error === 'identity-manager:not-authorized') {
        container.classList.remove('app--loading');
        container.classList.add('app--error');
        container.innerHTML = `<h1>${i18n.root.licenseError.title}</h1><p>${i18n.root.licenseError.message}</p>`;
    }
});
