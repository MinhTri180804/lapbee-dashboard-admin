import { useWatch, type UseFormReturn } from 'react-hook-form';
import { CharCount, TextArea, TextField } from '@/shared/ui';
import { SERVICE_ICONS } from '../model/service-icons';
import type { ServiceForm as ServiceValues } from '../model/types';
import { DisplaySection } from './ItemShell';
import { NO_UPDATE_TITLE } from './labels';
import { Field, fieldError, Section } from './Section';
import styles from './ItemForms.module.css';

export type ServiceFormProps = {
  form: UseFormReturn<ServiceValues>;
  readOnly: boolean;
  /** Places in the "Vị trí" select. */
  positionCount: number;
};

export function ServiceForm({ form, readOnly, positionCount }: ServiceFormProps) {
  const { register, control, setValue, formState } = form;
  const { errors } = formState;
  const [icon, desc, position, visible] = useWatch({
    control,
    name: ['icon', 'desc', 'position', 'visible'],
  });

  return (
    <>
      <Section title="Biểu tượng" meta="Lucide · nét 2px">
        <div className={styles.icons} role="group" aria-label="Biểu tượng">
          {SERVICE_ICONS.map(({ name, Icon }) => (
            <button
              key={name}
              type="button"
              className={styles.tile}
              aria-label={name}
              aria-pressed={icon === name}
              title={readOnly ? NO_UPDATE_TITLE : name}
              disabled={readOnly}
              onClick={() => {
                setValue('icon', name, { shouldDirty: true });
              }}
            >
              <Icon size={22} aria-hidden="true" />
            </button>
          ))}
        </div>
      </Section>
      <Section title="Nội dung">
        <TextField
          label="Tên dịch vụ"
          placeholder="vd. Sửa laptop"
          readOnly={readOnly}
          {...fieldError(errors.title?.message)}
          {...register('title')}
        />
        <Field extra={<CharCount value={desc} max={90} suffix="một câu, nói rõ sửa được gì" />}>
          <TextArea
            label="Mô tả"
            rows={3}
            readOnly={readOnly}
            {...fieldError(errors.desc?.message)}
            {...register('desc')}
          />
        </Field>
        <TextField
          label="Thời gian xử lý"
          placeholder="vd. Từ 1 giờ"
          hint="Hiện ở cuối thẻ dịch vụ."
          readOnly={readOnly}
          {...fieldError(errors.time?.message)}
          {...register('time')}
        />
      </Section>
      <DisplaySection
        position={position ?? positionCount - 1}
        count={positionCount}
        onPosition={(p) => {
          setValue('position', p, { shouldDirty: true });
        }}
        visible={visible}
        onVisible={(v) => {
          setValue('visible', v, { shouldDirty: true });
        }}
        visibleLabel="Hiện trên trang chủ"
        readOnly={readOnly}
      />
    </>
  );
}
