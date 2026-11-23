import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  PageHeader,
  PasswordField,
  Spinner,
  TextField,
  ToastProvider,
  useToast,
  Wordmark,
} from '.';
import type { ToastInput } from '.';

describe('TextField', () => {
  it('links the error to the input', () => {
    render(<TextField label="Email" error="Email không hợp lệ" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const id = input.getAttribute('aria-describedby');
    expect(id).toBeTruthy();
    expect(document.getElementById(id as string)).toHaveTextContent('Email không hợp lệ');
  });

  it('has no aria-invalid without error', () => {
    render(<TextField label="Email" hint="Dùng email công ty" />);
    const input = screen.getByLabelText('Email');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(screen.getByText('Dùng email công ty')).toBeInTheDocument();
  });

  it('works with react-hook-form register', async () => {
    const onValue = vi.fn();
    function Form() {
      const { register, handleSubmit } = useForm<{ email: string }>();
      return (
        <form
          onSubmit={(e) => {
            void handleSubmit((v) => {
              onValue(v.email);
            })(e);
          }}
        >
          <TextField label="Email" {...register('email')} />
          <button type="submit">Gửi</button>
        </form>
      );
    }
    const user = userEvent.setup();
    render(<Form />);
    await user.type(screen.getByLabelText('Email'), 'a@b.vn');
    await user.click(screen.getByRole('button', { name: 'Gửi' }));
    expect(onValue).toHaveBeenCalledWith('a@b.vn');
  });
});

describe('PasswordField', () => {
  it('toggles visibility', async () => {
    const user = userEvent.setup();
    render(<PasswordField label="Mật khẩu" />);
    const input = screen.getByLabelText('Mật khẩu');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Hiện mật khẩu' }));
    expect(input).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Ẩn mật khẩu' }));
    expect(input).toHaveAttribute('type', 'password');
  });
});

describe('Button', () => {
  it('is disabled and busy while loading', () => {
    render(
      <Button variant="primary" loading>
        Lưu
      </Button>,
    );
    const btn = screen.getByRole('button', { name: /Lưu/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  it('calls onClick', async () => {
    const onClick = vi.fn();
    render(
      <Button variant="secondary" onClick={onClick}>
        Hủy
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('Dialog', () => {
  it('calls onClose on Escape and restores focus', async () => {
    const onClose = vi.fn();
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button
            onClick={() => {
              setOpen(true);
            }}
          >
            Mở
          </button>
          <Dialog
            open={open}
            title="Xác nhận"
            onClose={() => {
              onClose();
              setOpen(false);
            }}
          >
            nội dung
          </Dialog>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Host />);
    const opener = screen.getByRole('button', { name: 'Mở' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: 'Xác nhận' });
    expect(dialog).toHaveAttribute('open');
    // jsdom does not emit `cancel` for Escape; dispatch it as browsers do.
    act(() => {
      dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    expect(onClose).toHaveBeenCalledOnce();
    expect(opener).toHaveFocus();
  });

  it('calls onClose when the native close event fires while open is still true', () => {
    const onClose = vi.fn();
    render(
      <Dialog open title="T" onClose={onClose}>
        x
      </Dialog>,
    );
    act(() => {
      screen.getByRole('dialog', { name: 'T' }).dispatchEvent(new Event('close'));
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes and restores focus when open flips to false externally', async () => {
    const onClose = vi.fn();
    function Host() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button
            onClick={() => {
              setOpen(true);
            }}
          >
            Mở
          </button>
          <button
            onClick={() => {
              setOpen(false);
            }}
          >
            Đóng ngoài
          </button>
          <Dialog open={open} title="T" onClose={onClose}>
            x
          </Dialog>
        </>
      );
    }
    const user = userEvent.setup();
    render(<Host />);
    const opener = screen.getByRole('button', { name: 'Mở' });
    await user.click(opener);
    expect(screen.getByRole('dialog', { name: 'T' })).toHaveAttribute('open');
    act(() => {
      screen.getByRole('button', { name: 'Đóng ngoài', hidden: true }).click();
    });
    expect(screen.queryByRole('dialog', { name: 'T' })).toBeNull();
    expect(opener).toHaveFocus();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose once on cancel, not again from the native close event', async () => {
    const onClose = vi.fn();
    function Host() {
      const [open, setOpen] = useState(true);
      return (
        <Dialog
          open={open}
          title="T"
          onClose={() => {
            onClose();
            setOpen(false);
          }}
        >
          x
        </Dialog>
      );
    }
    render(<Host />);
    act(() => {
      screen
        .getByRole('dialog', { name: 'T' })
        .dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'T' })).toBeNull();
    });
    await new Promise((r) => setTimeout(r, 20));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders footer', () => {
    render(
      <Dialog open title="T" onClose={() => undefined} footer={<button>Đồng ý</button>}>
        x
      </Dialog>,
    );
    expect(screen.getByRole('button', { name: 'Đồng ý' })).toBeInTheDocument();
  });
});

describe('Toast', () => {
  it('shows then auto-dismisses after 2800 ms', () => {
    vi.useFakeTimers();
    try {
      function Trigger() {
        const toast = useToast();
        return (
          <button
            onClick={() => {
              toast.show({ kind: 'success', title: 'Đã lưu' });
            }}
          >
            go
          </button>
        );
      }
      render(
        <ToastProvider>
          <Trigger />
        </ToastProvider>,
      );
      act(() => {
        screen.getByRole('button', { name: 'go' }).click();
      });
      expect(screen.getByRole('status')).toHaveTextContent('Đã lưu');
      act(() => {
        vi.advanceTimersByTime(2799);
      });
      expect(screen.getByRole('status')).toHaveTextContent('Đã lưu');
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole('status')).not.toHaveTextContent('Đã lưu');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('Toast actions', () => {
  function Trigger({ input }: { input: ToastInput }) {
    const toast = useToast();
    return (
      <button
        onClick={() => {
          toast.show(input);
        }}
      >
        go
      </button>
    );
  }

  it('a sticky toast stays until its action runs, then closes', () => {
    vi.useFakeTimers();
    try {
      const onClick = vi.fn();
      render(
        <ToastProvider>
          <Trigger
            input={{
              kind: 'info',
              title: 'Phiên sắp hết hạn',
              duration: null,
              action: { label: 'Tiếp tục', onClick },
            }}
          />
        </ToastProvider>,
      );
      act(() => {
        screen.getByRole('button', { name: 'go' }).click();
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(screen.getByRole('status')).toHaveTextContent('Phiên sắp hết hạn');
      act(() => {
        screen.getByRole('button', { name: 'Tiếp tục' }).click();
      });
      expect(onClick).toHaveBeenCalledOnce();
      expect(screen.getByRole('status')).not.toHaveTextContent('Phiên sắp hết hạn');
    } finally {
      vi.useRealTimers();
    }
  });

  it('a sticky toast has an Đóng button that closes it without the action', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger
          input={{
            kind: 'info',
            title: 'Phiên sắp hết hạn',
            duration: null,
            action: { label: 'Tiếp tục', onClick },
          }}
        />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'go' }));
    await user.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.getByRole('status')).not.toHaveTextContent('Phiên sắp hết hạn');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('honours a custom duration', () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <Trigger input={{ kind: 'success', title: 'Đã lưu', duration: 500 }} />
        </ToastProvider>,
      );
      act(() => {
        screen.getByRole('button', { name: 'go' }).click();
      });
      expect(screen.queryByRole('button', { name: 'Đóng' })).toBeNull();
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(screen.getByRole('status')).not.toHaveTextContent('Đã lưu');
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('DataTable', () => {
  const columns = [
    { key: 'name', header: 'Tên', render: (r: { id: string; name: string }) => r.name },
  ];
  it('shows empty text when no rows', () => {
    render(<DataTable columns={columns} rows={[]} rowKey={(r) => r.id} empty="Chưa có dữ liệu" />);
    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
  });
  it('renders rows', () => {
    render(
      <DataTable
        columns={columns}
        rows={[{ id: '1', name: 'An' }]}
        rowKey={(r) => r.id}
        empty="x"
      />,
    );
    expect(screen.getByRole('columnheader', { name: 'Tên' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'An' })).toBeInTheDocument();
  });
});

describe('misc', () => {
  it('PageHeader renders eyebrow, title, description, actions', () => {
    render(
      <PageHeader
        eyebrow="Tài khoản"
        title="Hồ sơ"
        description="Mô tả"
        actions={<button>Sửa</button>}
      />,
    );
    expect(screen.getByText('Tài khoản')).toHaveClass('lb-label');
    expect(screen.getByRole('heading', { level: 1, name: 'Hồ sơ' })).toBeInTheDocument();
    expect(screen.getByText('Mô tả')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sửa' })).toBeInTheDocument();
  });
  it('Spinner has accessible label', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Đang tải' })).toBeInTheDocument();
  });
  it('Wordmark shows text', () => {
    render(<Wordmark />);
    expect(screen.getByText('BEE')).toBeInTheDocument();
  });
  it('Badge renders children', () => {
    render(<Badge tone="success">Hoạt động</Badge>);
    expect(screen.getByText('Hoạt động')).toBeInTheDocument();
  });
});
