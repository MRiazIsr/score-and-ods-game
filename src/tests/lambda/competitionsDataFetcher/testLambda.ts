import { handler } from '@/lambdas/competitionsDataFetcher/matchFetcher';
import { TestData } from './envDumy';

// Set environment variables for local testing
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_TABLE_NAME = TestData.AWS_TABLE_NAME;
process.env.AWS_APP_SERVICE_KEY = TestData.AWS_APP_SERVICE_KEY;
process.env.AWS_APP_API_URL = TestData.AWS_APP_API_URL;
process.env.AWS_ACCESS_KEY_ID = 'dummy';
process.env.AWS_SECRET_ACCESS_KEY = 'dummy';

// Point to local DynamoDB
process.env.AWS_ENDPOINT_URL = 'http://localhost:8000';

async function testLambda() {
    try {
        const result = await handler({} as never, {} as never, {} as never);
        console.log('Lambda result:', result);
    } catch (error) {
        console.error('Lambda error:', error);
    }
}

testLambda();