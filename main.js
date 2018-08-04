//defines the canvas and context variables globally for later use
var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d');
//display multiplier
var multiplier = 19
//changes canvas width and height to fit grid
var width = 32;
var height = 32;
canvas.width = width*multiplier;
canvas.height = (height*multiplier)+2;
// Initializes Firebase
// var config = {
// 	apiKey: "AIzaSyAbvLLZTe2ch3XaUo8cRrl8HmvFkBh3jzg",
// 	authDomain: "microwar-506ca.firebaseapp.com",
// 	databaseURL: "https://microwar-506ca.firebaseio.com",
// 	projectId: "microwar-506ca",
// 	storageBucket: "microwar-506ca.appspot.com",
// 	messagingSenderId: "264220848446"
// };
// firebase.initializeApp(config);
//defines button and text field elements that are on the html side of things.
//Also defines the database reference for easy editing
var button = document.getElementById('button');
var pushButton = document.getElementById('pushButton');
var signOut = document.getElementById('sign-out');
var colr = ""
var databaseRef = firebase.database().ref();
var array = [];
//adds event listener for the sign in button and if clicked, it
//hides all of the sign in fields by calling setting css display modes
button.addEventListener('click', function(){
	email = document.getElementById('email').value;
	password = document.getElementById('password').value;
	firebase.auth().signInWithEmailAndPassword(email, password);
});
function hide(){document.getElementById('sign-in-form').style.display = 'none';}
function show(){document.getElementById('sign-in-form').style.display = 'block';}
//checks if user is signed in, if so, hide the sign in fields, if not
//make sure the fields are visible
firebase.auth().onAuthStateChanged(function(user){
	if(user) {hide();} else {show();}
	CurUser = user;
});
//just in case, show us the sign in one more time.
show();
//adds event listener to the send data button, if pressed it gains the x and y cords
//from the html page, as well as the push data and the user's color then appends
//all of that to the database
pushButton.addEventListener('click', function(){
	console.log('update');
	pushData = document.getElementById('pushData').value;
	pushData = pushData[0];
	xCord = document.getElementById('xCord').value;
	yCord = document.getElementById('yCord').value;
	color = document.getElementById('unitColor').value;
	colr = color.toLowerCase();
	colr = colr[0]+colr[1];
	toSet = {}
	toSet[xCord+","+yCord] = pushData+","+color;
	databaseRef.update(toSet)
});
//adds event listener to the sign out button, if pressed, sign out
signOut.addEventListener('click', function(){
	firebase.auth().signOut();
});
//sets canvas font size
ctx.font = "19px Arial";
//sets variable for spacing in the display loop
var gap = multiplier;
//defines global variable for all database keys and values
var databaseVals = [];
var keyArray = [];
//Defines x and y arrays to replace keyArray above, allows for a larger grid
var xList = [];
var yList = [];
//function to pull keys and values from database object
function extract(data){
	databaseVals = [];
	keyArray = [];
	for(var key in data) {
		var values = data[key];
		databaseVals.push(data[key]);
		keyArray.push(key);
	}
	seperation(keyArray);
}
//converts the x and y values in 1 array into 2 arrays for more than a 9x9 grid
function seperation(mainArray){
	yList =[];
	xList =[];
	for(i=0;i<mainArray.length;i++){
		xList.push(mainArray[i].substr(0,mainArray[i].search(',')));
		yList.push(mainArray[i].substr(mainArray[i].search(',')+1,keyArray[i].length-1));
	}
}
//displays to the screen what you feed it, cool
function dispLoop(values,keys){
	ctx.clearRect(0,0,canvas.width,canvas.height);
	for(i=0;i<values.length;i++) {
		ctx.fillStyle = databaseVals[i].substr(2,databaseVals[i].length-1);
		ctx.fillText(databaseVals[i][0],(parseInt(xList[i])*gap-(gap*.8)),(parseInt(yList[i])*gap));
	}
	gridDraw();
}
//creates a function to draw a grid
function gridDraw(){
	ctx.fillStyle = 'black';
	for(i=0;i<canvas.width/multiplier;i++){
		ctx.fillRect(multiplier+(multiplier*i),0,1,canvas.height);
	}
	for(i=0;i<canvas.height/multiplier;i++){
		ctx.fillRect(0,multiplier+2+(multiplier*i),canvas.width,1);
	}
}
//if you see anything, show me (it sees if any database
//changes are made and tells disploop to display them)
firebase.auth().onAuthStateChanged(function(user){
	if(user){
		databaseRef.on("value", function(snapshot){
			extract(snapshot.val());
			dispLoop(databaseVals,keyArray);
			console.log(snapshot.val())
		});
	}
})
//defines x and y variables globally
var x;
var y;
//writes function for what to do when the mouse clicks
function onMouseClick(event){
	x = event.clientX;
	y = event.clientY;
	findGridPos(x,y);
}
//defines function to take the mouse coordinates and find the grid coordinates
function findGridPos(x,y){
	scrollPos=document.body.scrollTop;
	scrollSide=document.body.scrollLeft;
	x=Math.round(((x+scrollSide)/multiplier)+0.5);
	y=Math.round(((y-57+scrollPos)/multiplier)+0.5);
	console.log(x+','+y);
	document.getElementById('coorDisplay').innerHTML = 'X:'+x+' Y:'+y;
}
//adds event listeners to the document for arrow keys
window.addEventListener('keyup',onKeyUp);
window.addEventListener('keydown',onKeyDown);
//defines key wasd vars for canvas scrolling
var keyUp=false;//38
var keyDown=false;//40
var keyleft=false;//37
var keyRight=false;//39
//defines functions for keydown and keyup
function onKeyDown(e){
	console.log('!');
	var key = e.keyCode;
	switch(key){
	case 38:
		keyUp=true;
	break;
	case 40:
		keyDown=true;
	break;
	case 37:
		keyLeft=true;
	break;
	case 39:
		keyRight=true;
	break;
	}
}
function onKeyUp(e){
	var key = e.keyCode;
	switch(key){
	case 38:
		keyUp=false;
	break;
	case 40:
		keyDown=false;
	break;
	case 37:
		keyLeft=false;
	break;
	case 39:
		keyRight=false;
	break;
	}
}
//starts the map conversion process to extract the map