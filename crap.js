'use strict'

let Leap = require('leapjs');
let Player = require('node-mplayer'); 
let fs = require('fs');
let debounce = require('underscore').debounce;
let playstate = "stop";
let controller = new Leap.Controller({enableGestures: true});
let player = new Player();
let ding = new Player('./ding.mp3');
let say = require('say');
let music = fs.readdirSync('./music').map((file) => __dirname+"/music/"+file);

say.speak('The Radio is running!');

let swiper = controller.gesture('swipe');
let tolerance = 50;
let cooloff = 500;
let currentFile = 0;
player.setFile(music[0]);

swiper.update(function(g) {
	if (Math.abs(g.translation()[0]) > tolerance || Math.abs(g.translation()[1]) > tolerance) {
		let xDir = Math.abs(g.translation()[0]) > tolerance ? (g.translation()[0] > 0 ? -1 : 1) : 0;
		let yDir = Math.abs(g.translation()[1]) > tolerance ? (g.translation()[1] < 0 ? -1 : 1) : 0;
		handlePlayer(xDir, yDir);
	}
});

let handlePlayer = debounce(function(xDir, yDir) {
	if((xDir == -1)&&(yDir == 0)&&(playstate == "play" || "paused")){
		player.next();
		player.setVolume(0.1);
		ding.play();
		console.log("NEXT");
	}
	/*if((xDir == 1) && (yDir == 0)){
	}*/
	if((xDir == 0)&&(yDir == -1)&&(playstate == "stop" || "paused")){
		console.log("PLAY");
		if(playstate == "stop"){
			ding.play();
			player.play();
			playstate = "play";
		}
		else if(playstate == "paused"){
			ding.play();
			player.pause();
			playstate = "play";
		}
		
	}
	if((xDir == 0)&&(yDir == 1)&&(playstate == "play" || "paused")){
		if(playstate == "play"){
			ding.play();
			playstate = "paused";
			console.log("PAUSE");
		}
		else if(playstate == "paused"){
			ding.play();
			playstate = "play";
			console.log("RESUME");
		}
		player.pause();
		
	}
}, cooloff);

player.on('playing',function(item){
	console.log('im playing... src:' + JSON.stringify(item));
});

ding.on('error', function(e){
	ding.stop();
})


controller.connect();



