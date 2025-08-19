import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
export class SecretApplier {
    async applySecrets(secrets) {
        for (const secret of secrets) {
            if (secret.type === 'file') {
                await this.applyFileSecret(secret);
            }
            else if (secret.type === 'env') {
                await this.applyEnvSecret(secret);
            }
        }
    }
    async applyFileSecret(secret) {
        if (!secret.path) {
            throw new Error('File secret missing path');
        }
        try {
            const dir = dirname(secret.path);
            mkdirSync(dir, { recursive: true });
            const content = Buffer.from(secret.value, 'base64').toString('utf-8');
            writeFileSync(secret.path, content, { mode: 0o600 });
            console.log(`✓ Applied file secret to ${secret.path}`);
        }
        catch (error) {
            throw new Error(`Failed to apply file secret to ${secret.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async applyEnvSecret(secret) {
        if (!secret.variable) {
            throw new Error('Environment secret missing variable name');
        }
        try {
            process.env[secret.variable] = secret.value;
            console.log(`✓ Set environment variable ${secret.variable}`);
        }
        catch (error) {
            throw new Error(`Failed to set environment variable ${secret.variable}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
//# sourceMappingURL=applier.js.map