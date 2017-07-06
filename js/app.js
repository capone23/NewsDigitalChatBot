(function() {
	var $this = this;
	var accessToken = "eb13b35ac9ed42c9a9b9aab35e544029";
	var baseUrl = "https://api.api.ai/v1/";
	var articleFeed = 0;
	var videoFeed = 1;
	var onloadText = 0;
	var index = 1;
	var text = $("#input").val();
	var timer;
	var videoTab = false;
	var articleTab = false;
	var feedActive = false;
	var focused = false;
	var speechCopy;
	var totalTodayVideo;
	var totalTodayArticle;
	var randomPrecent;

	var articleData =[];
	var videoData =[];

	var msnbcaData =[];
	var todayaData =[];
	var nbcaData =[];

	var msnbcvData =[];
	var todayvData =[];
	var nbcvData =[];

	var topVideos= $('.elements');

	var DateFormats = {
       short: "DD MMMM - YYYY",
       long: "dddd DD.MM.YYYY HH:mm"
	};

	// to avoid further adjustment, initialize msg and voices as global
	var speakMsg = new SpeechSynthesisUtterance();
	var speakVoices = window.speechSynthesis.getVoices();
	var recognition;

	var app = {

		timeUpdated: function(dateSynced){
			var currentdate = new Date(); 
			var hours = currentdate.getHours();
			var minutes = currentdate.getMinutes();

			var ampm = hours >= 12 ? 'PM' : 'AM';
			hours = hours % 12;
			hours = hours ? hours : 12; // the hour '0' should be '12'
			minutes = minutes < 10 ? '0'+minutes : minutes;

			var dateSynced = "Last Updated: " 
				+(currentdate.getMonth()+1) + "/"
				+ currentdate.getDate()  + "/"
				+ currentdate.getFullYear() + " " 
				+ hours + ":" 
				+ minutes + " "
				+ ampm;
			return dateSynced;
		},

		speak: function(text)
		{	//Google chrome NLP options
			var voice = undefined;
			speakMsg.voiceURI = 'native';
			speakMsg.volume = 1; // 0 to 1 - the smaller, the lower
			speakMsg.rate = 0.9; // 0.1 to 10 - the smaller, the slower
			speakMsg.pitch = 1; //0 to 2 - the smaller, the lower
			speakMsg.text = text; //text;
		
			// voice setup, maybe filtered on voice.lang 
			speakMsg.voice = 
						speechSynthesis.getVoices().filter(function(voice) { 
								return voice.name == 'News Digital'; 
							})[0];
					
			speakMsg.onend = function(e) {
				  console.log(' --- just finished synthesis speech.');
			};
			
			if(speechSynthesis.speaking)
			{
				// stop this speech
				speechSynthesis.pause();
				speechSynthesis.cancel();
			}
			if(!speechSynthesis.speaking)
				window.speechSynthesis.speak(speakMsg);
		},
		
		stopSynthesisSpeech: function()
		{
			if(speechSynthesis.speaking)
			{
				// stop this speech
				speechSynthesis.pause();
				speechSynthesis.cancel();
			}
		},

		sync: function() {
			if(onloadText == 0){
				var text = 'what’s trending';
			}else if(onloadText == 1){
				var text = $("#input").val();
			}
			setUser(text);

			$.ajax({
				type: "POST",
				url: baseUrl + "query?v=20150910",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				headers: {
					"Authorization": "Bearer " + accessToken
				},
				data: JSON.stringify({ query: text, lang: "en", sessionId: "nbc-digital-bot" }),
				success: function(data) {
					app.setResponse(data);
				},
				error: function() {
					app.setResponse({"result":{"fulfillment":{"speech":"Internal Server Error"}}});
				}
			});
		},
		setResponse: function(data) {
			console.log('RAW API.ai Data',data);
			var intent = data.result.metadata.intentName;
			var action = data.result.action;

			console.log("intent==============");
			console.log(intent);
			console.log("intent==============");
			console.log("action==============");
			console.log(action);
			console.log("action==============");

			if(!data||!data.result||!data.result.fulfillment||!data.result.fulfillment.speech)
			{
				speechCopy = "Sorry, I don't get it, but I am learning quick...";
		    	setBot(speechCopy);
		    	app.speak(speechCopy);
		    	app.chatLoad(speechCopy);
				setTimeout(function(){
			    	setBot('Ask me things like:');
				},3000);
				setTimeout(function(){
			    	setBot('Whats trending?');
				},4000);
				setTimeout(function(){
			    	setBot('Show me top msnbc videos');
				},5000);
				setTimeout(function(){
			    	setBot('What articles are trending?');
				},6000);
				app.chatLoadComplete();
				return;
			}
			if(intent ==undefined && action){
				if("I am an interstellar being from outer space... no just kidding I'm a chatbot" ==data.result.fulfillment.speech||"I'm a News Digital ChatBot"==data.result.fulfillment.speech||"1 month old"==data.result.fulfillment.speech||"Right back at ya!"==data.result.fulfillment.speech||"Hold on please..."==data.result.fulfillment.speech||":("==data.result.fulfillment.speech||"Yes..."==data.result.fulfillment.speech||"So are you!"==data.result.fulfillment.speech||"Can't remember..."==data.result.fulfillment.speech||"Hmmm..."==data.result.fulfillment.speech||"Media Labs"==data.result.fulfillment.speech||"No... I'm productive!"==data.result.fulfillment.speech||"Yes"==data.result.fulfillment.speech||"No"==data.result.fulfillment.speech||"So are you"==data.result.fulfillment.speech||"Ok"==data.result.fulfillment.speech||"Thanks"==data.result.fulfillment.speech||"Always"==data.result.fulfillment.speech||"lol"==data.result.fulfillment.speech||"Never"==data.result.fulfillment.speech||"Mars"==data.result.fulfillment.speech||"Sure"==data.result.fulfillment.speech||"Hmmm"==data.result.fulfillment.speech||"Interwebs"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
					app.chatLoad(speechCopy)
			    	setBot(speechCopy);
			    	app.speak(speechCopy);
			    	app.chatLoadComplete();
				}
			}

			// soring function from top starts to low starts
			var sort_by = function(field, reverse, primer){

			   var key = primer ? 
			       function(x) {return primer(x[field])} : 
			       function(x) {return x[field]};

			   reverse = !reverse ? 1 : -1;

			   return function (a, b) {
			       return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
			     }
			}

			randomPrecent= Math.floor(Math.random() * 80) + 20;

			// pasre and store trending data on app init

			if (intent=="trending_general"){
				feedActive = true;

				var parsedData = JSON.parse(data.result.fulfillment.speech);


				console.log(parsedData);
				console.log(" ---------Parsed JSON - top - low ---------");
					for(var i=0; i<parsedData.length; i++){
						if(!parsedData[i].totalViews){
							///this is an article
							//articleData = [];
							articleData.push(parsedData[i]);

							// count total article clicks
							totalTodayArticle = 1027;
							totalTodayArticle += parseInt(parsedData[i].starts+parsedData[i].starts);
							//console.log(totalTodayArticle);
						}
						else
						{
							///this is an video
							//videoData = [];
							videoData.push(parsedData[i]);

							// total views for articles
							totalTodayVideo = 0;
							totalTodayVideo += parseInt(parsedData[i].totalViews);
						}
						
					}

					parsedData.sort(sort_by('starts', true, parseInt));
					parsedData.sort(function(a, b) { return a.starts < b.starts ? 1 : -1; }).slice(0, 10);

						console.log(articleData);
						console.log("articleData===============>");
						console.log(videoData);
						console.log("videoData=================>");


					//handlebars func to add 1 to index of object
					// Handlebars.registerHelper('addOne', function(value) {
					//   return value + 1;
					// });
					app.handlebarsAddindex();

					if(videoFeed == 1 && !focused){
						//app.chatLoad();
						if (!videoTab){
							$('.chatMenu').slideToggle(200);
							speechCopy = "Here\'s a list of top trending videos";
							app.chatLoad(speechCopy);
							setBot(speechCopy);
					    	app.speak(speechCopy);
							setTimeout(function(){
								$('.chat-menu').click()[0];
							},3000);
						}
						setTimeout(function(){
							app.parsedVdata(videoData);
						},2000);
						// setTimeout(function(){
					    //  app.parsedVdata(videoData);
						// },3000);
						// setTimeout(function(){
						// 	$('.chat-menu').click()[0];
						// },5000);
					}
					else if(articleFeed == 1){
						//app.chatLoad();
						if (!articleTab){
							speechCopy = "Here\'s you go top trending articles";
							app.chatLoad(speechCopy);

					    	setBot(speechCopy);
					    	app.speak(speechCopy);
				    	}
						setTimeout(function(){
							// app.parsedAdata(articleData);
					  //   	setBot('Here\'s you go top trending articles for today');
							app.parsedAdata(articleData);

						},2000);
						//setBot("Here are the latest trending articles");
						//app.parsedAdata(articleData);
						//console.log('TRRRRRRUUUEE ARTTCLES');
					}
					else if(videoFeed == 1 && focused){
						//on focus resync top videos
						app.parsedVdata(videoData);
						//speechCopy = "News feeds are updated :)";
							//app.chatLoad(speechCopy);

					    	//setBot(speechCopy);
					    	//app.speak(speechCopy);
					}

			}
			if (intent=="trending_brand"){
				var speechData = JSON.stringify(data.result.fulfillment.speech);
				var brand = data.result.parameters.brand;
				var content = data.result.parameters.content;
				var content1 = data.result.parameters.content1;

				//Articles data by brand
				for(var i=0; i<articleData.length; i++){
					if(articleData[i].brand == "MSNBC"){
						///this is an MSNBC article
						msnbcaData.push(articleData[i]);
						app.removeDuplicates(msnbcaData);
					}
					else if(articleData[i].brand == "TODAY"){
						///this is an TODAY Show article
						todayaData.push(articleData[i]);
						app.removeDuplicates(todayaData);
					}
					else if(
						articleData[i].brand == "NBC_NEWS"){
						///this is an NBC NEWS Show article
						nbcaData.push(articleData[i]);
						app.removeDuplicates(nbcaData);
					}
				}

				//Videos data by brand
				for(var i=0; i<videoData.length; i++){
					if(videoData[i].brand == "MSNBC"){
						///this is an MSNBC article
						msnbcvData.push(videoData[i]);
						app.removeDuplicates(msnbcvData);
					}
					else if(videoData[i].brand == "TODAY"){
						///this is an TODAY Show article
						todayvData.push(videoData[i]);
						app.removeDuplicates(todayvData);
					}
					else if(
						videoData[i].brand == "NBC_NEWS"){
						///this is an NBC NEWS Show article
						nbcvData.push(videoData[i]);
						app.removeDuplicates(nbcvData);
					}
				}
				
		      switch(brand) {
		        case "MSNBC":
		        	if(content=='video' || content1=='video'){
						if("Take a look at top MSNBC video for today"==data.result.fulfillment.speech){
							if( msnbcvData.length == 0){
								speechCopy = "Hmm... looks like there are no MSNBC videos available at the moment.";
				    			app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedVdata(videoData);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								app.parsedVdata(msnbcvData);

							}
						}
						if("Take a look at top 10 MSNBC video"==data.result.fulfillment.speech){
							if( msnbcvData.length == 0){
								speechCopy = "Hmm... looks like there are no MSNBC videos available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedVdata(videoData);
							}
							else if(app.removeDuplicates(msnbcvData).length < 10){
								speechCopy = "I found "+app.removeDuplicates(msnbcvData).length+" MSNBC videos.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedVdata(app.removeDuplicates(msnbcvData.slice(0, 10)));
								},2000);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedVdata(msnbcvData.slice(0, 10));
								},2000);
							}
						}
		        	}else if (content=='article' || content1=='article'){
						if("Take a look at top MSNBC article for today"==data.result.fulfillment.speech){
							if( msnbcaData.length == 0){
								speechCopy = "Hmm... looks like there are no MSNBC articles available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedVdata(articleData);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								app.parsedAdata(msnbcaData);
							}
						}
						if("Take a look at top 10 MSNBC article"==data.result.fulfillment.speech){
							if( msnbcaData.length == 0){
								speechCopy = "Hmm... looks like there are no MSNBC artiles available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedAdata(articleData);
							}
							else if(app.removeDuplicates(msnbcaData).length < 10){
								speechCopy = "I found "+app.removeDuplicates(msnbcaData).length+" MSNBC articles.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedAdata(app.removeDuplicates(msnbcaData.slice(0, 10)));
								},2000);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedAdata(msnbcaData.slice(0, 10));
								},2000);
							}
						}
		        	}
		        break;
		        case "TODAY":
		        	if(content=='video' || content1=='video'){
						if("Take a look at top TODAY video for today"==data.result.fulfillment.speech){
							if( todayvData.length == 0){
								speechCopy = "Hmm... looks like there are no TODAY videos available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedVdata(videoData);
							}
							else{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								app.parsedVdata(todayvData);
							}
						}
						if("Take a look at top 10 TODAY video"==data.result.fulfillment.speech){
							if( todayvData.length == 0){
								speechCopy = "Hmm... looks like there are no TODAY videos available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedVdata(videoData);
							}
							else if(app.removeDuplicates(todayvData).length < 10){
								speechCopy = "I found "+app.removeDuplicates(todayvData).length+" Today Show videos.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedVdata(app.removeDuplicates(todayvData.slice(0, 10)));
								},2000);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedVdata(todayvData.slice(0, 10));
								},2000);
							}
						}
		        	}else if (content=='article' || content1=='article'){
						if("Take a look at top TODAY article for today"==data.result.fulfillment.speech){
							if( todayaData.length == 0){
								speechCopy = "Hmm... looks like there are no TODAY articles available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedVdata(articleData);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								app.parsedAdata(todayaData);
							}
						}
						if("Take a look at top 10 TODAY article"==data.result.fulfillment.speech){
							if( todayaData.length == 0){
								speechCopy = "Hmm... looks like there are no TODAY artiles available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedAdata(articleData);
							}
							else if(app.removeDuplicates(todayaData).length < 10){
								speechCopy = "I found "+app.removeDuplicates(todayaData).length+" Today Show articles.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedAdata(app.removeDuplicates(todayaData.slice(0, 10)));
								},2000);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedAdata(todayaData.slice(0, 10));
								},2000);
							}
						}
		        	}
		        break;
		        case "NBC News":
		        	if(content=='video' || content1=='video'){
						if("Take a look at top NBC News video for today"==data.result.fulfillment.speech){
							if( nbcvData.length == 0){
								speechCopy = "Hmm... looks like there are no NBC News videos available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedVdata(videoData);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								app.parsedVdata(nbcvData);
							}
						}
						if("Take a look at top 10 NBC News video"==data.result.fulfillment.speech){
							if( nbcvData.length == 0){
								speechCopy = "Hmm... looks like there are no NBC News videos available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedVdata(videoData);
							}
							else if(app.removeDuplicates(nbcvData).length < 10){
								speechCopy = "I found "+app.removeDuplicates(nbcvData).length+" NBC News videos.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedVdata(app.removeDuplicates(nbcvData.slice(0, 10)));
								},2000);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	nbcvData.sort(function(a, b) { return a.starts < b.starts ? 1 : -1; }).slice(0, 10);
								setTimeout(function(){
									app.parsedVdata(nbcvData);
								},2000);
							}
						}
		        	}
		        	else if (content=='article' || content1 =='article'){
						if("Take a look at top NBC News article for today"==data.result.fulfillment.speech){
							if( nbcaData.length == 0){
								speechCopy = "Hmm... looks like there are no NBC News artiles available at the moment.";
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	//app.chatLoad(speechCopy);
						    	app.parsedVdata(articleData);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								app.parsedAdata(nbcaData);
							}
						}
						if("Take a look at top 10 NBC News article"==data.result.fulfillment.speech){
							if( nbcaData.length == 0){
								speechCopy = "Hmm... looks like there are no NBC News artiles available at the moment.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
						    	app.parsedAdata(articleData);
							}
							else if(app.removeDuplicates(nbcaData).length < 10){
								speechCopy = "I found "+app.removeDuplicates(nbcaData).length+" NBC News articles.";
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedAdata(app.removeDuplicates(nbcaData.slice(0, 10)));
								},2000);
							}
							else
							{
								speechCopy = data.result.fulfillment.speech;
								app.chatLoad(speechCopy);
						    	setBot(speechCopy);
						    	app.speak(speechCopy);
								setTimeout(function(){
									app.parsedAdata(nbcaData.slice(0, 10));
								},2000);
							}
						}
		        	}
		        break;
		        default:
		        	//Random NBC content
					// if("Take a look at top NBC News article for today"==data.result.fulfillment.speech){
					// 	if( nbcaData.length == 0){
					// 		speechCopy = "Hmm... looks like there are no NBC News content available at the moment.";
					// 		app.chatLoad(speechCopy);
					//     	setBot(speechCopy);
					//     	app.speak(speechCopy);
					//     	app.parsedVdata(articleData);
					// 	}
					// 	else
					// 	{
					// 		speechCopy = data.result.fulfillment.speech;
					// 		app.chatLoad(speechCopy);
					//     	setBot(speechCopy);
					//     	app.speak(speechCopy);
					// 		app.parsedAdata(articleData);
					// 	}
					// }

		    }

			if("Do you want to see what's trending for trump?"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
					app.chatLoad(speechCopy);
			    	setBot(speechCopy);
			    	app.speak(speechCopy);
			    	app.chatLoadComplete();
			}


				console.log(msnbcaData);
				console.log("msnbcaData articles=====");
				console.log(todayaData);
				console.log("todayaData articles=====");
				console.log(nbcaData);
				console.log("nbcaData articles=====");

				console.log(msnbcvData);
				console.log("msnbcaData videos=====");
				console.log(todayvData);
				console.log("todayaData videos=====");
				console.log(nbcvData);
				console.log("nbcaData videos=====");

			}

			if (intent=="trending_content" || intent=="conversation"){

			    //intent === 'what articles are popular?';
				if("Here's a list of the most popular article"==data.result.fulfillment.speech){
					// app.chatLoad();
					// setTimeout(function(){
					// 	//setBot(data.result.fulfillment.speech+'s');
					// 	app.parsedAdata(articleData);
					// },3000);

					speechCopy = data.result.fulfillment.speech;
					app.chatLoad(speechCopy)
			    	setBot(speechCopy);
			    	app.speak(speechCopy);
					app.parsedAdata(articleData);

				}
				if("Here is the latest trending top 10 popular articles"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
					app.chatLoad(speechCopy)
			    	setBot(speechCopy);
			    	app.speak(speechCopy);
					app.parsedAdata(articleData.slice(0, 10));

				}
				if("Here is the latest trending top 10 articles"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
					app.chatLoad(speechCopy)
			    	setBot(speechCopy);
			    	app.speak(speechCopy);
					app.parsedAdata(articleData.slice(0, 10));

				}
				if("Sorry I didn't understand but I am learning fast, ask me whats trending"==data.result.fulfillment.speech){
					// app.chatLoad();
					// setTimeout(function(){
					// 	setBot(data.result.fulfillment.speech);
					// 	app.chatLoadComplete();
					// },3000);

					speechCopy = data.result.fulfillment.speech;
					app.chatLoad(speechCopy)
			    	//setBot(speechCopy);
			    	app.speak(speechCopy);
					//app.chatLoadComplete();

				}
				if("What brands do you support?"==data.result.fulfillment.speech){
					// app.chatLoad();
					// setTimeout(function(){
					// 	setBot(data.result.fulfillment.speech);
					// 	app.chatLoadComplete();
					// },3000);

					speechCopy = data.result.fulfillment.speech;
					//app.chatLoad(speechCopy)
			    	//setBot(speechCopy);
			    	app.speak(speechCopy);
					//app.chatLoadComplete();

				}
				if("whats your name?"==data.result.fulfillment.speech || "name please"==data.result.fulfillment.speech || "do you have a name?"==data.result.fulfillment.speech){
					// app.chatLoad();
					// setTimeout(function(){
					// 	setBot(data.result.fulfillment.speech);
					// 	app.chatLoadComplete();
					// },3000);
					speechCopy = data.result.fulfillment.speech;
					app.chatLoad(speechCopy)
			    	setBot(speechCopy);
			    	app.speak(speechCopy);
				}
				if("This is exciting... take a look at top trending video"==data.result.fulfillment.speech){
					// app.chatLoad();
					// setTimeout(function(){
					// 	setBot(data.result.fulfillment.speech);
					// 	app.chatLoadComplete();
					// 	app.parsedAdata(articleData);
					// },3000);
					speechCopy = data.result.fulfillment.speech;
					app.chatLoad(speechCopy)
			    	//setBot(speechCopy);
			    	app.speak(speechCopy);
					app.parsedAdata(videoData);

				}

				if("This is exciting... take a look at top trending article"==data.result.fulfillment.speech){
					// app.chatLoad();
					// setTimeout(function(){
					// 	setBot(data.result.fulfillment.speech);
					// 	app.chatLoadComplete();
					// 	app.parsedAdata(articleData);
					// },3000);
					speechCopy = data.result.fulfillment.speech;
					app.chatLoad(speechCopy)
			    	//setBot(speechCopy);
			    	app.speak(speechCopy);
					app.parsedAdata(articleData);

				}

				if("At the moment i support NBC News, Today Show, and MSNBC"==data.result.fulfillment.speech){
					// app.chatLoad();
					// setTimeout(function(){
					// 	//setBot(data.result.fulfillment.speech);
					// 	app.chatLoadComplete();
					// },3000);
					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					app.chatLoadComplete();
				}
				if("Check out TODAY popular video"==data.result.fulfillment.speech){
					// app.chatLoad();
					// setTimeout(function(){
					// 	setBot(data.result.fulfillment.speech);
					// 	app.chatLoadComplete();
					// 	app.parsedAdata(videoData);
					// },3000);

					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					app.parsedVdata(videoData);
				}
				if("Check out NBC News popular video"==data.result.fulfillment.speech){
					//app.chatLoad();
					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					setTimeout(function(){
						app.parsedVdata(videoData);
					},2000);
				}

				if("Your welcome! Would you like to see what's trending on right now?"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					setTimeout(function(){
						app.parsedVdata(videoData);
					},2000);
				}

				if("Here's a list of the most popular video"==data.result.fulfillment.speech){

					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					setTimeout(function(){
						app.parsedVdata(videoData);
					},2000);
				}
				if("Sure here is the top video for today"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					setTimeout(function(){
						app.parsedVdata(videoData);
					},2000);
				}
				if("Sure here is the top article for today"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					setTimeout(function(){
						app.parsedAdata(articleData);
					},2000);
				}
				if("Here is the latest trending videos"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					setTimeout(function(){
						app.parsedVdata(videoData);
					},2000);
				}
				if("What's your name?"==data.result.fulfillment.speech || "Nice to meet you Sowmya!"==data.result.fulfillment.speech || "Nice to meet you Vlad!"==data.result.fulfillment.speech || "Nice to meet you Altaf!"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
			    	//app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					app.chatLoadComplete();
				}
				if("awesome... how about you?"==data.result.fulfillment.speech || "doing well, you?"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					setTimeout(function(){
						app.parsedVdata(videoData);
					},2000);
				}
				if("hi there"==data.result.fulfillment.speech || "hi"==data.result.fulfillment.speech){
					speechCopy = data.result.fulfillment.speech;
			    	app.chatLoad(speechCopy)
			    	app.speak(speechCopy);
					setTimeout(function(){
						app.parsedVdata(videoData);
					},2000);
				}
				
			}

			$('.last-updated').html(app.timeUpdated);

			//stop sync data
			//clearInterval(timer);

		},
		parsedAdata: function(data){
			//process data for duplicates
			var obj = {};
			for ( var i=0, len=data.length; i < len; i++ )
			    obj[data[i]['name']] = data[i];

			data = new Array();
			for ( var key in obj )
			    data.push(obj[key]);

			$this.topArticles = $.map(data, function(nd){
				// get top platform
				var topPlatform = Object.keys(nd.platforms).reduce(function(ott, web){
				 return nd.platforms[web] > nd.platforms[ott] ? web : ott 
				});

				return {
					brand: nd.brand,
					type: 'article',
					totalViews : nd.totalViews,
					platforms: topPlatform,
					starts: nd.starts,
					thumbnail: nd.thumbnail,
					name: nd.name,
					url: nd.url,
					time: nd.time
				};
			});
			app.feedTemplate($this.topArticles);
			console.log($this.topArticles);
			console.log("FINAL Article Data----------------------------");
		},
		parsedVdata: function(data){

			//process data for duplicates
			var obj = {};
			for ( var i=0, len=data.length; i < len; i++ )
			    obj[data[i]['name']] = data[i];

			data = new Array();
			for ( var key in obj )
			    data.push(obj[key]);

			$this.topVids = $.map(data, function(nd){
				// get top platform
				var topPlatform = Object.keys(nd.platforms).reduce(function(ott, web){
				 return nd.platforms[web] > nd.platforms[ott] ? web : ott 
				});

				return {
					brand: nd.brand,
					type: 'video',
					totalViews : nd.totalViews,
					platforms: topPlatform,
					starts: nd.starts,
					thumbnail: nd.thumbnail,
					name: nd.name,
					url: nd.url,
					time: nd.time
				};
			});
			console.log($this.topVids);
			console.log("FINAL Video Data----------------------------");
			app.feedTemplate($this.topVids);
			app.handlebarsIDcheck($this.topVids);
		},

		removeDuplicates: function(data){
			var obj = {};
			for ( var i=0, len=data.length; i < len; i++ )
			    obj[data[i]['name']] = data[i];

			data = new Array();
			for ( var key in obj )
			    data.push(obj[key]);
			return data;
		},

		feedTemplate: function(data){
			var tmphdrType = data[0].type;
			var template = Handlebars.compile( $('#feedtempl').html() );

			topVideos.load('index.html .elements',function () {
	        	topVideos.append( template(data) );
	       	
	       	$('.elements').scrollTop(0);
	       	$("time.timeago").timeago();
	       	
	       	if(tmphdrType == 'video'){
	       		$('.title').html('top videos');
	       		$('.totalviews').html(totalTodayVideo.toLocaleString());
	       		$('.today-switch').html('Today Views');
	       	}else{
	       		$('.title').html('top articles');
	       		$('.totalviews').html(totalTodayArticle.toLocaleString());
	       		$('.today-switch').html('Today Clicks');
	       	}
	       	$('.random-prcent').html('<span id="trend" class="increasing"></span>');
	       	$('.random-prcent').prepend(+randomPrecent+"%");
	        app.setLightbox();
	    	});
	    	app.chatLoadComplete();
		},

		setLightbox:function(){
			$('.popup-news').on('click',function(e){
				console.log(e);
				console.log(e.target.attributes[1].value);

				var evtTemplate = e.target.parentElement.innerHTML;
				console.log(evtTemplate)

				$('#content').html();
				$('#lightbox').fadeIn(150);
				var lightbox = 
				'<div id="lightbox">' +
				'<article class="elements"><div class="template itemplate">'+evtTemplate+'</div></article>' +
				'<div id="content">' + 
				'<p id="close">Click to close</p>' +
				'<iframe scrolling="yes" src="'+ e.target.attributes[1].value +'"></iframe>' +
				'</div>' +	
				'</div>';
				$('body').append(lightbox);
				//$('.itemplate').html(evtTemplate);

				$("#content p").on('click',function(){
					$('#lightbox').remove();
				})
			});
		},
		chatDigital: function(){

			//Main Menu - Videos
			$('.a-top-videos').on('click',function(){
				videoFeed = 1;
				articleFeed = 0;
				videoTab = true;
				//articleTab = false;
				text = 'what’s trending';
				app.parsedVdata(videoData);
				//app.sync();
			});

			//Main Menu - Articles
			$('.a-top-articles').on('click',function(){
				articleFeed = 1;
				videoFeed = 0;
				articleTab = true;
				//videoTab = false;
				text = 'what’s trending';
				app.parsedAdata(articleData);
				//app.sync();
			});

			$('.dropdown').on('click',function(){
				$('.sub-menu').slideToggle(50);
			})

			$('.chat-menu').on('click',function(){
				console.log('menu open');
				$('.chatMenu').slideToggle(200);
				//$('.loader').fadeOut('fast');
			});
			$('.chat-textarea').on('click',function(){
				$('.chatMenu').slideToggle(200);
				//$('.loader').fadeOut('fast');
			});

			$('.chat-textarea').on('click',function(){
				$('.loader').fadeOut('fast');
			});

			$("#input").keypress(function(event) {
				onloadText = 1;
				if (event.which == 13) {
					event.preventDefault();
					app.sync();
					$('textarea').val('');
					$('.chatMenu').slideToggle(200);
	       			$('.elements').scrollTop(0);
					$('.chat-send-btn')[0].click();
				}
			});

			$('.chat-send-btn').on('click',function(){
				onloadText = 1;
				app.sync();
				//app.chatLoad(speechCopy);
				$('#input').val('');

			})

			$("#rec").click(function(event) {
				app.switchRecognition();
			});

			$('.chatMenu li').on('click',function(e){
				console.log(e.target.innerHTML);

				// var chatarea = $.trim(chat-send-btn);
				// console.log(chatarea);
				// console.log("-=-=-=-=-=-=-=-=-_________");
				 var chatarea = $.trim($('#input').val());
				if(chatarea.length == 0){
				    console.log('empty');
				    $("#input").val(e.target.innerHTML);
					setTimeout(function(){
						//app.sync();
						$('.chat-send-btn')[0].click();
					},1500);
				    return;
				}

				 console.log('not empty');
				 document.getElementById("input").value = "";
				//close menu
				    $("#input").val(e.target.innerHTML);
					setTimeout(function(){
						//app.sync();
						$('.chat-send-btn')[0].click();
					},1500);

			});

			$('.loader').on('click',function(){
				$(this).fadeOut('fast');
				console.log('loder click');
			});

		},

		syncActiveData : function(){
			$(window).on("blur focus", function(e) {
			    var prevType = $(this).data("prevType");

			    if (prevType != e.type) {   //  reduce double fire issues
			        switch (e.type) {
			            case "blur":
			                console.log("Blured");
			                //clearInterval(timer);
			                break;
			            case "focus":
			                console.log("Focused");

			                focused = true;
			                onloadText = 0;
			                //clean data sets
							articleData =[];
							videoData =[];
							msnbcaData =[];
							todayaData =[];
							nbcaData =[];
							msnbcvData =[];
							todayvData =[];
							nbcvData =[];

			                app.sync();
			                break;
			        }
			    }

			    $(this).data("prevType", e.type);
			});
		},

		startRecognition: function() {
			recognition = new webkitSpeechRecognition();
				recognition.onstart = function(event) {
				app.updateRec();
			};
			recognition.onresult = function(event) {
				var text = "";
				for (var i = event.resultIndex; i < event.results.length; ++i) {
		    			text += event.results[i][0].transcript;
				}
	 	        app.setInput(text);
		 		app.stopRecognition();
			};
			recognition.onend = function() {
				app.stopRecognition();
			};
			recognition.lang = "en-US";
			recognition.start();
		},

		stopRecognition:function() {
			if (recognition) {
				recognition.stop();
				recognition = null;
			}
			app.updateRec();
		},
		switchRecognition: function() {
			if (recognition) {
				app.stopRecognition();
			} else {
				app.startRecognition();
			}
		},

		setInput: function(text) {
			if(text.trim().includes("whats's tredning right now")){
				text="what’s trending";
			}else if(text.trim().includes("what's trending for viral videos")){
				text="viral videos";
			}

			$("#input").val(text);
			onloadText = 1;
			app.sync(); // send texts to API.ai agent for NL understanding
		},
		updateRec: function() {
			// HAI - switch microphone images for stop and speak
			$("#recognition").text(recognition ? "Stop" : "Speak");

		},

		chatLoad: function(data){
		    $("#preloader").fadeIn('slow',function(){$(this).css("display", "block");});
		    app.spinnerBounce(data);
		},

		chatLoadComplete: function(){
			setTimeout(function(){
				$("#preloader").html("");
				$("#preloader").fadeOut('slow',function(){$(this).css("display", "none");});

			},1500);
		},

		spinnerBounce: function (data) {
			  console.log(data);
			  var spinner = $(".spinner");
			  var overlay = ['<div class="robot"></div>'+
			  	'<div class="spinner">'+
			  	'<div class="bounce1"></div>'+
			  	'<div class="bounce2"></div>'+
			  	'<div class="bounce3"></div></div>'+
			  	'<div class="chatCopy">'+data+'</div>'].join('');
			  $("#preloader").append(overlay);

		},
		init: function(config) {

				var chatMenu = config.mainMenu;
				console.log(chatMenu);
				// this.container = config.container;

				this.sync();
				this.chatDigital();
				this.syncActiveData();
				//var timer = setInterval(app.sync, 900000);

				setTimeout(function(){
					$('#preloader-main').fadeOut('slow',function(){$(this).remove();});
				},2000);
		},
		//formatted string in the default locale ex:1,0000
		toLocaleStringSupportsLocales:	function(data) {
		  var number = 0;
		  try {
		    number.toLocaleString('i');
		  } catch (e) {
		    return e.name === 'RangeError';
		  }
		  return false;
		},

		handlebarsAddindex: function(){
			//handlebars func to add 1 to index of object
			Handlebars.registerHelper('addOne', function(value) {
			  return value + 1;
			});
		},

		handlebarsIDcheck:function(data){
			console.log('===========',data);
			Handlebars.registerHelper("updown", function() {

				var clicks='increasing';
			    //console.log('-----------',data);
			    for (i=0, j = data.length; i < j; i++) {
			      var number = Math.floor(Math.random() * 3000);

			 		if (number < 900){
						clicks = 'decreasing';
			 		}		 	
			 		return clicks;
			    }
			    
			});
		},

		failureSync: function(){
			console.log('Warning: Data sync error');
		}

	};

	app.init({
		mainMenu  : $('.chatMenu'),
	});

})();