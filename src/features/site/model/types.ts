import type { Body, Res } from '@/shared/api/types';

export type SiteDto = Res<'/admin/v1/site', 'get', 200>;
export type SiteDraft = SiteDto['draft'];
export type Settings = SiteDraft['settings'];
export type ServiceDto = SiteDraft['services'][number];
export type TeamDto = SiteDraft['team'][number];
export type TimelineDto = SiteDraft['timeline'][number];

export type ItemKind = 'services' | 'team' | 'timeline';
export type SiteTab = 'general' | 'home' | 'services' | 'team' | 'journey';

export type SettingsForm = Settings;

/** `position` is only set when editing an existing item. */
export type ServiceForm = Pick<ServiceDto, 'icon' | 'title' | 'desc' | 'time' | 'visible'> & {
  position?: number;
};
export type TeamForm = Pick<
  TeamDto,
  'name' | 'role' | 'since' | 'bio' | 'visible' | 'photoMediaId'
> & { position?: number };
export type TimelineForm = Pick<TimelineDto, 'year' | 'title' | 'body' | 'media' | 'quote'> & {
  photos: { mediaId: string | null; label: string }[];
};

export type ItemFormMap = {
  services: ServiceForm;
  team: TeamForm;
  timeline: TimelineForm;
};

export type ItemCreateBodyMap = {
  services: Body<'/admin/v1/site/services', 'post'>;
  team: Body<'/admin/v1/site/team', 'post'>;
  timeline: Body<'/admin/v1/site/timeline', 'post'>;
};

export type ItemPatchBodyMap = {
  services: Body<'/admin/v1/site/services/{id}', 'patch'>;
  team: Body<'/admin/v1/site/team/{id}', 'patch'>;
  timeline: Body<'/admin/v1/site/timeline/{id}', 'patch'>;
};

export type SettingsPatch = Body<'/admin/v1/site/settings', 'patch'>;

export type SiteView = {
  draft: SiteDto['draft'];
  published: SiteDto['published'];
  dirty: boolean;
  draftHash: string;
  settingsVersion: number;
  publicationNumber: number | null;
  savedLabel: string | null;
  canRevert: boolean;
  /** Warning path to message. */
  warnings: Map<string, string>;
};

export type ErrorLocation = {
  tab: SiteTab;
  itemId?: string;
  kind?: ItemKind;
  field: string;
};

/** URLs of the media chosen on an item page, by media id (for previews and thumbnails). */
export type MediaUrls = ReadonlyMap<string, { url: string; thumbUrl: string }>;
