import { SecretEntry } from './types.js';
export declare class SecretApplier {
    private envFilePath;
    private envVarsWritten;
    constructor(envFilePath?: string);
    applySecrets(secrets: SecretEntry[]): Promise<void>;
    private applyFileSecret;
    private applyEnvSecret;
}
//# sourceMappingURL=applier.d.ts.map