var restify = require('restify');
var builder = require('botbuilder');
const APP_ID = "d43f1f3a-a301-4678-9e67-bdba5aeb1a4a";
const APP_SECRET = "cac9d798565e4b6e9df1a84fa79b9024";

// Create SlackBot and add dialogs
var commands = new builder.CommandDialog();
var bot = new builder.BotConnectorBot({ appId: APP_ID, appSecret: APP_SECRET });
bot.add('/', commands);

// Add commands
commands.matches('pizzatime', [
    function (session) {
        builder.Prompts.choice(session, "What flavor of pizza do you want?", "Pepperoni|Meat Lovers|Hawaiian|Veggie");
    }, 
    function (session, results) {
        session.dialogData.flavor = results.response.entity;
        builder.Prompts.choice(session, "Awesome. What size do you want?", 'Small (10")|Medium (12")|Large (14")');
    },
    function (session, results) {
        session.dialogData.size = results.response.entity;
        session.beginDialog('/addressPrompt', { prompt: "Ok. So where do you want it delivered?" })
    },
    function (session, results) {
        session.dialogData.address = results.response;
        session.send("Ok. So we have a %(size)s %(flavor)s pizza going to %(address)s.", session.dialogData);
        builder.Prompts.confirm(session, "Is that correct?");
    },
    function (session, results) {
        if (results.response) {
            session.send("Great! Your pizza is on its way.");
        } else {
            session.send("Ok. I canceled your order.");
        }
    }
]);

bot.add('/addressPrompt', builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
    return response.toLowerCase() == 'bellevue, wa';
}));

// Setup Restify Server
var server = restify.createServer();
// server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.post('/api/messages', bot.listen());
server.get('/', function(req, res) {
    res.send('Wow: Server Started,. Bot Verify disabled :()');
});
server.listen(process.env.port || 80, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
