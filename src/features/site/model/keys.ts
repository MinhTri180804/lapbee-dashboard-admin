export const siteKeys = {
  detail: ['site'] as const,
  publications: (page: number) => ['site', 'publications', page] as const,
};
