// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;

// // Add views
// var leftView = myApp.addView('.view-left', {
//     // Because we use fixed-through navbar we can enable dynamic navbar
//     dynamicNavbar: true
// });
// var mainView = myApp.addView('.view-main', {
//     // Because we use fixed-through navbar we can enable dynamic navbar
//     dynamicNavbar: true
// });

 
// Conversation flag
var conversationStarted = false;
 
// Init Messages
var myMessages = myApp.messages('.messages', {
  autoLayout:true
});
 
// Init Messagebar
var myMessagebar = myApp.messagebar('.messagebar');

function setUser(text)
{
	console.log(' --- setBot: '+text);
	  var messageText = myMessagebar.value().trim();
	  // Exit if empy message
	  if (messageText.length === 0) return;
	 

	 
	  // Random message type
	  var messageType = (['sent', 'received'])[0];
	 
	  // Avatar and name for received message
	  var avatar, name;
	  if(messageType === 'received') {
	    avatar = 'http://lorempixel.com/output/people-q-c-100-100-9.jpg';
	    name = 'user-name';
	  }
	  // Add message
	  myMessages.addMessage({
	    // Message text
	    text: messageText,
	    // Random message type
	    type: messageType,
	    // Avatar and name:
	    avatar: avatar,
	    name: name,
	    // Day
	    day: !conversationStarted ? 'Today' : false,
	    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
	  })
	
	  // Empty messagebar
	  //myMessagebar.clear();
	  
	  // Update conversation flag
	  conversationStarted = true;
}
function setBot(text, img)
{
	console.log(' --- setBot: '+text);
	  var messageText = text.trim();
	  // Exit if empy message
	  if (messageText.length === 0) return;
	 
	  // Empty messagebar
	  //myMessagebar.clear()
	 
	  // Random message type
	  var messageType = (['sent', 'received'])[1];
	 
	  // Avatar and name for received message
	  var avatar, name;
	  if(messageType === 'received') {
	    avatar = 'http://52.23.197.29/news-digital/img/ai.svg';
	    name = 'News-Digital-Bot';
	  }
	  // Add message
	  myMessages.addMessage({
	    // Message text
	    text: messageText,
	    // Random message type
	    type: messageType,
	    // Avatar and name:
	    avatar: avatar,
	    name: name,
	    // Day
	    day: !conversationStarted ? 'Today' : false,
	    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
	  })

	  if(img!=""){
	  // Add message
	  myMessages.addMessage({
	    // Message text
	    text: img,
	    // Random message type
	    type: messageType,
	    // Avatar and name:
	    avatar: avatar,
	    name: name,
	    	    // Day
	    day: !conversationStarted ? 'Today' : false,
	    time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
	  })
	  }
	  // Update conversation flag
	  conversationStarted = true;	
}