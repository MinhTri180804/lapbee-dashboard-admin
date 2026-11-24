import type { ReactElement } from 'react';
import { useBlocker } from 'react-router';
import { ConfirmDialog } from '@/shared/ui';

/**
 * Asks before leaving the current page while `isDirty` (P2-4). Only a change of pathname is
 * blocked, so switching tabs via the query string stays free (P2-3). Render the returned dialog.
 */
export function useUnsavedGuard(isDirty: boolean): ReactElement {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );
  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      title="Bỏ thay đổi chưa lưu?"
      body="Những gì bạn vừa gõ sẽ không được lưu."
      cancelLabel="Ở lại"
      confirmLabel="Bỏ thay đổi"
      tone="danger"
      onCancel={() => {
        if (blocker.state === 'blocked') blocker.reset();
      }}
      onConfirm={() => {
        if (blocker.state === 'blocked') blocker.proceed();
      }}
    />
  );
}
