import { ScrollRestoration, type Location } from 'react-router';

/**
 * Keyed by pathname: a new page (e.g. a list row's item page) opens at the top and back
 * restores the list's position, while `?tab=` switches on the same page keep their position.
 */
function byPathname(location: Location): string {
  return location.pathname;
}

/** Window scroll restoration for the data router; render once in the root layout route. */
export function AppScrollRestoration() {
  return <ScrollRestoration getKey={byPathname} />;
}
