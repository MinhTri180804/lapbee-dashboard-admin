import { describe, expect, it } from 'vitest';
import { siteFixture } from '@/test/fixtures/site';
import {
  itemCreateBody,
  itemPatchBody,
  locateError,
  newItemForm,
  serviceToForm,
  settingsPatch,
  settingsToForm,
  SETTINGS_TAB,
  teamToForm,
  timelineToForm,
  toSiteView,
} from './adapters';
import { SERVICE_ICONS, type ServiceIcon } from './service-icons';
import { siteKeys } from './keys';
import type { SiteDto } from './types';

const dto: SiteDto = siteFixture;

describe('siteKeys', () => {
  it('builds stable keys', () => {
    expect(siteKeys.detail).toEqual(['site']);
    expect(siteKeys.publications(2)).toEqual(['site', 'publications', 2]);
  });
});

describe('toSiteView', () => {
  it('maps a dirty draft', () => {
    const view = toSiteView(dto);
    expect(view.draft).toBe(dto.draft);
    expect(view.published).toBe(dto.published);
    expect(view.dirty).toBe(true);
    expect(view.draftHash).toBe('hash-draft-0001');
    expect(view.settingsVersion).toBe(7);
    expect(view.publicationNumber).toBe(3);
    expect(view.savedLabel).toBeNull();
    expect(view.canRevert).toBe(true);
    expect(view.warnings.get('services.0.desc')).toBe('Mô tả nên ngắn hơn 120 ký tự');
  });

  it('labels a clean draft with the publication time', () => {
    const view = toSiteView({ ...dto, dirty: false });
    expect(view.savedLabel).toBe('Đã lưu · 10:30 · 20.11.2026');
  });

  it('has no label when never published, and cannot revert', () => {
    const view = toSiteView({
      ...dto,
      dirty: false,
      published: null,
      publishedAt: null,
      publicationNumber: null,
    });
    expect(view.savedLabel).toBeNull();
    expect(view.canRevert).toBe(false);
  });
});

describe('settings form', () => {
  it('pads stats to four cells', () => {
    const form = settingsToForm({ ...dto.draft.settings, stats: [{ v: '1', l: 'a' }] });
    expect(form.stats).toEqual([
      { v: '1', l: 'a' },
      { v: '', l: '' },
      { v: '', l: '' },
      { v: '', l: '' },
    ]);
  });

  it('returns null when nothing changed', () => {
    const initial = settingsToForm(dto.draft.settings);
    expect(settingsPatch(settingsToForm(dto.draft.settings), initial, 7)).toBeNull();
  });

  it('sends only the changed field plus version', () => {
    const initial = settingsToForm(dto.draft.settings);
    expect(settingsPatch({ ...initial, phone: '1900 5678' }, initial, 7)).toEqual({
      version: 7,
      phone: '1900 5678',
    });
  });

  it('sends the whole stats array when one cell changes', () => {
    const initial = settingsToForm(dto.draft.settings);
    const stats = initial.stats.map((s, i) => (i === 1 ? { ...s, v: '6000' } : s));
    const patch = settingsPatch({ ...initial, stats }, initial, 7);
    expect(patch).toEqual({ version: 7, stats });
    expect(patch?.stats).toHaveLength(4);
  });
});

describe('SETTINGS_TAB', () => {
  it('routes general fields and home fields', () => {
    for (const k of [
      'name',
      'phone',
      'email',
      'hours',
      'address',
      'seoTitle',
      'seoDesc',
    ] as const) {
      expect(SETTINGS_TAB[k]).toBe('general');
    }
    for (const k of [
      'showEyebrow',
      'eyebrow',
      'h1a',
      'h1b',
      'h1hl',
      'lead',
      'cta1',
      'cta2',
      'stats',
    ] as const) {
      expect(SETTINGS_TAB[k]).toBe('home');
    }
  });
});

describe('item forms', () => {
  it('maps dto to forms', () => {
    const [service] = dto.draft.services;
    const [member] = dto.draft.team;
    const [moment] = dto.draft.timeline;
    expect(serviceToForm(service!)).toEqual({
      icon: 'laptop',
      title: 'Sửa laptop',
      desc: 'Thay màn hình, bàn phím',
      time: '1-2 ngày',
      visible: true,
      position: 0,
    });
    expect(teamToForm(member!)).toEqual({
      name: 'Minh',
      role: 'Kỹ thuật viên',
      since: 2015,
      bio: 'Chuyên mainboard',
      visible: true,
      photoMediaId: '5b1f0c2e-7a4d-4e6b-8c3a-1d2e3f4a5b6c',
      position: 0,
    });
    expect(timelineToForm(moment!)).toEqual({
      year: '2015',
      title: 'Mở cửa hàng đầu tiên',
      body: 'Cửa hàng nhỏ ở Quận 1',
      media: 'photos',
      quote: { text: '', by: '', role: '' },
      photos: [
        { mediaId: '5b1f0c2e-7a4d-4e6b-8c3a-1d2e3f4a5b6c', label: 'Cửa hàng' },
        { mediaId: null, label: 'Đội ngũ' },
      ],
    });
  });

  it('builds blank forms with prototype defaults', () => {
    expect(newItemForm('services', 2026)).toEqual({
      icon: 'laptop',
      title: '',
      desc: '',
      time: '',
      visible: true,
    });
    expect(newItemForm('team', 2026)).toEqual({
      name: '',
      role: '',
      since: 2026,
      bio: '',
      visible: true,
      photoMediaId: null,
    });
    expect(newItemForm('timeline', 2026)).toEqual({
      year: '2026',
      title: '',
      body: '',
      media: 'none',
      photos: [],
      quote: { text: '', by: '', role: '' },
    });
  });
});

