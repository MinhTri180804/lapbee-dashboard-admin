import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { isProblem } from '@/shared/api/errors';
import { applyProblemToForm } from '@/shared/form/apply-problem-to-form';
import { messageFor } from '@/shared/form/error-messages';
import { Button, Dialog, TextField, useToast } from '@/shared/ui';
import { folderErrorMessage } from '../model/adapters';
import styles from './FolderNameDialog.module.css';

const schema = z.object({
  name: z.string().trim().min(1, 'Không được để trống.').max(100, 'Tên thư mục tối đa 100 ký tự.'),
});
type NameForm = z.infer<typeof schema>;

export type FolderNameDialogProps = {
  open: boolean;
  title: string;
  initialName: string;
  submitLabel: string;
  onClose: () => void;
  /** Rejects with the server's error; the dialog shows it (under the field, or a toast). */
  onSubmit: (name: string) => Promise<void>;
};

/** Name box for creating or renaming a folder. */
export function FolderNameDialog({
  open,
  title,
  initialName,
  submitLabel,
  onClose,
  onSubmit,
}: FolderNameDialogProps) {
  const formId = useId();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NameForm>({ resolver: zodResolver(schema), defaultValues: { name: initialName } });

  useEffect(() => {
    if (open) reset({ name: initialName });
  }, [open, initialName, reset]);

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values.name);
      onClose();
    } catch (error) {
      if (isProblem(error, 'FOLDER_NAME_TAKEN')) {
        setError('name', {
          type: 'server',
          message: folderErrorMessage('FOLDER_NAME_TAKEN') ?? '',
        });
      } else if (isProblem(error, 'VALIDATION_FAILED')) {
        applyProblemToForm(error, setError, {}, ['name']);
      } else if (!isProblem(error, 'VERSION_CONFLICT')) {
        // A version conflict opens the global dialog; anything else is told here.
        toast.show({
          kind: 'error',
          title: isProblem(error)
            ? (folderErrorMessage(error.code) ?? messageFor(error))
            : messageFor(error),
        });
      }
    }
  });

  const rootError = errors.root?.server?.message;

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
        <TextField
          label="Tên thư mục"
          autoComplete="off"
          {...(errors.name?.message === undefined ? {} : { error: errors.name.message })}
          {...register('name')}
        />
        {rootError ? (
          <p role="alert" className={styles.alert}>
            {rootError}
          </p>
        ) : null}
      </form>
    </Dialog>
  );
}
