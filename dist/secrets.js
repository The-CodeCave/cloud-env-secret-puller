import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
export class SecretsManager {
    parseArn(arn) {
        // ARN format: arn:aws:secretsmanager:region:account-id:secret:name-randomSuffix
        const arnParts = arn.split(':');
        if (arnParts.length < 6 || arnParts[0] !== 'arn' || arnParts[2] !== 'secretsmanager') {
            throw new Error('Invalid ARN format. Expected: arn:aws:secretsmanager:region:account:secret:name');
        }
        const region = arnParts[3];
        // The secret ID is the name part (everything after 'secret:')
        const secretId = arnParts.slice(6).join(':');
        if (!region || !secretId) {
            throw new Error('Could not extract region or secret ID from ARN');
        }
        return { region, secretId };
    }
    async getSecrets(secretArn) {
        try {
            const { region, secretId } = this.parseArn(secretArn);
            const client = new SecretsManagerClient({
                region: region,
            });
            const command = new GetSecretValueCommand({
                SecretId: secretArn,
            });
            const response = await client.send(command);
            if (!response.SecretString) {
                throw new Error('No secret string found in response');
            }
            const secrets = JSON.parse(response.SecretString);
            return secrets;
        }
        catch (error) {
            throw new Error(`Failed to retrieve secrets: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
//# sourceMappingURL=secrets.js.map