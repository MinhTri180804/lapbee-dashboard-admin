import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { isProblem } from '@/shared/api/errors';
import { applyProblemToForm } from '@/shared/form/apply-problem-to-form';
import { messageFor } from '@/shared/form/error-messages';
import { Button, CharCount, Dialog, TextArea, TextField, useToast } from '@/shared/ui';
import { categoryErrorMessage } from '../model/adapters';
import styles from './CategoryDialog.module.css';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SLUG_MESSAGE = 'Chỉ dùng chữ thường không dấu, số và dấu gạch ngang.';
const DESCRIPTION_MAX = 500;
const FIELDS = ['name', 'slug', 'description'] as const;

function schemaFor(slugRequired: boolean) {
  const slug = z.string().trim().max(200, 'Đường dẫn tối đa 200 ký tự.');
  return z.object({
    name: z
      .string()
      .trim()
      .min(1, 'Không được để trống.')
      .max(100, 'Tên chuyên mục tối đa 100 ký tự.'),
    slug: slugRequired
      ? slug.min(1, 'Không được để trống.').regex(SLUG_PATTERN, SLUG_MESSAGE)
      : slug.refine((v) => v === '' || SLUG_PATTERN.test(v), SLUG_MESSAGE),
    description: z.string().max(DESCRIPTION_MAX, `Mô tả tối đa ${String(DESCRIPTION_MAX)} ký tự.`),
  });
}

export type CategoryFormValues = { name: string; slug: string; description: string };

export type CategoryDialogProps = {
  open: boolean;
  title: string;
  initial: CategoryFormValues;
  /** Editing: the backend cannot go back to an auto slug, so Đường dẫn is required (P4-7). */
  slugRequired: boolean;
  submitLabel: string;
  onClose: () => void;
  /** Rejects with the server's error; the dialog shows it (under the field, or a toast). */
  onSubmit: (values: CategoryFormValues) => Promise<void>;
};

/** Name, slug and description box for adding or editing a category. */
export function CategoryDialog({
  open,
  title,
  initial,
  slugRequired,
  submitLabel,
  onClose,
  onSubmit,
}: CategoryDialogProps) {
  const formId = useId();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schemaFor(slugRequired)),
    defaultValues: initial,
  });

  const { name, slug, description } = initial;
  useEffect(() => {
    if (open) reset({ name, slug, description });
  }, [open, name, slug, description, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      if (isProblem(error, 'CATEGORY_NAME_TAKEN')) {
        setError('name', {
          type: 'server',
          message: categoryErrorMessage('CATEGORY_NAME_TAKEN') ?? '',
        });
      } else if (isProblem(error, 'SLUG_TAKEN')) {
        setError('slug', { type: 'server', message: categoryErrorMessage('SLUG_TAKEN') ?? '' });
      } else if (isProblem(error, 'VALIDATION_FAILED')) {
        applyProblemToForm(error, setError, {}, FIELDS);
      } else if (!isProblem(error, 'VERSION_CONFLICT')) {
        // A version conflict opens the global dialog; anything else is told here.
        toast.show({
          kind: 'error',
          title: isProblem(error)
            ? (categoryErrorMessage(error.code) ?? messageFor(error))
            : messageFor(error),
        });
      }
    }
  });

  const descriptionValue = useWatch({ control, name: 'description' });
  const rootError = errors.root?.server?.message;
  const fieldError = (field: (typeof FIELDS)[number]) => {
    const message = errors[field]?.message;
    return message === undefined ? {} : { error: message };
  };

  return (
    <Dialog
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Huỷ
          </Button>
          <Button variant="primary" type="submit" form={formId} loading={isSubmitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} className={styles.form} noValidate onSubmit={(e) => void submit(e)}>
        <TextField label="Tên" autoComplete="off" {...fieldError('name')} {...register('name')} />
        <TextField
          label="Đường dẫn"
          autoComplete="off"
          spellCheck={false}
          className={styles.slug}
          {...(slugRequired ? {} : { hint: 'Để trống để tự tạo từ tên.' })}
          {...fieldError('slug')}
          {...register('slug')}
        />
        <div className={styles.description}>
          <TextArea
            label="Mô tả"
            rows={3}
            {...fieldError('description')}
            {...register('description')}
          />
          <CharCount value={descriptionValue} max={DESCRIPTION_MAX} />
        </div>
        {rootError ? (
          <p role="alert" className={styles.alert}>
            {rootError}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}
