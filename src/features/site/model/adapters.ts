import { formatDateTime } from '@/shared/lib/format-date';
import type {
  ErrorLocation,
  ItemCreateBodyMap,
  ItemFormMap,
  ItemKind,
  ItemPatchBodyMap,
  ServiceDto,
  ServiceForm,
  Settings,
  SettingsForm,
  SettingsPatch,
  SiteDraft,
  SiteDto,
  SiteTab,
  SiteView,
  TeamDto,
  TeamForm,
  TimelineDto,
  TimelineForm,
} from './types';

export function toSiteView(dto: SiteDto): SiteView {
  return {
    draft: dto.draft,
    published: dto.published,
    dirty: dto.dirty,
    draftHash: dto.draftHash,
    settingsVersion: dto.version,
    publicationNumber: dto.publicationNumber,
    savedLabel:
      !dto.dirty && dto.publishedAt ? `Đã lưu · ${formatDateTime(dto.publishedAt)}` : null,
    canRevert: dto.published !== null,
    warnings: new Map(dto.warnings.map((w) => [w.path, w.message])),
  };
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every(
    (k) =>
      k in b && deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}

/** Fields of `form` that differ from `initial`. */
function changedFields<T extends object>(form: T, initial: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(form) as (keyof T)[]) {
    if (!deepEqual(form[key], initial[key])) out[key] = form[key];
  }
  return out;
}

const STATS_CELLS = 4;

export function settingsToForm(settings: Settings): SettingsForm {
  const stats = settings.stats.slice(0, STATS_CELLS).map((s) => ({ v: s.v, l: s.l }));
  while (stats.length < STATS_CELLS) stats.push({ v: '', l: '' });
  return { ...settings, stats };
}

export function settingsPatch(
  form: SettingsForm,
  initial: SettingsForm,
  version: number,
): SettingsPatch | null {
  const changed = changedFields(form, initial);
  if (Object.keys(changed).length === 0) return null;
  return { version, ...changed };
}

export const SETTINGS_TAB: Record<keyof Settings, 'general' | 'home'> = {
  name: 'general',
  phone: 'general',
  email: 'general',
  hours: 'general',
  address: 'general',
  seoTitle: 'general',
  seoDesc: 'general',
  showEyebrow: 'home',
  eyebrow: 'home',
  h1a: 'home',
  h1b: 'home',
  h1hl: 'home',
  lead: 'home',
  cta1: 'home',
  cta2: 'home',
  stats: 'home',
};

export function serviceToForm(s: ServiceDto): ServiceForm {
  return {
    icon: s.icon,
    title: s.title,
    desc: s.desc,
    time: s.time,
    visible: s.visible,
    position: s.position,
  };
}

export function teamToForm(m: TeamDto): TeamForm {
  return {
    name: m.name,
    role: m.role,
    since: m.since,
    bio: m.bio,
    visible: m.visible,
    photoMediaId: m.photoMediaId,
    position: m.position,
  };
}

export function timelineToForm(t: TimelineDto): TimelineForm {
  return {
    year: t.year,
    title: t.title,
    body: t.body,
    media: t.media,
    quote: { text: t.quote.text, by: t.quote.by, role: t.quote.role },
    photos: t.photos.map((p) => ({ mediaId: p.mediaId, label: p.label })),
  };
}

export function newItemForm<K extends ItemKind>(kind: K, currentYear: number): ItemFormMap[K];
export function newItemForm(kind: ItemKind, currentYear: number): ItemFormMap[ItemKind] {
  switch (kind) {
    case 'services':
      return { icon: 'laptop', title: '', desc: '', time: '', visible: true };
    case 'team':
      return {
        name: '',
        role: '',
        since: currentYear,
        bio: '',
        visible: true,
        photoMediaId: null,
      };
    case 'timeline':
      return {
        year: String(currentYear),
        title: '',
        body: '',
        media: 'none',
        photos: [],
        quote: { text: '', by: '', role: '' },
      };
  }
}

/** `position` argument wins over `form.position`; omitted from the body when neither is set. */
export function itemCreateBody<K extends ItemKind>(
  kind: K,
  form: ItemFormMap[K],
  position?: number,
): ItemCreateBodyMap[K];
export function itemCreateBody(
  kind: ItemKind,
  form: ItemFormMap[ItemKind],
  position?: number,
): ItemCreateBodyMap[ItemKind] {
  if (kind === 'timeline') {
    const { year, title, body, media, quote, photos } = form as TimelineForm;
    return { year, title, body, media, quote, photos };
  }
  const { position: formPosition, ...rest } = form as ServiceForm | TeamForm;
  const pos = position ?? formPosition;
  return pos === undefined ? rest : { ...rest, position: pos };
}

export function itemPatchBody<K extends ItemKind>(
  kind: K,
  form: ItemFormMap[K],
  initial: ItemFormMap[K],
  version: number,
): ItemPatchBodyMap[K];
export function itemPatchBody(
  _kind: ItemKind,
  form: ItemFormMap[ItemKind],
  initial: ItemFormMap[ItemKind],
  version: number,
): ItemPatchBodyMap[ItemKind] {
  return { version, ...changedFields(form, initial) };
}

const ITEM_TAB: Record<ItemKind, SiteTab> = {
  services: 'services',
  team: 'team',
  timeline: 'journey',
};

export function isItemKind(s: string): s is ItemKind {
  return s === 'services' || s === 'team' || s === 'timeline';
}

function isSettingsKey(s: string): s is keyof Settings {
  return Object.hasOwn(SETTINGS_TAB, s);
}

/** Maps a server error/warning path such as `services.2.title` to where it lives in the UI. */
export function locateError(path: string, draft: SiteDraft): ErrorLocation | null {
  const [head, ...rest] = path.split('.');
  if (head === undefined || rest.length === 0) return null;
  if (head === 'settings') {
    const [key] = rest;
    if (key === undefined || !isSettingsKey(key)) return null;
    return { tab: SETTINGS_TAB[key], field: rest.join('.') };
  }
  if (!isItemKind(head)) return null;
  const [index, ...fieldParts] = rest;
  if (index === undefined || !/^\d+$/.test(index) || fieldParts.length === 0) return null;
  const item = draft[head][Number(index)];
  if (!item) return null;
  return { tab: ITEM_TAB[head], kind: head, itemId: item.id, field: fieldParts.join('.') };
}
