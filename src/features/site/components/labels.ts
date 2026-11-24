import type { ItemKind, Settings, SiteTab } from '../model/types';

export const SITE_TABS: { value: SiteTab; label: string }[] = [
  { value: 'general', label: 'Thông tin chung' },
  { value: 'home', label: 'Trang chủ' },
  { value: 'services', label: 'Dịch vụ' },
  { value: 'team', label: 'Đội ngũ' },
  { value: 'journey', label: 'Hành trình' },
];

export const TAB_LABEL: Record<SiteTab, string> = Object.fromEntries(
  SITE_TABS.map((t) => [t.value, t.label]),
) as Record<SiteTab, string>;

export function isSiteTab(value: string | null): value is SiteTab {
  return SITE_TABS.some((t) => t.value === value);
}

export const SETTINGS_LABEL: Record<keyof Settings, string> = {
  name: 'Tên thương hiệu',
  phone: 'Hotline',
  email: 'Email',
  hours: 'Giờ làm việc',
  address: 'Địa chỉ',
  seoTitle: 'Tiêu đề trang',
  seoDesc: 'Mô tả',
  showEyebrow: 'Hiện dòng trạng thái nhận máy',
  eyebrow: 'Dòng trạng thái',
  h1a: 'Tiêu đề · dòng 1',
  h1b: 'Tiêu đề · dòng 2',
  h1hl: 'Từ tô vàng',
  lead: 'Đoạn giới thiệu',
  cta1: 'Nút chính',
  cta2: 'Nút phụ',
  stats: 'Dải số liệu',
};

export const NO_UPDATE_TITLE = 'Bạn không có quyền sửa website';
export const NO_PUBLISH_TITLE = 'Bạn không có quyền xuất bản website';

export type ItemMeta = {
  /** Site tab label, e.g. the back button. */
  section: string;
  /** Lower-case noun: "Thêm {noun}", "Đã xoá {noun}". */
  noun: string;
  tab: SiteTab;
  description: string;
  previewLabel: string;
};

export const ITEM_META: Record<ItemKind, ItemMeta> = {
  services: {
    section: 'Dịch vụ',
    noun: 'dịch vụ',
    tab: 'services',
    description: 'Thẻ dịch vụ hiển thị ở mục Dịch vụ trên trang chủ và trang Đặt lịch.',
    previewLabel: 'Xem trước · mục Dịch vụ, trang chủ',
  },
  team: {
    section: 'Đội ngũ',
    noun: 'thành viên',
    tab: 'team',
    description: 'Hồ sơ hiển thị trên trang Đội ngũ.',
    previewLabel: 'Xem trước · trang Đội ngũ',
  },
  timeline: {
    section: 'Hành trình',
    noun: 'mốc',
    tab: 'journey',
    description: 'Mốc hiển thị trên trang Hành trình, tự sắp xếp theo năm.',
    previewLabel: 'Xem trước · trang Hành trình',
  },
};

/** "Từ 2020 · 6 năm tại LAPBEE", or "thành viên mới" in the join year. */
export function sinceHint(since: number, currentYear: number): string {
  if (!Number.isFinite(since)) return '';
  const years = currentYear - since;
  return years > 0
    ? `Từ ${String(since)} · ${String(years)} năm tại LAPBEE`
    : `Từ ${String(since)} · thành viên mới`;
}
