//Instrument Tuner - Ben Lamb O'Sullivan
//Contact - hi@benlambosullivan.com
//==================================================
//Based on Coding Challenge #151 YouTube video
//https://youtu.be/F1OkDTUkKFo
//by The Coding Train - Daniel Shiffman
//Mic status light based on the version by David Snyder
//https://editor.p5js.org/D_snyder/present/AERfQG31O
//of the same challenge.
//==================================================

//include ml5 pitch detection library & declare global variables
let model_url =
  'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
let pitch;
let mic;
let freq = 0;
let freqThreshold = 1;
let blosGreen = '#00ff9f';

let notes = [{
  instrument: 'UKULELE',  
  note: 'A',
  freq: 440
  },
  {
    instrument: 'UKULELE',
    note: 'E',
    freq: 329.6276
  },
  {
    instrument: 'UKULELE',
    note: 'C',
    freq: 261.6256
  },
  {
    instrument: 'UKULELE',
    note: 'G',
    freq: 391.9954
  }
];

let guitarNotes = [{
    instrument: 'GUITAR',
    note: 'E',
    freq: 82.41
  },
  {
    instrument: 'GUITAR',
    note: 'A',
    freq: 110
  },
  {
    instrument: 'GUITAR',
    note: 'D',
    freq: 146.83
  },
  {
    instrument: 'GUITAR',
    note: 'G',
    freq: 196
  },
  {
    instrument: 'GUITAR',
    note: 'B',
    freq: 246.94
  },
  {
    instrument: 'GUITAR',
    note: 'e',
    freq: 329.63
  }
];

let bassNotes = [{
    instrument: 'GUITAR',
    note: 'E',
    freq: 41
  },
  {
    instrument: 'GUITAR',
    note: 'A',
    freq: 55
  },
  {
    instrument: 'GUITAR',
    note: 'D',
    freq: 73
  },
  {
    instrument: 'GUITAR',
    note: 'G',
    freq: 98
  }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  audioContext = getAudioContext();
  audioContext.suspend();
  // userStartAudio().then(function() {
  //   mic = new p5.AudioIn();
  //   mic.start(listening);
  //   //print("running");
  //   //enable in browser -> check for mobile browsers & safari
  // });
}

function mousePressed() {
  userStartAudio().then(function() {
    mic = new p5.AudioIn();
    mic.start(listening);
    print("running");
    //enable in browser -> check for mobile browsers & safari
  });
}

function draw() {
  rectMode(CENTER);
  //General Design
  background(0);
  stroke(blosGreen);
  strokeWeight(2);
  noFill();
  rect(width / 2, height / 2, width - 5, height - 5);

  //onscreen text style
  textAlign(CENTER, CENTER);
  fill(blosGreen);
  noStroke();
  textSize(10);
  text("BEN LAMB O'SULLIVAN", width / 2, height - 12);
  textSize(20);
  text('TUNER', width / 2, 35);
  text('FREQUENCY', width / 2, height / 2 - 40);
  text('NOTE', width / 2, height - 100);
  textSize(65);
  text(freq.toFixed(2), width / 2, height / 2);

  //draw the mic status - red bad, green good
  textSize(15);
  stroke(255);
  strokeWeight(1);
  if (audioContext.state == "running")
    fill(blosGreen);
  else fill(255, 0, 0);
  circle(width / 2, height * 2 / 3, 15);
  //mic & note text should always be green
  fill(blosGreen);
  noStroke();
  text("MIC", width / 2, height * 2 / 3 - 20);

  //detect note being played by user
  let closestNote = -1;
  let recordDifference = Infinity;

  for (let i = 0; i < notes.length; i++) {
    let diff = freq - notes[i].freq;
    if (abs(diff) < abs(recordDifference)) {
      closestNote = notes[i];
      recordDifference = diff;
    }
  }
  //display note name & tuner mode
  textSize(20);
  text('MODE', width / 2, 165);
  textSize(60);
  text(closestNote.note, width / 2, height - 55);
  text(closestNote.instrument, width / 2, 205);

  let diff = recordDifference;

  //create pitch display
  //rect window - lights up as correct pitch is approached
  let alpha = map(abs(diff), 0, 200, 255, 0);
  fill(255, alpha);
  stroke(255);
  strokeWeight(4);
  if (abs(diff) < freqThreshold) {
    fill(blosGreen);
  }
  rect(width / 2, 100, 300, 50);

  //middle line to denote target
  stroke(255);
  strokeWeight(4);
  line(width / 2, 75, width / 2, 125);

  //frequecy pitch gauge
  noStroke();
  fill(blosGreen);
  if (abs(diff) < freqThreshold) {
    stroke(255);
    strokeWeight(random(4, 5));
  }
  rect((width / 2) + diff / 2, 100, 10, 45);
}
//==========FUNCTIONS==========
//listening function for when tuner is active - always listening for frequency
function listening() {
  // userStartAudio();
  // console.log('listening');
  pitch = ml5.pitchDetection(
    model_url,
    audioContext,
    mic.stream,
    modelLoaded);
}
//translates pitch into Hertz value when heard
//function disregards silence as null
function gotPitch(error, frequency) {
  if (error) {
    console.error(error);
  } else {
    if (frequency) {
      freq = frequency;
    }
  }
  pitch.getPitch(gotPitch);
}
//makes sure pitch variable is assigned & loaded
function modelLoaded() {
  // console.log('Model Loaded!');
  pitch.getPitch(gotPitch);
}
//allow window to be resized
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
//Check browser permissions for mic
window.addEventListener("click", () => {
  if (!audioContext || audioContext.state != "running") {
    setTimeOut(() => {
      audioContext = getAudioContext();
      audioContext.resume();
      print(audioContext.state);
      mic = new p5.AudioIn();
      mic.start(listening);
    }, 1000);
  }
});