import { useEffect, useState } from 'react';
import { on } from '@/shared/api/events';
import { isReauthPending, rejectReauth, resolveReauth } from '@/shared/api/reauth-coordinator';
import { messageFor } from '@/shared/form/error-messages';
import { isProblem } from '@/shared/api/errors';
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

  useEffect(
    () =>
      on('reauth:required', () => {
        setOpen(true);
      }),
    [],
  );

  // Never leave a request hanging if the app unmounts mid-prompt.
  useEffect(
    () => () => {
      if (isReauthPending()) rejectReauth();
    },
    [],
  );

  const close = () => {
    setOpen(false);
    setPassword('');
    setError(null);
    reset();
  };

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
