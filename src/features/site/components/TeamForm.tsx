import { ImageUp, X } from 'lucide-react';
import { useState } from 'react';
import { useWatch, type UseFormReturn } from 'react-hook-form';
import { MediaPicker, type MediaThumb } from '@/features/media';
import { Button, CharCount, TextArea, TextField } from '@/shared/ui';
import type { MediaUrls, TeamForm as TeamValues } from '../model/types';
import { DisplaySection } from './ItemShell';
import { NO_UPDATE_TITLE, sinceHint } from './labels';
import { Field, fieldError, Section } from './Section';
import styles from './ItemForms.module.css';

export type TeamFormProps = {
  form: UseFormReturn<TeamValues>;
  readOnly: boolean;
  positionCount: number;
  currentYear: number;
  media: MediaUrls;
  /** Remembers the URLs of a picked image. */
  onMedia: (m: MediaThumb) => void;
};

export function TeamForm(props: TeamFormProps) {
  const { form, readOnly, positionCount } = props;
  const { register, control, setValue, formState } = form;
  const { errors } = formState;
  const [since, bio, photoMediaId, position, visible] = useWatch({
    control,
    name: ['since', 'bio', 'photoMediaId', 'position', 'visible'],
  });
  const [picking, setPicking] = useState(false);
  const photo = photoMediaId ? props.media.get(photoMediaId) : undefined;
  const noUpdate = readOnly ? NO_UPDATE_TITLE : undefined;
  const hint = sinceHint(since, props.currentYear);

  return (
    <>
      <Section title="Ảnh chân dung">
        <div className={styles.portraitRow}>
          {photo ? (
            <img className={styles.portrait} src={photo.thumbUrl} alt="" />
          ) : (
            <span className={styles.portraitEmpty} aria-hidden="true">
              <span className="lb-label">4 : 5</span>
            </span>
          )}
          <div className={styles.portraitSide}>
            <p className={styles.note}>
              Ảnh dọc tỉ lệ 4:5, tối thiểu 800 × 1000 px. Nền trơn, ánh sáng tự nhiên, chụp tại
              xưởng nếu có thể.
            </p>
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="sm"
                icon={ImageUp}
                disabled={readOnly}
                title={noUpdate}
                onClick={() => {
                  setPicking(true);
                }}
              >
                Chọn ảnh
              </Button>
              {photoMediaId ? (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={X}
                  disabled={readOnly}
                  title={noUpdate}
                  onClick={() => {
                    setValue('photoMediaId', null, { shouldDirty: true });
                  }}
                >
                  Bỏ ảnh
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Section>
      <Section title="Thông tin">
        <div className={styles.grid}>
          <TextField
            label="Họ và tên"
            readOnly={readOnly}
            {...fieldError(errors.name?.message)}
            {...register('name')}
          />
          <TextField
            label="Vai trò"
            placeholder="vd. Kỹ thuật viên MacBook"
            readOnly={readOnly}
            {...fieldError(errors.role?.message)}
            {...register('role')}
          />
        </div>
        <TextField
          label="Năm gia nhập"
          type="number"
          inputMode="numeric"
          className={styles.narrow}
          {...(hint ? { hint } : {})}
          readOnly={readOnly}
          {...fieldError(errors.since?.message)}
          {...register('since', { valueAsNumber: true })}
        />
        <Field extra={<CharCount value={bio} max={160} suffix="không bắt buộc" />}>
          <TextArea
            label="Giới thiệu ngắn"
            rows={3}
            placeholder="Một đến hai câu về kinh nghiệm và chuyên môn."
            readOnly={readOnly}
            {...fieldError(errors.bio?.message)}
            {...register('bio')}
          />
        </Field>
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
        visibleLabel="Hiện trên trang Đội ngũ"
        readOnly={readOnly}
      />
      <MediaPicker
        open={picking}
        title="Chọn ảnh"
        onClose={() => {
          setPicking(false);
        }}
        onPick={(m) => {
          props.onMedia(m);
          setValue('photoMediaId', m.id, { shouldDirty: true });
          setPicking(false);
        }}
      />
    </>
  );
}
