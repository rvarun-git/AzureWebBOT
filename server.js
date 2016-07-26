var restify = require('restify');
var builder = require('botbuilder');
const APP_ID = "d43f1f3a-a301-4678-9e67-bdba5aeb1a4a";
const APP_PASSWORD = "jvUwHXFu3haurJfB14MBAY9";


// Setup Restify Server
var server = restify.createServer();
server.get('/', function(req, res, next) {
    res.send('Hi! Click on http://mangoes.azurewebsites.net for Mangoes List.');
    // res.redirect('http://mangoes.azurewebsites.net', next);
});
server.listen(process.env.port || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
}); 

// Create bot add dialogs
/*
var connector = new builder.ChatConnector({
    appId: APP_ID,
    appPassword: APP_PASSWORD
});
*/
var connector = new builder.ChatConnector({
    appId: null,
    appPassword: null
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


// Add commands
bot.dialog('/', [
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

bot.dialog('/addressPrompt', builder.DialogAction.validatedPrompt(builder.PromptType.text, function (response) {
    return response.toLowerCase() == 'bellevue, wa';
}));


    