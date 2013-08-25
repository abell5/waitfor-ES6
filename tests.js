"use strict";
var util = require("util");
var fs = require('fs'), dns = require("dns");
var wait = require("./waitfor");


// ----------------------
// DNS TESTS -------------
// ----------------------

function* showReverse(addr){
    console.log("reverse for " + addr + ": " + JSON.stringify(yield wait.for(dns.reverse,addr)));
}

function* sequential_resolve_parallel_reverse(hostname){

    console.log(dns.resolve4);
    console.log('dns.resolve4 ',hostname);
    var addresses = yield wait.for(dns.resolve4,hostname);
    console.log("addresses: ",JSON.stringify(addresses));
    for (var i = 0; i < addresses.length; i++) {
        wait.launchFiber(showReverse, addresses[i]);
    };
}


function* sequential_resolve_reverse_ES6(){
    var addresses = yield [dns.resolve4, "google.com"];
    for( let i=0; i<addresses.length; i++)
        var a=addresses[i];
        console.log("reverse for " + a + ": " + JSON.stringify( yield [dns.reverse,a] ));
}

// ----------------------
// OBJECT TESTS ---------
// ----------------------
function Constructor(value,pong){
    this.value = value;
    this.pong = pong;
}

Constructor.prototype.think=function(callback){
  if (!this) {
    var errMsg='ERR: this is null, at: Constructor.prototype.think';
    console.log(errMsg);
    callback(new Error(errMsg));
  } 
  else {
    console.log('thinking...');
    var self=this;
    // callback after 1.5 secs
    setTimeout(function(){
        callback(null, 'the answer is: '+self.value)}
        ,1500);
  }
};

Constructor.prototype.pingPong=function(ping,callback){
    // callback before return
    callback(null, ping+'...'+this.pong);
}


var theAnswer = new Constructor(42,'tomeito');
var theWrongAnswer = new Constructor('a thousand','tomatito');


// -------------------
// RUN TESTS (Fiber)--
// -------------------
function* runTests(hostname){

    console.log( yield wait.for ( fs.readFile, 'blogPost.txt', 'utf8' ) );
    console.log( yield [ fs.readFile, 'blogPost.txt', 'utf8' ] );
    return;

    console.log('--------------------------------');
    console.log('sequential_resolve_reverse_ES6');
    wait.launchFiber(sequential_resolve_reverse_ES6);
    console.log('--------------------------------');

    console.log('--------------------------------');
    console.log('resolve, then parallel reverse');
    wait.launchFiber(sequential_resolve_parallel_reverse,hostname);
    console.log('--------------------------------');

    //METHOD TEST (passing 'this' to the function)
    console.log(yield wait.forMethod(theAnswer,'think'));
    console.log(yield wait.forMethod(theWrongAnswer,'think'));
    
    console.log(yield wait.forMethod(theAnswer,'pingPong','tomato'));
    console.log(yield wait.forMethod(theWrongAnswer,'pingPong','pera'));

}

// MAIN
try{
    wait.launchFiber(runTests,"google.com");
} 
catch(e){
    console.log("Error: " + e.message);
};

