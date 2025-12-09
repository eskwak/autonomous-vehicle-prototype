/**
 * Description:       JS module for vehicle controller interface. Handles Firebase 
 *                    configuration, states, UI updates, and writing vehicle control 
 *                    commands to the firebase RTDB.
 * 
 * Author:            Eddie Kwak
 * Last Modified:     12/7/2025
 *  */ 

// firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  update
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGXfmSrV504OtG8232OJ1NKeNPC2y6s3o",
  authDomain: "autonomous-vehicle-985f1.firebaseapp.com",
  databaseURL: "https://autonomous-vehicle-985f1-default-rtdb.firebaseio.com",
  projectId: "autonomous-vehicle-985f1",
  storageBucket: "autonomous-vehicle-985f1.firebasestorage.app",
  messagingSenderId: "486094215958",
  appId: "1:486094215958:web:7a031f6af8bc88c8fc8e37",
  measurementId: "G-100C0RMZR8"
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const controlRef = ref(db, "car/control");

// states
let speed = 60;
let forward = true;
let turn = 0; // left = -1, straight = 0, right = 1
let accelerating = false;

// UI helpers
const dirLabel = document.getElementById("dirLabel");
const speedLabel = document.getElementById("speedLabel");
const turnLabel = document.getElementById("turnLabel");
const accelLabel = document.getElementById("accelLabel");

// updates UI labels to reflect current controls settings
function updateUI() {
  dirLabel.textContent = forward ? "FORWARD" : "REVERSE";
  speedLabel.textContent = speed.toString();

  if (turn === -1) {
    turnLabel.textContent = "LEFT";
  }
  else if (turn === 1) {
    turnLabel.textContent = "RIGHT";
  }
  else {
    turnLabel.textContent = "STRAIGHT";
  }
  accelLabel.textContent = accelerating ? "YES" : "NO";
}

// pushes current state to RTDB
function pushState() {
  update(controlRef, {speed, forward, turn, accelerating}).catch(console.error);
}

// increase speed button
document.getElementById("speedUpBtn").onclick = () => {
  speed = Math.min(100, speed + 10);
  updateUI();
  pushState();
};

// decrease speed button
document.getElementById("speedDownBtn").onclick = () => {
  speed = Math.max(60, speed - 10);
  updateUI();
  pushState();
};

// when movement button is pressed
function startMove(isForward, turnValue) {
  forward = isForward;
  turn = turnValue;
  accelerating = true;
  updateUI();
  pushState();
}

// when movement button is released
function stopMove() {
  accelerating = false;
  updateUI();
  pushState();
}

// web/mobile buttotn handlers for movement
function bindHoldButton(button, isForward, turnValue) {
  // mouse
  button.addEventListener("mousedown", () => startMove(isForward, turnValue));
  button.addEventListener("mouseup", stopMove);
  button.addEventListener("mouseleave", stopMove);

  // mobile 
  button.addEventListener("touchstart", e => {
    e.preventDefault();
    startMove(isForward, turnValue);
  });
  button.addEventListener("touchend", e => {
    e.preventDefault();
    stopMove();
  });
}

// direction buttons
const forwardBtn = document.getElementById("forwardBtn");
const backwardBtn = document.getElementById("backwardBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// bind buttons
bindHoldButton(forwardBtn, true, 0);
bindHoldButton(backwardBtn, false, 0);
bindHoldButton(leftBtn, true, -1);
bindHoldButton(rightBtn, true, 1);

updateUI();
pushState();