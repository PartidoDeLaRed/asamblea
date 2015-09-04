import 'native-promise-only';
import page from 'page';
import timeago from 'democracyos-timeago';
import 'democracyos-timeago/node_modules/moment/locale/es';
import debug from 'debug';
import config from '../config/config';

import '../translations/translations.js';

/**
 * Enable client-side debug messages
 */

import '../debug';

/**
 * Initialize debug for DemocracyOS
 */

let log = debug('democraycos:boot');

/**
 * Mount applications.
 */

import '../analytics';
import '../body-classes/body.js';
import '../content-lock/locker.js';
import '../header/header.js';
import '../help/help.js';
import '../signin/signin.js';
import '../signup/signup.js';
import '../forgot/forgot.js';
import '../logout/logout.js';
import '../auth-facebook/auth-facebook';
import '../settings/settings.js';
import '../admin/admin.js';
import '../homepage/homepage.js';
import '../newsfeed/newsfeed.js';
import '../forum/forum.js';
import '../topic/topic.js';
// require('proposal');
// require('404');

/**
 * Init `timeago` component with parameter locale
 */

timeago('.ago', { lang: config.locale, interval: 1000 });

/**
 * Render not found page.
 */

page('*', () => log('Should render Not found.'));

/**
 * Init page.js
 */

page();

if (config.googleAnalyticsTrackingId) {
	require('democracyos-ga')(config.googleAnalyticsTrackingId);
}
