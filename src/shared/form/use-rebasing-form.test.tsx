import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { keepEdits, useRebasingForm, type Server } from './use-rebasing-form';

type Values = {
  phone: string;
  email: string;
  stats: { v: string; l: string }[];
};

const V7: Values = {
  phone: '1900 1234',
  email: 'hello@lapbee.test',
  stats: [
    { v: '12', l: 'năm' },
    { v: '5k', l: 'máy' },
  ],
};

/** `V7` with the email (and optionally a stat label) changed by someone else. */
function serverChange(email: string, l?: string): Values {
  return {
    ...V7,
    email,
    stats: V7.stats.map((c, i) => (i === 1 && l !== undefined ? { ...c, l } : { ...c })),
  };
}

type Props = { server: Server<Values> };

function setup(
  options: { followServerWhenClean?: boolean; onGone?: () => void } = {},
  server: Server<Values> = { values: V7, version: 7 },
) {
  return renderHook(
    ({ server: s }: Props) => {
      const form = useForm<Values>({ defaultValues: structuredClone(V7) });
      const rebasing = useRebasingForm({ form, server: s, ...options });
      return { form, ...rebasing };
    },
    { initialProps: { server } },
  );
}

function type(form: ReturnType<typeof setup>['result']['current']['form'], phone: string) {
  act(() => {
    form.setValue('phone', phone, { shouldDirty: true });
  });
}

describe('keepEdits', () => {
  it('keeps leaves the user changed and takes leaves the server changed', () => {
    const current = { ...V7, phone: '1900 9999' };
    expect(keepEdits(serverChange('new@lapbee.test'), V7, current)).toEqual({
      ...V7,
      phone: '1900 9999',
      email: 'new@lapbee.test',
    });
  });

  it('merges arrays element by element (stats cells)', () => {
    const current: Values = {
      ...V7,
      stats: [{ v: '13', l: 'năm' }, { ...V7.stats[1]! }],
    };
    const next = serverChange(V7.email, 'laptop');
    expect(keepEdits(next, V7, current).stats).toEqual([
      { v: '13', l: 'năm' },
      { v: '5k', l: 'laptop' },
    ]);
  });

  it('keeps a nested object leaf by leaf', () => {
    const previous = { quote: { text: 'a', author: 'b' } };
    const current = { quote: { text: 'a!', author: 'b' } };
    const next = { quote: { text: 'a', author: 'c' } };
    expect(keepEdits(next, previous, current)).toEqual({ quote: { text: 'a!', author: 'c' } });
  });

  it('keeps an array the user resized as a whole', () => {
    const previous = { photos: [{ label: 'x' }] };
    const current = { photos: [{ label: 'x' }, { label: 'y' }] };
    const next = { photos: [{ label: 'z' }] };
    expect(keepEdits(next, previous, current)).toEqual(current);
  });

  it('does not share objects with its inputs', () => {
    const next = serverChange('new@lapbee.test');
    const out = keepEdits(next, V7, V7);
    expect(out).toEqual(next);
    expect(out.stats[0]).not.toBe(next.stats[0]);
  });
});

