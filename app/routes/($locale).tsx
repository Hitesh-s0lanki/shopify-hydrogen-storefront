import type {Route} from './+types/($locale)';
import {getLocaleFromRequest} from '~/lib/i18n';

export async function loader({params, request}: Route.LoaderArgs) {
  const i18n = getLocaleFromRequest(request);
  const {language, country} = i18n;

  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the locale URL param is defined, yet we still are still at the default locale
    // then the the locale param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  return null;
}
