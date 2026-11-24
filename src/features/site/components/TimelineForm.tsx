import { Image, ImagePlus, Minus, Quote, X, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form';
import { MediaPicker, type MediaThumb } from '@/features/media';
import { Button, CharCount, IconButton, TextArea, TextField } from '@/shared/ui';
import type { MediaUrls, TimelineForm as TimelineValues } from '../model/types';
import { NO_UPDATE_TITLE } from './labels';
import { Field, fieldError, Section } from './Section';
import styles from './ItemForms.module.css';

export const MAX_PHOTOS = 5;

const MEDIA_TILES: {
  value: TimelineValues['media'];
  Icon: LucideIcon;
  label: string;
  desc: string;
}[] = [
  { value: 'photos', Icon: Image, label: 'Ảnh', desc: 'Tối đa 5 ảnh, ảnh đầu hiển thị lớn.' },
  { value: 'quote', Icon: Quote, label: 'Trích dẫn', desc: 'Một câu nói của người trong cuộc.' },
  { value: 'none', Icon: Minus, label: 'Không có', desc: 'Chỉ tiêu đề và nội dung.' },
];

export type TimelineFormProps = {
  form: UseFormReturn<TimelineValues>;
  readOnly: boolean;
  media: MediaUrls;
  onMedia: (m: MediaThumb) => void;
};

export function TimelineForm({ form, readOnly, media, onMedia }: TimelineFormProps) {
  const { register, control, setValue, formState } = form;
  const { errors } = formState;
  const [body, kind, photos] = useWatch({ control, name: ['body', 'media', 'photos'] });
  const { fields, append, remove } = useFieldArray({ control, name: 'photos' });
  /** Index of the photo row whose image is being picked. */
  const [pickFor, setPickFor] = useState<number | null>(null);
  const noUpdate = readOnly ? NO_UPDATE_TITLE : undefined;
  const full = fields.length >= MAX_PHOTOS;

  return (
    <>
      <Section title="Mốc thời gian">
        <div className={styles.yearRow}>
          <TextField
            label="Năm"
            inputMode="numeric"
            readOnly={readOnly}
            {...fieldError(errors.year?.message)}
            {...register('year')}
          />
          <TextField
            label="Tiêu đề"
            placeholder="vd. Mở xưởng mainboard"
            readOnly={readOnly}
            {...fieldError(errors.title?.message)}
            {...register('title')}
          />
        </div>
        <Field extra={<CharCount value={body} max={160} />}>
          <TextArea
            label="Nội dung"
            rows={3}
            readOnly={readOnly}
            {...fieldError(errors.body?.message)}
            {...register('body')}
          />
        </Field>
      </Section>
      <Section title="Ảnh hoặc trích dẫn">
        <div className={styles.mediaTiles} role="group" aria-label="Ảnh hoặc trích dẫn">
          {MEDIA_TILES.map(({ value, Icon, label, desc }) => (
            <button
              key={value}
              type="button"
              className={styles.mediaTile}
              aria-pressed={kind === value}
              disabled={readOnly}
              title={noUpdate}
              onClick={() => {
                setValue('media', value, { shouldDirty: true });
              }}
            >
              <span className={styles.mediaTop}>
                <Icon size={22} aria-hidden="true" />
                <span className={styles.radio} aria-hidden="true" />
              </span>
              <span className={styles.mediaLabel}>{label}</span>
              <span className={styles.mediaDesc}>{desc}</span>
            </button>
          ))}
        </div>
        {kind === 'photos' ? (
          <div className={styles.photoList}>
            {fields.map((f, i) => {
              const n = String(i + 1).padStart(2, '0');
              const mediaId = photos[i]?.mediaId ?? null;
              const image = mediaId ? media.get(mediaId) : undefined;
              return (
                <div key={f.id} className={styles.photoRow}>
                  <span className={styles.photoNo}>{n}</span>
                  <button
                    type="button"
                    className={styles.thumb}
                    aria-label={`Chọn ảnh ${n}`}
                    disabled={readOnly}
                    title={noUpdate}
                    onClick={() => {
                      setPickFor(i);
                    }}
                  >
                    {image ? <img src={image.thumbUrl} alt="" /> : null}
                  </button>
                  <TextField
                    label={`Chú thích ảnh ${n}`}
                    placeholder="Chú thích ảnh"
                    className={styles.hideLabel}
                    readOnly={readOnly}
                    {...fieldError(errors.photos?.[i]?.label?.message)}
                    {...register(`photos.${String(i)}.label` as `photos.${number}.label`)}
                  />
                  <IconButton
                    icon={X}
                    label={`Bỏ ảnh ${n}`}
                    size="sm"
                    disabled={readOnly}
                    title={noUpdate}
                    onClick={() => {
                      remove(i);
                    }}
                  />
                </div>
              );
            })}
            <div className={styles.actions}>
              <Button
                variant="secondary"
                size="sm"
                icon={ImagePlus}
                disabled={readOnly || full}
                title={noUpdate}
                onClick={() => {
                  append({ mediaId: null, label: '' });
                }}
              >
                Thêm ảnh
              </Button>
              <span
                className={styles.note}
              >{`${String(fields.length)} / ${String(MAX_PHOTOS)} ảnh`}</span>
            </div>
          </div>
        ) : null}
        {kind === 'quote' ? (
          <>
            <TextArea
              label="Trích dẫn"
              rows={3}
              readOnly={readOnly}
              {...fieldError(errors.quote?.text?.message)}
              {...register('quote.text')}
            />
            <div className={styles.grid}>
              <TextField
                label="Người nói"
                readOnly={readOnly}
                {...fieldError(errors.quote?.by?.message)}
                {...register('quote.by')}
              />
              <TextField
                label="Vai trò"
                readOnly={readOnly}
                {...fieldError(errors.quote?.role?.message)}
                {...register('quote.role')}
              />
            </div>
          </>
        ) : null}
      </Section>
      <Section title="Hiển thị">
        <p className={styles.note}>Các mốc tự sắp xếp theo năm, từ cũ đến mới.</p>
      </Section>
      <MediaPicker
        open={pickFor !== null}
        title="Chọn ảnh"
        onClose={() => {
          setPickFor(null);
        }}
        onPick={(m) => {
          if (pickFor !== null) {
            onMedia(m);
            setValue(`photos.${String(pickFor)}.mediaId` as `photos.${number}.mediaId`, m.id, {
              shouldDirty: true,
            });
          }
          setPickFor(null);
        }}
      />
    </>
  );
}
