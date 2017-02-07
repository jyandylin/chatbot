
/** This is a sample code for your bot**/
function MessageHandler(context, event) {
    //context.console.log("test")
    event.message = event.message.trim().toLowerCase();

    if(event.message == 'hi') {
        context.sendResponse("Hey there " + event.sender + " do you want to read from Wired or Techcrunch?");
    }
    else if((event.message == "wired") || (event.message == "techcrunch")) {
        setPreference(context, event.message);      
    }
    else if(event.message.includes('quick') ){
        var opt = {     
            "type": "quick_reply",
            "content": {
            "type": "text",
            "text": "Would you like to pay a bill or send money to a friend/family?"
            },
            "msgid": "qr_212",
            "options": [
                'pay bill',
                'send money'
                ]
        };
        context.sendResponse(JSON.stringify(opt) );
    }
    else if(event.message.includes('catalog') ){
        var opt_generic = {     
            "type": "catalogue",
            "content": {
            "type": "text",
            "text": "Would you like to pay a bill or send money to a friend/family?"
            },
            "msgid": "qr_212",
            "options": [
                'pay bill',
                'send money'
                ]
        };
        context.sendResponse(JSON.stringify(opt_generic) );
    }
    /*
     * test out the webview form 
     * wrapped the gupshup webform API calls inside a function
     */
    else if(event.message.includes('webview') ) {
        var embedLink = getServerlessWebformLink(context, event);
        var opt_sendmoney = {
              "type": "survey",
              "question": "Would you like to send money or pay a bill?",
              "msgid": "3er45",
              "options": [ 
                {
                    "type": "url",
                    "title": "send money",
                    "url": embedLink,
                    "webview_height_ratio": "tall"
                }, {
                    "type": "url",
                    "title": "pay bill",
                    "url": "www.gupshup.io",
                    "webview_height_ratio": "full"
                } 
              ] // end options
        }// end opt_sendmoney
        context.sendResponse(JSON.stringify(opt_sendmoney) );
    }
    else if(event.message.toLowerCase() == "green" && event.messageobj.refmsgid == 'qr_212'){
        context.sendResponse('you choose green!');
    }
    else if(event.message.toLowerCase() == "httptest") {
        context.simplehttp.makeGet("http://ip-api.com/json");
    }
    else if (event.message.indexOf("news") > -1 ) {
        context.simplehttp.makeGet('https://ajax.googleapis.com/ajax/services/feed/load?v=2.0&q=http://www.' + context.simpledb.roomleveldata.publication + '.com/feed/&num=15');
        context.sendResponse('Google APIs are broken. Getting news from ' + context.simpledb.roomleveldata.publication);
    }
    else {
        context.sendResponse('No keyword found : '+event.message); 
    }

}
/** Set preference **/
function setPreference (context, pref) {
    context.simpledb.roomleveldata.publication = pref;
    context.sendResponse("Type 'news' to get latest headlines on " + context.simpledb.roomleveldata.publication);
}

function getServerlessWebformLink (context, event) {
    var embedLink;
    var options = context.simplehttp.parseURL("https://api.gupshup.io/sm/api/facebook/smartmsg/form/create");
    var headerJson = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': '375337564fd34486c4328cbd7361cffb'
    };
    options.headers = headerJson;
    options.method = 'POST';

    var jsonBody = {
        "title": "Send money",
        "message": "Money has been sent",
        "callback-url":"https://www.gupshup.io/developer/bot/Parakeet/public", //Bot callback URL
        "fields": [
        {
            "type": "select",
            "name": "payee",
            "label": "Who to send to",
            "options": ["Alan Dershowitz", "Jonathan Miller", "Steven Pinker"],
            "validations": [{
                "regex": "",
                "msg": ""
            }]
        }, {
            "type": "select",
            "name": "account",
            "label": "Account to send from",
            "options": ["chequings", "savings", "mortgage"],
            "validations": [{
                "regex": "",
                "msg": ""
            }]
        }, {
            "type": "input",
            "name": "amount",
            "label": "Amount",
            "validations": [{
                "regex": "",
                "msg": ""
            }, {
                "regex": "",
                "msg": ""
            }]
        }],
        "users": [event.sender]
    };
    options.body = "formJSON=" + JSON.stringify(jsonBody); //formJSON parameter.
    
    context.simplehttp.httpRequest(options, function(c, e) 
    {
        var response = JSON.parse(e.getresp);// JSON response after calling the API.
        var fbButton = response[0]["fb-button"]; // To extract Facebook url button JSON.
        embedLink = response[0]["embedLink"]; // URL of the form.
    });
    return embedLink;
}

/** Functions declared below are required **/
function EventHandler(context, event) {
    if(! context.simpledb.botleveldata.numinstance)
        context.simpledb.botleveldata.numinstance = 0;
    numinstances = parseInt(context.simpledb.botleveldata.numinstance) + 1;
    context.simpledb.botleveldata.numinstance = numinstances;
    context.sendResponse("Thanks for adding me. You are:" + numinstances);
}

function HttpResponseHandler(context, event) {
    // if(event.geturl === "http://ip-api.com/json")
    // context.sendResponse(event.getresp);
    var respJson = JSON.parse(event.getresp);
    var stories = respJson.responseData.feed.entries;
    var resp = "";
    
    //generate a random number
    var randomnumber = Math.floor(Math.random() * (stories.length - 1 + 1)) + 1;
    resp = resp + stories [randomnumber].title + "\n" + stories[randomnumber].link + "\n";
    
    resp = resp.replace("&nbsp", "");
    context.sendResponse(resp);
}

function HttpEndpointHandler(context, event) {
    formId = event.params.linkId;
    var userDetails = event.params.payload;
    for(var i=0;i<userDetails.length;i++){
        
        if(userDetails[i]["fieldname"]=='name'){
            name = userDetails[i]["fieldvalue"];
            continue;
            
        }else if(userDetails[i]["fieldname"]=='account'){
            account = userDetails[i]["fieldvalue"];
            continue;
        
            
        }else if(userDetails[i]["fieldname"]=='gender'){
            gender = userDetails[i]["fieldvalue"];
            continue;
            
        }else{
            interests = userDetails[i]["fieldvalue"];
        }
    }
    context.simpledb.doGet(formId);
}

function DbGetHandler(context, event) {
    var done = null;
    var apikey = "375337564fd34486c4328cbd7361cffb";
    botname = encodeURI(event.botname);
    contextobj = event.dbval;
    apikey = encodeURI(apikey);
    message = encodeURIComponent("Your Details are:\n" +
            "Name: "+ name + "\n" +
            "Gender: "+ gender + "\n" +
            "Account Type: "+ account + "\n" +
            "Interests: "+interests); 
    var url = "https://api.gupshup.io/sm/api/bot/" + botname + "/msg";
    var body = "botname=" + botname + "&context=" + contextobj + "&message=" + message;
    var headers = "{\"Accept\": \"application/json\",\"apikey\": \"" + apikey + "\",\"Content-Type\": \"application/x-www-form-urlencoded\"}";
    context.simplehttp.makePost(url, body, JSON.parse(headers), done); 
}

function DbPutHandler(context, event) {
    context.sendResponse("testdbput keyword was last put by:" + event.dbval);
}






