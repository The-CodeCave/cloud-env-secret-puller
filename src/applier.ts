import { writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { dirname } from 'path';
import { SecretEntry } from './types.js';

export class SecretApplier {
  private envFilePath: string;
  private envVarsWritten: string[] = [];

  constructor(envFilePath: string = '.env.secrets') {
    this.envFilePath = envFilePath;
  }

  async applySecrets(secrets: SecretEntry[]): Promise<void> {
    for (const secret of secrets) {
      if (secret.type === 'file') {
        await this.applyFileSecret(secret);
      } else if (secret.type === 'env') {
        await this.applyEnvSecret(secret);
      }
    }

    if (this.envVarsWritten.length > 0) {
      console.log(`\n📝 Environment variables written to ${this.envFilePath}`);
      console.log('To load them in your current shell, run:');
      console.log(`   source ${this.envFilePath}`);
      console.log('Or for fish shell:');
      console.log(`   bass source ${this.envFilePath}`);
    }
  }

  private async applyFileSecret(secret: SecretEntry): Promise<void> {
    if (!secret.path) {
      throw new Error('File secret missing path');
    }

    try {
      const dir = dirname(secret.path);
      mkdirSync(dir, { recursive: true });
      
      const content = Buffer.from(secret.value, 'base64').toString('utf-8');
      writeFileSync(secret.path, content, { mode: 0o600 });
      
      console.log(`✓ Applied file secret to ${secret.path}`);
    } catch (error) {
      throw new Error(`Failed to apply file secret to ${secret.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async applyEnvSecret(secret: SecretEntry): Promise<void> {
    if (!secret.variable) {
      throw new Error('Environment secret missing variable name');
    }

    try {
      // Escape the value for shell safety
      const escapedValue = secret.value.replace(/'/g, "'\\''");
      const envLine = `export ${secret.variable}='${escapedValue}'\n`;
      
      appendFileSync(this.envFilePath, envLine);
      this.envVarsWritten.push(secret.variable);
      
      console.log(`✓ Added environment variable ${secret.variable} to ${this.envFilePath}`);
    } catch (error) {
      throw new Error(`Failed to write environment variable ${secret.variable}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}