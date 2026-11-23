import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { on } from '@/shared/api/events';
import { Button, Dialog } from '@/shared/ui';

type Keys = readonly (readonly unknown[])[];

/** Version-conflict prompt (spec §8.4). Mounted once; opens on `conflict`. */
export function ConflictDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [invalidates, setInvalidates] = useState<Keys>([]);

  useEffect(
    () =>
      on('conflict', (e) => {
        setInvalidates(e.invalidates);
        setOpen(true);
      }),
    [],
  );

  const close = () => {
    setOpen(false);
  };

  const reload = () => {
    for (const queryKey of invalidates) {
      void queryClient.invalidateQueries({ queryKey });
    }
    close();
  };

  return (
    <Dialog
      open={open}
      title="Dữ liệu đã thay đổi ở nơi khác"
      onClose={close}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={close}>
            Để sau
          </Button>
          <Button type="button" variant="primary" onClick={reload}>
            Tải lại
          </Button>
        </>
      }
    >
      <p>
        Có người vừa sửa mục này. Tải lại để xem bản mới nhất; nội dung bạn đang gõ chưa được lưu.
      </p>
    </Dialog>
  );
}
