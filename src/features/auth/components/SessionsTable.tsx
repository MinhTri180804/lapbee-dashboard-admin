import { Badge, Button, DataTable, Spinner, type DataTableColumn } from '@/shared/ui';
import { messageFor } from '@/shared/form/error-messages';
import { useRevokeSession } from '../hooks/use-revoke-session';
import { useSessions } from '../hooks/use-sessions';
import type { SessionRow } from '../model/adapters';
import styles from './SessionsTable.module.css';

export function SessionsTable() {
  const sessions = useSessions();
  const revoke = useRevokeSession();

  if (sessions.isPending) return <Spinner />;
  if (sessions.isError) {
    return (
      <p role="alert" className={styles.error}>
        {messageFor(sessions.error)}
      </p>
    );
  }

  const columns: DataTableColumn<SessionRow>[] = [
    {
      key: 'device',
      header: 'Thiết bị',
      render: (row) => (
        <span className={styles.device}>
          {row.device}
          {row.current ? <Badge tone="brand">Hiện tại</Badge> : null}
        </span>
      ),
    },
    { key: 'ip', header: 'IP', mono: true, render: (row) => row.ip },
    { key: 'createdAt', header: 'Bắt đầu', mono: true, render: (row) => row.createdAt },
    { key: 'lastSeenAt', header: 'Hoạt động cuối', mono: true, render: (row) => row.lastSeenAt },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.current ? null : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={revoke.isPending && revoke.variables.id === row.id}
            onClick={() => {
              revoke.mutate({ id: row.id, current: row.current });
            }}
          >
            Thu hồi
          </Button>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={sessions.data}
      rowKey={(row) => row.id}
      empty="Không có phiên nào."
    />
  );
}
