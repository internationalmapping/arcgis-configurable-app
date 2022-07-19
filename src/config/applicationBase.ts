export default {
    environment: {
        isEsri: false,
        webTierSecurity: false,
    },
    localStorage: {
        fetch: true,
    },
    portal: {
        fetch: true,
        authMode: 'anonymous',
    },
    urlParams: [
        'appid',
        'basemapUrl',
        'basemapReferenceUrl',
        'center',
        'components',
        'embed',
        'extent',
        'find',
        'level',
        'marker',
        'oauthappid',
        'portalUrl',
        'viewpoint',
        'webscene',
    ],
    webMap: {
        default: '86265e5a4bbb4187a59719cf134e0018',
        fetch: true,
    },
};
