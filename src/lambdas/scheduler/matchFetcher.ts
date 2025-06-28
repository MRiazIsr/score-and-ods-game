import { ScheduledHandler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const dynamoDbClient: ScheduledHandler = await dynamoDbClient.create({
    region: process.env.AWS_REGION,
});


export const handler: matchFetcherHandler = async (event, context) {
    console.log("matchFetcher handler");
    try {
        const matches = await fetchMatchesFromApi();
    }
}

const fetchMatchesFromApi = async () => {
    const API_KEY: string = process.env.AWS_APP_SERVICE_KEY;
    const API_URL: string = process.env.AWS_APP_API_URL;

    if (!API_URL || !API_URL) {
        throw new Error ("Missing API configuration")
    }

    const matchesRaw = await axios.get(`${API_URL}/matches`, {
        headers: {
            'X-Auth-Token': API_KEY,
        },

        params: {

        }
    })
}