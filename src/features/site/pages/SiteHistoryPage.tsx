import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useCan } from '@/shared/auth/permissions';
import { formatDateTime } from '@/shared/lib/format-date';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  PageHeader,
  Spinner,
  useToast,
  type DataTableColumn,
} from '@/shared/ui';
import { usePublications } from '../hooks/use-publications';
import { useRestorePublication } from '../hooks/use-restore-publication';
import { useSite } from '../hooks/use-site';
import { useUserNames } from '../hooks/use-user-names';
import styles from './SiteHistoryPage.module.css';

const NO_RESTORE_TITLE = 'Bạn không có quyền khôi phục bản nháp';

type PublicationDto = NonNullable<ReturnType<typeof usePublications>['data']>['items'][number];

export function SiteHistoryPage() {
  const [params, setParams] = useSearchParams();
  const parsed = Number.parseInt(params.get('page') ?? '1', 10);
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  const list = usePublications(page);
  const site = useSite();
  const names = useUserNames();
  const canUpdate = useCan('site.update');
  const restore = useRestorePublication();
  const navigate = useNavigate();
  const toast = useToast();
  const [target, setTarget] = useState<PublicationDto | null>(null);

  const currentNumber = site.data?.publicationNumber ?? null;
  const items = list.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((list.data?.total ?? 0) / (list.data?.perPage ?? 20)));

  const columns: DataTableColumn<PublicationDto>[] = [
    {
      key: 'number',
      header: 'Bản',
      mono: true,
      render: (p) => (
        <>
          {'#' + String(p.number)}{' '}
          {p.number === currentNumber && <Badge tone="brand">Hiện hành</Badge>}
        </>
      ),
    },
    { key: 'at', header: 'Xuất bản lúc', mono: true, render: (p) => formatDateTime(p.publishedAt) },
    {
      key: 'by',
      header: 'Người xuất bản',
      render: (p) => (p.publishedBy ? (names.get(p.publishedBy) ?? '—') : '—'),
    },
  ];
  columns.push({
    key: 'actions',
    header: '',
    render: (p) =>
      p.number === currentNumber ? null : (
        <Button
          variant="secondary"
          disabled={!canUpdate}
          title={canUpdate ? undefined : NO_RESTORE_TITLE}
          onClick={() => {
            setTarget(p);
          }}
        >
          Khôi phục về nháp
        </Button>
      ),
  });

  function goTo(next: number) {
    setParams(next <= 1 ? {} : { page: String(next) });
  }

  function confirm() {
    if (!target || !site.data) return;
    restore.mutate(
      { id: target.id, draftHash: site.data.draftHash },
      {
        onSuccess: () => {
          setTarget(null);
          toast.show({ kind: 'success', title: 'Đã khôi phục về nháp' });
          void navigate('/site?tab=general');
        },
        onError: () => {
          setTarget(null);
        },
      },
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Thông tin website · Lịch sử" title="Lịch sử xuất bản" />
      {list.isPending ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(p) => p.id}
            empty="Chưa xuất bản lần nào."
          />
          <div className={styles.pager}>
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => {
                goTo(page - 1);
              }}
            >
              Trang trước
            </Button>
            <span className={styles.pageInfo}>
              {'Trang ' + String(page) + ' / ' + String(totalPages)}
            </span>
            <Button
              variant="secondary"
              disabled={page >= totalPages}
              onClick={() => {
                goTo(page + 1);
              }}
            >
              Trang sau
            </Button>
          </div>
        </>
      )}
      <ConfirmDialog
        open={target !== null}
        title={'Khôi phục bản #' + String(target?.number ?? '') + ' về nháp?'}
        body="Bản nháp hiện tại sẽ bị thay bằng nội dung của bản này. Website chưa thay đổi cho tới khi bạn xuất bản."
        confirmLabel="Khôi phục"
        busy={restore.isPending}
        onConfirm={confirm}
        onCancel={() => {
          setTarget(null);
        }}
      />
    </div>
  );
}
