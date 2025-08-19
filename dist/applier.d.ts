import { SecretEntry } from './types.js';
export declare class SecretApplier {
    applySecrets(secrets: SecretEntry[]): Promise<void>;
    private applyFileSecret;
    private applyEnvSecret;
}
//# sourceMappingURL=applier.d.ts.map