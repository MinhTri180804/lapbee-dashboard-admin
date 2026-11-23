import { useCallback, useEffect, useState } from 'react';
import { on } from '@/shared/api/events';
import { isReauthPending, rejectReauth, resolveReauth } from '@/shared/api/reauth-coordinator';
import { messageFor } from '@/shared/form/error-messages';
import { isProblem } from '@/shared/api/errors';
import { sessionStore } from '@/shared/auth/session-store';
import { Button, Dialog, PasswordField } from '@/shared/ui';
import { useReauth } from '../hooks/use-reauth';

const REQUIRED = 'Không được để trống.';

/** Step-up prompt (spec §4.4, §8.3). Mounted once; opens on `reauth:required`. */
export function ReauthDialog() {
  // The form mounts only while open, so a closed dialog adds no labelled field to the page.
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const reauth = useReauth();
  const { reset } = reauth;

  const close = useCallback(() => {
    setOpen(false);
    setPassword('');
    setError(null);
    reset();
  }, [reset]);

  useEffect(
    () =>
      on('reauth:required', () => {
        setOpen(true);
      }),
    [],
  );

  // The bridge rejects the prompt too, but returns early when already anonymous; never rely on it.
  useEffect(
    () =>
      on('session:expired', () => {
        if (isReauthPending()) rejectReauth();
        close();
      }),
    [close],
  );

  // Any path to anonymous (logout, revoking the current session, the bridge) ends the prompt.
  useEffect(
    () =>
      sessionStore.subscribe(() => {
        if (sessionStore.get().status !== 'anonymous') return;
        if (isReauthPending()) rejectReauth();
        close();
      }),
    [close],
  );

  // Never leave a request hanging if the app unmounts mid-prompt.
  useEffect(
    () => () => {
      if (isReauthPending()) rejectReauth();
    },
    [],
  );

  const cancel = () => {
    rejectReauth();
    close();
  };

  const submit = () => {
    if (password === '') {
      setError(REQUIRED);
      return;
    }
    setError(null);
    reauth.mutate(password, {
      onSuccess: () => {
        resolveReauth();
        close();
      },
      onError: (e) => {
        setError(isProblem(e, 'INVALID_CREDENTIALS') ? 'Mật khẩu không đúng.' : messageFor(e));
      },
    });
  };

  return (
    <Dialog
      open={open}
      title="Xác nhận mật khẩu"
      onClose={cancel}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={cancel}>
            Huỷ
          </Button>
          <Button type="submit" form="reauth-form" variant="primary" loading={reauth.isPending}>
            Xác nhận
          </Button>
        </>
      }
    >
      {open ? (
        <form
          id="reauth-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <p>Thao tác này cần nhập lại mật khẩu.</p>
          <PasswordField
            label="Mật khẩu"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            {...(error === null ? {} : { error })}
          />
        </form>
      ) : null}
    </Dialog>
  );
}