describe('useRebasingForm', () => {
  it('starts from the values and version the form opened with', () => {
    const { result } = setup();
    expect(result.current.baseline.version).toBe(7);
    expect(result.current.baseline.initial).toEqual(V7);
  });

  it('onConflict rebases at once when the cache is already ahead', () => {
    const { result, rerender } = setup();
    type(result.current.form, '1900 9999');
    // A background refetch brings v9 while the form is dirty: the baseline stays v7.
    rerender({ server: { values: serverChange('new@lapbee.test'), version: 9 } });
    expect(result.current.baseline.version).toBe(7);
    expect(result.current.form.getValues('email')).toBe(V7.email);

    act(() => {
      result.current.onConflict();
    });
    expect(result.current.baseline.version).toBe(9);
    expect(result.current.baseline.initial.email).toBe('new@lapbee.test');
    expect(result.current.form.getValues()).toEqual({
      ...serverChange('new@lapbee.test'),
      phone: '1900 9999',
    });
    expect(result.current.form.formState.isDirty).toBe(true);
    expect(result.current.form.formState.dirtyFields).toEqual({ phone: true });
  });

  it('onConflict with the cache not yet ahead waits, then rebases exactly once', () => {
    const { result, rerender } = setup();
    type(result.current.form, '1900 9999');
    act(() => {
      result.current.onConflict();
    });
    expect(result.current.baseline.version).toBe(7);
    expect(result.current.form.getValues('phone')).toBe('1900 9999');

    // "Tải lại" brings v9.
    rerender({ server: { values: serverChange('new@lapbee.test'), version: 9 } });
    expect(result.current.baseline.version).toBe(9);
    expect(result.current.form.getValues('email')).toBe('new@lapbee.test');
    expect(result.current.form.getValues('phone')).toBe('1900 9999');
    expect(result.current.form.formState.isDirty).toBe(true);

    // A later version does not move the dirty form's baseline again.
    rerender({ server: { values: serverChange('later@lapbee.test'), version: 10 } });
    expect(result.current.baseline.version).toBe(9);
    expect(result.current.form.getValues('email')).toBe('new@lapbee.test');
  });

  it('rebaseOnNextVersion adopts the next version (our own write) keeping edits', () => {
    const { result, rerender } = setup();
    type(result.current.form, '1900 9999');
    act(() => {
      result.current.rebaseOnNextVersion();
    });
    expect(result.current.baseline.version).toBe(7);

    // The refetch after our own bulk move brings v8.
    rerender({ server: { values: V7, version: 8 } });
    expect(result.current.baseline.version).toBe(8);
    expect(result.current.form.getValues('phone')).toBe('1900 9999');
    expect(result.current.form.formState.dirtyFields).toEqual({ phone: true });

    // Only that one version: a later one is someone else's and is not adopted.
    rerender({ server: { values: serverChange('later@lapbee.test'), version: 9 } });
    expect(result.current.baseline.version).toBe(8);
    expect(result.current.form.getValues('email')).toBe(V7.email);
  });

  it('rebaseOnNextVersion skips a version the cache already held when called', () => {
    const { result, rerender } = setup();
    // Someone else's v8 is already cached: it must not be adopted silently.
    rerender({ server: { values: serverChange('other@lapbee.test'), version: 8 } });
    act(() => {
      result.current.rebaseOnNextVersion();
    });
    type(result.current.form, '1900 9999');
    expect(result.current.baseline.version).toBe(7);
    expect(result.current.form.getValues('email')).toBe(V7.email);

    rerender({ server: { values: serverChange('other@lapbee.test'), version: 9 } });
    expect(result.current.baseline.version).toBe(9);
    expect(result.current.form.getValues('email')).toBe('other@lapbee.test');
    expect(result.current.form.getValues('phone')).toBe('1900 9999');
  });

  it('never moves a clean form unless asked to follow the server', () => {
    const { result, rerender } = setup();
    rerender({ server: { values: serverChange('new@lapbee.test'), version: 9 } });
    expect(result.current.baseline.version).toBe(7);
    expect(result.current.form.getValues('email')).toBe(V7.email);
  });

  it('with followServerWhenClean, a new version replaces a clean form only', () => {
    const { result, rerender } = setup({ followServerWhenClean: true });
    rerender({ server: { values: serverChange('new@lapbee.test'), version: 9 } });
    expect(result.current.baseline.version).toBe(9);
    expect(result.current.form.getValues('email')).toBe('new@lapbee.test');
    expect(result.current.form.formState.isDirty).toBe(false);

    type(result.current.form, '1900 9999');
    rerender({ server: { values: serverChange('later@lapbee.test'), version: 10 } });
    expect(result.current.baseline.version).toBe(9);
    expect(result.current.form.getValues('email')).toBe('new@lapbee.test');
  });

  it('calls onGone when the server copy disappears after a conflict', () => {
    const onGone = vi.fn();
    const { result, rerender } = setup({ onGone });
    type(result.current.form, '1900 9999');
    rerender({ server: null });
    expect(onGone).not.toHaveBeenCalled();
    rerender({ server: { values: V7, version: 7 } });
    act(() => {
      result.current.onConflict();
    });
    rerender({ server: null });
    expect(onGone).toHaveBeenCalledTimes(1);
  });

  it('rebaseFromSent keeps what was typed after the save was sent', () => {
    const { result } = setup();
    type(result.current.form, '1900 9999');
    const sent = structuredClone(result.current.form.getValues());
    // Typing continues while the save is in flight.
    act(() => {
      result.current.form.setValue('email', 'typing@lapbee.test', { shouldDirty: true });
    });
    act(() => {
      result.current.rebaseFromSent({ values: { ...sent, stats: V7.stats }, version: 8 }, sent);
    });
    expect(result.current.baseline.version).toBe(8);
    expect(result.current.baseline.initial.phone).toBe('1900 9999');
    expect(result.current.form.getValues('email')).toBe('typing@lapbee.test');
    expect(result.current.form.formState.dirtyFields).toEqual({ email: true });
  });

  it('rebaseFromSent clears a pending conflict rebase', () => {
    const { result, rerender } = setup();
    type(result.current.form, '1900 9999');
    act(() => {
      result.current.onConflict();
    });
    const sent = structuredClone(result.current.form.getValues());
    act(() => {
      result.current.rebaseFromSent({ values: sent, version: 8 }, sent);
    });
    type(result.current.form, '1900 0000');
    rerender({ server: { values: serverChange('new@lapbee.test'), version: 9 } });
    expect(result.current.baseline.version).toBe(8);
  });

  it('resetTo replaces the values and leaves the form clean', () => {
    const { result } = setup();
    type(result.current.form, '1900 9999');
    act(() => {
      result.current.resetTo({ values: serverChange('new@lapbee.test'), version: 9 });
    });
    expect(result.current.baseline.version).toBe(9);
    expect(result.current.form.getValues()).toEqual(serverChange('new@lapbee.test'));
    expect(result.current.form.formState.isDirty).toBe(false);
  });

  it('resetTo and rebaseFromSent keep their own copy of the values passed in', () => {
    const { result } = setup();
    const next = serverChange('new@lapbee.test');
    act(() => {
      result.current.resetTo({ values: next, version: 9 });
    });
    next.email = 'mutated@lapbee.test';
    expect(result.current.baseline.initial.email).toBe('new@lapbee.test');

    const sent = structuredClone(result.current.form.getValues());
    const after = serverChange('after@lapbee.test');
    act(() => {
      result.current.rebaseFromSent({ values: after, version: 10 }, sent);
    });
    after.email = 'mutated@lapbee.test';
    expect(result.current.baseline.initial.email).toBe('after@lapbee.test');
  });
});
