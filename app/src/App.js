import React, { Component } from 'react';
import Keyboard from './Keyboard.js';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    // This binding is necessary to make `this` work in the callback
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
  }

  handleKeyDown(e) {
    console.log(e.key);
    const note = this.getNoteFromKey(e.key);
    this.playNote(note);
  }

  getNoteFromKey(key) {
    // note frequencies taken from http://www.sengpielaudio.com/calculator-notenames.htm
    switch(key) {
      case 'a': return 261.626; // C4 (middle C)
      case 'w': return 277.183; // C#4
      case 's': return 293.665; // D4
      case 'e': return 311.127; // D#4
      case 'd': return 329.628; // E4
      case 'f': return 349.228; // F4
      case 't': return 369.994; // F#4
      case 'g': return 391.995; // G4
      case 'y': return 415.305; // G#4
      case 'h': return 440.000; // A4
      case 'u': return 466.164; // A#4
      case 'j': return 493.883; // B4
      case 'k': return 523.251; // C5
      default:  return null;
    }
  }

  playNote(note) {
    if (note == null) return;

    var oscillator = this.audioCtx.createOscillator();
    var gainNode = this.audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    oscillator.type = 'triangle'; // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
    oscillator.frequency.value = note; // value in hertz
    oscillator.start();
    oscillator.stop(this.audioCtx.currentTime + 0.5);
  }

  render() { return <Keyboard/>; }
}

export default App;
