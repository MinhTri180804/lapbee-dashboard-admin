import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TextField } from './TextField';
import type { TextFieldProps } from './TextField';
import styles from './PasswordField.module.css';

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'trailing'>;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className={styles.toggle}
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={visible}
          onClick={() => {
            setVisible((v) => !v);
          }}
        >
          <Icon size={18} aria-hidden="true" />
        </button>
      }
    />
  );
}
