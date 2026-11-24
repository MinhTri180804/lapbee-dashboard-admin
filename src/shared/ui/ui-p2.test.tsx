import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Card, CharCount, ConfirmDialog, Select, Switch, Tabs, tabPanelProps, TextArea } from '.';

const items = [
  { value: 'a', label: 'Một' },
  { value: 'b', label: 'Hai' },
  { value: 'c', label: 'Ba' },
];

describe('Tabs', () => {
  it('moves with arrow keys and calls onChange', async () => {
    const onChange = vi.fn();
    render(<Tabs label="Mục" idPrefix="t" items={items} value="a" onChange={onChange} />);
    expect(screen.getByRole('tablist', { name: 'Mục' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Một' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Hai' })).toHaveAttribute('aria-selected', 'false');
    screen.getByRole('tab', { name: 'Một' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('b');
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('a');
    await userEvent.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('c');
  });

  it('supports Home/End and roving tabIndex', async () => {
    const onChange = vi.fn();
    render(<Tabs label="Mục" idPrefix="t" items={items} value="b" onChange={onChange} />);
    expect(screen.getByRole('tab', { name: 'Hai' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Một' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'Ba' })).toHaveAttribute('tabindex', '-1');
    screen.getByRole('tab', { name: 'Hai' }).focus();
    await userEvent.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('c');
    await userEvent.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('pairs each tab with its panel', () => {
    render(
      <>
        <Tabs label="Mục" idPrefix="t" items={items} value="b" onChange={() => {}} />
        <div {...tabPanelProps('t', 'b')}>Nội dung</div>
      </>,
    );
    const tab = screen.getByRole('tab', { name: 'Hai' });
    const panel = screen.getByRole('tabpanel', { name: 'Hai' });
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });
});

describe('Switch', () => {
  it('toggles aria-checked on click', async () => {
    function Host() {
      const [on, setOn] = useState(false);
      return <Switch label="Hiển thị" checked={on} onChange={setOn} />;
    }
    render(<Host />);
    const sw = screen.getByRole('switch', { name: 'Hiển thị' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('hides the label visually but keeps the name', () => {
    render(<Switch label="Ẩn" hideLabel checked onChange={() => {}} />);
    expect(screen.getByRole('switch', { name: 'Ẩn' })).toBeInTheDocument();
  });
});

describe('Select', () => {
  it('calls onChange with the value', async () => {
    const onChange = vi.fn();
    render(<Select label="Loại" options={items} value="a" onChange={onChange} hint="Gợi ý" />);
    await userEvent.selectOptions(screen.getByLabelText('Loại'), 'b');
    expect(onChange).toHaveBeenCalledWith('b');
    expect(screen.getByText('Gợi ý')).toBeInTheDocument();
  });
});

describe('TextArea', () => {
  it('flags aria-invalid and links the error', () => {
    render(<TextArea label="Mô tả" error="Bắt buộc" rows={4} />);
    const ta = screen.getByLabelText('Mô tả');
    expect(ta).toHaveAttribute('aria-invalid', 'true');
    expect(ta).toHaveAttribute('rows', '4');
    expect(
      document.getElementById(ta.getAttribute('aria-describedby') as string),
    ).toHaveTextContent('Bắt buộc');
  });
});

describe('Card', () => {
  it('renders as a button and fires onClick', async () => {
    const onClick = vi.fn();
    render(
      <Card as="button" padding={16} onClick={onClick}>
        Nội dung
      </Card>,
    );
    const btn = screen.getByRole('button', { name: 'Nội dung' });
    expect(btn).toHaveAttribute('type', 'button');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('ConfirmDialog', () => {
  it('calls onConfirm and onCancel', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Xoá mục?"
        body="Không hoàn tác được."
        confirmLabel="Xoá"
        tone="danger"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables confirm while busy', () => {
    render(
      <ConfirmDialog
        open
        busy
        title="T"
        body="B"
        confirmLabel="Đồng ý"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Đồng ý' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Huỷ' })).toBeEnabled();
  });

  it('uses the danger variant for tone=danger and primary otherwise', () => {
    const { rerender } = render(
      <ConfirmDialog
        open
        tone="danger"
        title="T"
        body="B"
        confirmLabel="Xoá"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Xoá' }).className).toMatch(/danger/);
    rerender(
      <ConfirmDialog
        open
        title="T"
        body="B"
        confirmLabel="Xoá"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'Xoá' }).className).toMatch(/primary/);
  });
});

describe('CharCount', () => {
  it('shows the count and suffix', () => {
    render(<CharCount value="abc" max={60} suffix="gợi ý" />);
    expect(screen.getByText('3 / 60 ký tự · gợi ý')).toBeInTheDocument();
  });

  it('warns past max', () => {
    const { rerender } = render(<CharCount value="abc" max={60} />);
    const el = screen.getByText('3 / 60 ký tự');
    expect(el.className).not.toMatch(/over/);
    rerender(<CharCount value="abcd" max={3} />);
    expect(screen.getByText('4 / 3 ký tự').className).toMatch(/over/);
  });
});
