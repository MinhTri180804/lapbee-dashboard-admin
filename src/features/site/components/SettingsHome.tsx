import { Controller, useWatch } from 'react-hook-form';
import { Switch, TextArea, TextField } from '@/shared/ui';
import { SETTINGS_LABEL } from './labels';
import { Field, fieldError, Section } from './Section';
import type { SettingsPanelProps } from './SettingsGeneral';
import styles from './Settings.module.css';

const HEADLINE = ['h1a', 'h1b', 'h1hl'] as const;
const STAT_ROWS = [
  { v: 'stats.0.v', l: 'stats.0.l' },
  { v: 'stats.1.v', l: 'stats.1.l' },
  { v: 'stats.2.v', l: 'stats.2.l' },
  { v: 'stats.3.v', l: 'stats.3.l' },
] as const;

export function SettingsHome({ form, readOnly, warnings }: SettingsPanelProps) {
  const { register, control, formState } = form;
  const { errors } = formState;
  const showEyebrow = useWatch({ control, name: 'showEyebrow' });
  const warn = (path: string) => warnings.get(`settings.${path}`);

  return (
    <>
      <Section title="Phần mở đầu" meta="Hero · đầu trang chủ">
        <div className={styles.sunken}>
          <Controller
            control={control}
            name="showEyebrow"
            render={({ field }) => (
              <Switch
                label={SETTINGS_LABEL.showEyebrow}
                checked={field.value}
                onChange={field.onChange}
                disabled={readOnly}
              />
            )}
          />
          <Field warning={warn('eyebrow')}>
            <TextField
              label={SETTINGS_LABEL.eyebrow}
              className={styles.hideLabel}
              readOnly={readOnly}
              disabled={!showEyebrow}
              {...fieldError(errors.eyebrow?.message)}
              {...register('eyebrow')}
            />
          </Field>
        </div>
        <div className={styles.gridNarrow}>
          {HEADLINE.map((name) => (
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
        <Field warning={warn('lead')}>
          <TextArea
            label={SETTINGS_LABEL.lead}
            rows={3}
            readOnly={readOnly}
            {...fieldError(errors.lead?.message)}
            {...register('lead')}
          />
        </Field>
        <div className={styles.grid}>
          <Field warning={warn('cta1')}>
            <TextField
              label={SETTINGS_LABEL.cta1}
              hint="Dẫn tới trang Đặt lịch"
              readOnly={readOnly}
              {...fieldError(errors.cta1?.message)}
              {...register('cta1')}
            />
          </Field>
          <Field warning={warn('cta2')}>
            <TextField
              label={SETTINGS_LABEL.cta2}
              hint="Cuộn tới mục Dịch vụ"
              readOnly={readOnly}
              {...fieldError(errors.cta2?.message)}
              {...register('cta2')}
            />
          </Field>
        </div>
      </Section>
      <Section title="Dải số liệu" meta="4 ô · dưới phần mở đầu">
        <div className={styles.stats}>
          {STAT_ROWS.map((paths, i) => {
            const n = `0${String(i + 1)}`;
            const rowErrors = errors.stats?.[i];
            return (
              <div key={i} className={styles.statRow}>
                <span className={styles.statNo} aria-hidden="true">
                  {n}
                </span>
                <Field warning={warn(paths.v)}>
                  <TextField
                    label={`Số liệu ${n} · giá trị`}
                    className={styles.hideLabel}
                    readOnly={readOnly}
                    {...fieldError(rowErrors?.v?.message)}
                    {...register(paths.v)}
                  />
                </Field>
                <Field warning={warn(paths.l)}>
                  <TextField
                    label={`Số liệu ${n} · nhãn`}
                    className={styles.hideLabel}
                    readOnly={readOnly}
                    {...fieldError(rowErrors?.l?.message)}
                    {...register(paths.l)}
                  />
                </Field>
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
