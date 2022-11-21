import { registerMessageBundleLoader } from 'esri/intl';
export const languages = ['en'];
import en from './t9n/en';

export function initLocale() {
	const loader = {
		pattern: 'app',
		async fetchMessageBundle(bundleId: string, locale: string) {
			let messages = {};
            switch (locale) {
                default:
                case 'en':
                    messages = {
                        ...{
                        en: 'English',
                        es: 'Español',
                        }, ...en
                    };
                    break;
            }
			return messages;
		},
	};
	registerMessageBundleLoader(loader);
}