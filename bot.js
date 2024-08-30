const {
    TurnContext,
    MessageFactory,
    TeamsInfo,
    TeamsActivityHandler,
    CardFactory,
    ActionTypes
} = require('botbuilder');

const { LexRuntimeV2Client, RecognizeTextCommand } = require('@aws-sdk/client-lex-runtime-v2');

const AWS_REGION = "us-east-1";
const AWS_ACCESS_KEY_ID = "AKIAQFLZDLYF3K6AP4EK";
const AWS_SECRET_ACCESS_KEY = "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";

class EchoBot extends TeamsActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
            TurnContext.removeRecipientMention(context.activity);
            await this.callLex(context);
            await next();
        });

        this.onMembersAddedActivity(async (context, next) => {
            context.activity.membersAdded.forEach(async (teamMember) => {
                if (teamMember.id !== context.activity.recipient.id) {
                    await context.sendActivity(`Hi, and welcome to the Echo Bot.' ${teamMember.givenName} ${teamMember.surname}`);
                }
            });
            await next();
        });
    }

    async callLex(context) {
        const client = new LexRuntimeV2Client({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY
            }
        });
        
        const params = {
            botId: "FCYRV44VBF",
            botAliasId: "TSTALIASID",
            localeId: "en_US",
            sessionId: context.activity.from.id,
            text: context.activity.text.trim()
        };

        try {
            const command = new RecognizeTextCommand(params);
            const response = await client.send(command);

            const message = response.messages[0].content;
            await context.sendActivity(MessageFactory.text(message, message));

        } catch (error) {
            console.log(`Error calling Lex: ${error}`);
            await context.sendActivity(MessageFactory.text("Oops! Something went wrong. Please try again later."));
        }
    }
}

module.exports.EchoBot = EchoBot;