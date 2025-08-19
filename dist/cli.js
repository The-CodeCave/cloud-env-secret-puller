#!/usr/bin/env node
import { Command } from 'commander';
import { SecretsManager } from './secrets.js';
import { SecretApplier } from './applier.js';
const program = new Command();
program
    .name('cloud-env-secret-puller')
    .description('Pull secrets from AWS Secrets Manager and apply them to the system')
    .version('1.0.0');
program
    .command('pull')
    .description('Pull and apply secrets from AWS Secrets Manager')
    .option('-s, --secret-arn <arn>', 'ARN of the secret to pull (defaults to INSTANCE_SECRETS env var)')
    .action(async (options) => {
    try {
        const secretArn = options.secretArn || process.env.INSTANCE_SECRETS;
        if (!secretArn) {
            console.error('❌ Secret ARN must be provided via --secret-arn option or INSTANCE_SECRETS environment variable');
            process.exit(1);
        }
        console.log('🔄 Retrieving secrets from AWS Secrets Manager...');
        const secretsManager = new SecretsManager();
        const secrets = await secretsManager.getSecrets(secretArn);
        console.log(`📦 Found ${secrets.length} secrets to apply`);
        const applier = new SecretApplier();
        await applier.applySecrets(secrets);
        console.log('✅ All secrets applied successfully!');
    }
    catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
        process.exit(1);
    }
});
program.parse();
//# sourceMappingURL=cli.js.map