describe('itemCreateBody', () => {
  it('omits position unless given', () => {
    const form = newItemForm('services', 2026);
    expect(itemCreateBody('services', { ...form, title: 'Mới' })).toEqual({
      icon: 'laptop',
      title: 'Mới',
      desc: '',
      time: '',
      visible: true,
    });
    expect(itemCreateBody('services', { ...form, title: 'Mới' }, 3)).toMatchObject({ position: 3 });
  });

  it('builds team and timeline bodies', () => {
    expect(itemCreateBody('team', { ...newItemForm('team', 2026), name: 'An' }, 0)).toEqual({
      name: 'An',
      role: '',
      since: 2026,
      bio: '',
      visible: true,
      photoMediaId: null,
      position: 0,
    });
    expect(itemCreateBody('timeline', { ...newItemForm('timeline', 2026), title: 'Mốc' })).toEqual({
      year: '2026',
      title: 'Mốc',
      body: '',
      media: 'none',
      quote: { text: '', by: '', role: '' },
      photos: [],
    });
  });
});

describe('itemPatchBody', () => {
  it('sends only changed fields plus version', () => {
    const initial = serviceToForm(dto.draft.services[0]!);
    expect(itemPatchBody('services', { ...initial, title: 'Sửa máy' }, initial, 2)).toEqual({
      version: 2,
      title: 'Sửa máy',
    });
  });

  it('sends position only when it changed', () => {
    const initial = teamToForm(dto.draft.team[0]!);
    expect(itemPatchBody('team', { ...initial, position: 1 }, initial, 3)).toEqual({
      version: 3,
      position: 1,
    });
    expect(itemPatchBody('team', { ...initial, bio: 'x' }, initial, 3)).toEqual({
      version: 3,
      bio: 'x',
    });
  });

  it('returns only version when nothing changed', () => {
    const initial = timelineToForm(dto.draft.timeline[1]!);
    expect(itemPatchBody('timeline', timelineToForm(dto.draft.timeline[1]!), initial, 4)).toEqual({
      version: 4,
    });
  });

  it('compares nested values deeply', () => {
    const initial = timelineToForm(dto.draft.timeline[1]!);
    const quote = { ...initial.quote, by: 'Mai' };
    expect(itemPatchBody('timeline', { ...initial, quote }, initial, 4)).toEqual({
      version: 4,
      quote,
    });
  });
});

describe('locateError', () => {
  const draft = dto.draft;

  it('maps settings paths to tabs', () => {
    expect(locateError('settings.seoTitle', draft)).toEqual({ tab: 'general', field: 'seoTitle' });
    expect(locateError('settings.h1a', draft)).toEqual({ tab: 'home', field: 'h1a' });
    expect(locateError('settings.stats.0.v', draft)).toEqual({ tab: 'home', field: 'stats.0.v' });
  });

  it('maps item paths to the item', () => {
    expect(locateError('services.1.title', draft)).toEqual({
      tab: 'services',
      kind: 'services',
      itemId: draft.services[1]!.id,
      field: 'title',
    });
    expect(locateError('team.0.name', draft)).toEqual({
      tab: 'team',
      kind: 'team',
      itemId: draft.team[0]!.id,
      field: 'name',
    });
    expect(locateError('timeline.0.quote.text', draft)).toEqual({
      tab: 'journey',
      kind: 'timeline',
      itemId: draft.timeline[0]!.id,
      field: 'quote.text',
    });
  });

  it('returns null for unknown or out-of-range paths', () => {
    expect(locateError('settings.nope', draft)).toBeNull();
    expect(locateError('services.9.title', draft)).toBeNull();
    expect(locateError('services.x.title', draft)).toBeNull();
    expect(locateError('services.0', draft)).toBeNull();
    expect(locateError('other.0.a', draft)).toBeNull();
    expect(locateError('', draft)).toBeNull();
  });
});

describe('SERVICE_ICONS', () => {
  // Exhaustive: a schema icon missing here (or an extra one) fails typecheck.
  const schemaIcons: Record<ServiceIcon, true> = {
    laptop: true,
    apple: true,
    monitor: true,
    'hard-drive': true,
    cpu: true,
    'building-2': true,
    smartphone: true,
    tablet: true,
    printer: true,
    keyboard: true,
    'battery-charging': true,
    server: true,
    wifi: true,
    mouse: true,
    'shield-check': true,
    wrench: true,
  };

  it('lists every schema icon in schema order', () => {
    expect(SERVICE_ICONS.map((i) => i.name)).toEqual(Object.keys(schemaIcons));
  });

  it('has a component for each icon', () => {
    for (const { Icon } of SERVICE_ICONS) expect(Icon).toBeTruthy();
  });
});
