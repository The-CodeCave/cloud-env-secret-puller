export interface SecretEntry {
  type: 'file' | 'env';
  path?: string;
  variable?: string;
  value: string;
}

export interface SecretData {
  secrets: SecretEntry[];
}