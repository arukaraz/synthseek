export interface PasswordFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
  describedBy?: string;
  className?: string;
}
