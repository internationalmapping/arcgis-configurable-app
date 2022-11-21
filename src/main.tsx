import { tsx } from 'esri/widgets/support/widget';
tsx;
import ApplicationBase from 'TemplatesCommonLib/baseClasses/ApplicationBase';
import _applicationBaseConfig from './config/applicationBase';
import _applicationConfig from './config/application';
import i18n from './t9n/en';
import { createMapFromItem, createView, getConfigViewProperties, getItemTitle } from 'TemplatesCommonLib/baseClasses/support/itemUtils';
import PortalItem from 'esri/portal/PortalItem';
import { setPageDirection, setPageLocale, setPageTitle } from 'TemplatesCommonLib/baseClasses/support/domHelper';

import './main.css';
import '@esri/configurable-app-components/Screenshot/Screenshot/css/Screenshot.css';

import '@esri/calcite-components';
import '@esri/calcite-components/dist/components/calcite-alert';

import { setAssetPath } from '@esri/calcite-components/dist/components';
import App from './widgets/App';
import { ApplicationItemData } from './interfaces';
import { ApplicationConfig } from 'TemplatesCommonLib/interfaces/applicationBase';
import { initLocale } from './lang';
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
    await applicationBase.load(null as any).catch((message) => {
        if (message === 'identity-manager:not-authorized') {
            document.body.classList.remove('configurable-application--loading');
            document.body.classList.add('app-error');
            (app.container as HTMLElement).innerHTML = `<h1>${i18n.root.licenseError.title}</h1><p>${i18n.root.licenseError.message}</p>`;
        }
    });

    initLocale();
    setPageLocale(applicationBase.locale);
    setPageDirection(applicationBase.direction);

    const { config, results } = applicationBase;
    // console.debug({ container, applicationBase, config, results });

    // current app data, if present will have been mixed into config
    const applicationItemData: ApplicationItemData = results.applicationData?.value;

    const item = new PortalItem({
        id: applicationItemData?.values?.map || applicationItemData?.values?.webscene || applicationItemData?.values?.webmap || applicationBase.settings.webMap?.default,
    });
    await item.load();
    config.title = config.title || getItemTitle(item);
    setPageTitle(config.title);

    // current appid item
    const applicationItem: __esri.PortalItem | undefined = results.applicationItem?.value;
    // const portalItemData: any = applicationBase.results.applicationData && applicationBase.results.applicationData.value.values;
    const appProxies = applicationItem && applicationItem.applicationProxies ? applicationItem.applicationProxies : [];

    // console.debug({ applicationBase, app, applicationItem, applicationItemData, mapItem });

    // create map and view
    const defaultViewProperties = getConfigViewProperties(config);
    const map = await createMapFromItem({ item, appProxies });
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
