import { writeFileSync, mkdirSync, appendFileSync, existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';
import { SecretEntry } from './types.js';

export class SecretApplier {
  private envVarsWritten: string[] = [];

  async applySecrets(secrets: SecretEntry[]): Promise<void> {
    for (const secret of secrets) {
      if (secret.type === 'file') {
        await this.applyFileSecret(secret);
      } else if (secret.type === 'env') {
        await this.applyEnvSecret(secret);
      }
    }

    if (this.envVarsWritten.length > 0) {
      console.log(`\n📝 Environment variables added to shell profile files`);
      console.log('Variables will be available in new shell sessions.');
      console.log('To load them in your current shell, run:');
      console.log(`   source ~/.bashrc   # or source ~/.zshrc for zsh`);
    }
  }

  private getShellProfileFiles(): string[] {
    const homeDir = homedir();
    const profileFiles = [
      join(homeDir, '.bashrc'),
      join(homeDir, '.bash_profile'),
      join(homeDir, '.zshrc'),
      join(homeDir, '.profile')
    ];

    return profileFiles.filter(file => existsSync(file));
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
      
      const profileFiles = this.getShellProfileFiles();
      
      if (profileFiles.length === 0) {
        // Fallback: create .profile if no shell profile files exist
        const profilePath = join(homedir(), '.profile');
        appendFileSync(profilePath, envLine);
        console.log(`✓ Added environment variable ${secret.variable} to ${profilePath}`);
      } else {
        // Add to all existing shell profile files
        profileFiles.forEach(profileFile => {
          // Check if the variable already exists in the file to avoid duplicates
          const content = existsSync(profileFile) ? readFileSync(profileFile, 'utf-8') : '';
          const variableExists = content.includes(`export ${secret.variable}=`);
          
          if (!variableExists) {
            appendFileSync(profileFile, envLine);
            console.log(`✓ Added environment variable ${secret.variable} to profile ${profileFile}`);
          } else {
            console.log(`ℹ Environment variable ${secret.variable} already exists in ${profileFile}`);
          }
        });
      }
      
      this.envVarsWritten.push(secret.variable);
    } catch (error) {
      throw new Error(`Failed to write environment variable ${secret.variable}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}