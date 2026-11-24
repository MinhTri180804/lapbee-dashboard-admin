import { useWatch, type UseFormReturn } from 'react-hook-form';
import { CharCount, TextArea, TextField } from '@/shared/ui';
import type { SettingsForm } from '../model/types';
import { SETTINGS_LABEL } from './labels';
import { Field, fieldError, Section } from './Section';
import styles from './Settings.module.css';

export type SettingsPanelProps = {
  form: UseFormReturn<SettingsForm>;
  readOnly: boolean;
  /** Server warnings keyed by path, e.g. `settings.seoTitle`. */
  warnings: Map<string, string>;
};

const CONTACT = ['name', 'phone', 'email', 'hours'] as const;

export function SettingsGeneral({ form, readOnly, warnings }: SettingsPanelProps) {
  const { register, control, formState } = form;
  const { errors } = formState;
  const [seoTitle, seoDesc] = useWatch({ control, name: ['seoTitle', 'seoDesc'] });
  const warn = (name: keyof SettingsForm) => warnings.get(`settings.${name}`);

  return (
    <>
      <Section title="Liên hệ" meta="Header · Footer · Đặt lịch">
        <div className={styles.grid}>
          {CONTACT.map((name) => (
            <Field key={name} warning={warn(name)}>
              <TextField
                label={SETTINGS_LABEL[name]}
                readOnly={readOnly}
                {...fieldError(errors[name]?.message)}
                {...register(name)}
              />
            </Field>
          ))}
        </div>
        <Field warning={warn('address')}>
          <TextField
            label={SETTINGS_LABEL.address}
            readOnly={readOnly}
            {...fieldError(errors.address?.message)}
            {...register('address')}
          />
        </Field>
      </Section>
      <Section title="SEO mặc định" meta="Dùng khi trang chưa có mô tả riêng">
        <Field warning={warn('seoTitle')} extra={<CharCount value={seoTitle} max={60} />}>
          <TextField
            label={SETTINGS_LABEL.seoTitle}
            readOnly={readOnly}
            {...fieldError(errors.seoTitle?.message)}
            {...register('seoTitle')}
          />
        </Field>
        <Field warning={warn('seoDesc')} extra={<CharCount value={seoDesc} max={160} />}>
          <TextArea
            label={SETTINGS_LABEL.seoDesc}
            rows={3}
            readOnly={readOnly}
            {...fieldError(errors.seoDesc?.message)}
            {...register('seoDesc')}
          />
        </Field>
      </Section>
    </>
  );
}
