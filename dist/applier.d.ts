import { SecretEntry } from './types.js';
export declare class SecretApplier {
    private envVarsWritten;
    applySecrets(secrets: SecretEntry[]): Promise<void>;
    private getShellProfileFiles;
    private applyFileSecret;
    private applyEnvSecret;
}
//# sourceMappingURL=applier.d.ts.map