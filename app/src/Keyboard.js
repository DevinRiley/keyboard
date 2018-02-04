import React, { Component } from 'react';
import Key from './Key.js';

class Keyboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: [
        {
          name: 'C4',
          playing: false
        },
        {
          name: 'C#4',
          playing: false
        },
        {
          name: 'D4',
          playing: false
        },
        {
          name: 'D#4',
          playing: false
        },
        {
          name: 'E4',
          playing: false
        },
        {
          name: 'F4',
          playing: false
        },
        {
          name: 'F#4', 
          playing:  false
        },
        {
          name: 'G4',
          playing: false
        },
        {
          name: 'G#4',
          playing:  false
        },
        {
          name: 'A4',
          playing: false
        },
        {
          name: 'A#4',
          playing:  false
        },
        {
          name: 'B4',
          playing: false
        },
        {
          name: 'C5',
          playing: false
        }
      ]
    }

    // This binding is necessary to make `this` work in the callback
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown, false);
    document.addEventListener("keyup", this.handleKeyUp, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown, false);
    document.removeEventListener("keyup", this.handleKeyUp, false);
  }

  isAlreadyPlaying(note) {
    let playing;

    this.state.notes.forEach((noteState, index) => {
      if (noteState.name === note) {
        playing = noteState.playing;
        return;
      }
    });

    return playing;
  }

  handleKeyDown(e) {
    const note = this.getNoteFromKeypress(e.key);
    // return early if note is already playing, since keydown event is fired
    // repeatedly while holding down a key
    if (this.isAlreadyPlaying(note)) return

    const gain = this.play(this.getFrequencyForNote(note));
    this.updateNotesState(note, gain);
  }

  handleKeyUp(e) {
    const note = this.getNoteFromKeypress(e.key);
    this.updateNotesState(note, null);
  }

  updateNotesState(note, gain) {
    const notes = this.state.notes.slice(0);

    notes.forEach((noteState) => {
      if (noteState.name === note) {
        if (gain === null) {
          // fade out
          noteState.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);
        }

        noteState.gain = gain;
        noteState.playing = !noteState.playing;
        return;
      }
    });

    this.setState({ notes: notes });
  }

  getFrequencyForNote(note) {
    // note frequencies taken from http://www.sengpielaudio.com/calculator-notenames.htm
    switch(note) {
      case 'C4':  return 261.626;
      case 'C#4': return 277.183;
      case 'D4':  return 293.665;
      case 'D#4': return 311.127;
      case 'E4':  return 329.628;
      case 'F4':  return 349.228;
      case 'F#4': return 369.994;
      case 'G4':  return 391.995;
      case 'G#4': return 415.305;
      case 'A4':  return 440.000;
      case 'A#4': return 466.164;
      case 'B4':  return 493.883;
      case 'C5':  return 523.251;
      default:    return null;
    }
  }

  getNoteFromKeypress(key) {
    switch(key) {
      case 'a': return 'C4';
      case 'w': return 'C#4';
      case 's': return 'D4';
      case 'e': return 'D#4';
      case 'd': return 'E4';
      case 'f': return 'F4';
      case 't': return 'F#4';
      case 'g': return 'G4';
      case 'y': return 'G#4';
      case 'h': return 'A4';
      case 'u': return 'A#4';
      case 'j': return 'B4';
      case 'k': return 'C5';
      default:  return null;
    }
  }

  play(frequency) {
    if (frequency == null) return;

    let oscillator = this.audioCtx.createOscillator();
    let gainNode = this.audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    oscillator.type = 'triangle'; // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
    oscillator.frequency.value = frequency; // value in hertz
    
    oscillator.start();

    return gainNode.gain;
  }

  renderKeys() {
    return this.state.notes.slice(0,-1).map(note =>
      <Key
        key={note.name}
        color={note.name.match(/#/) ? 'black' : 'white'}
        pressed={note.playing}
      />
    );
  }

  render() {
    return (
      <div className="keyboard">
       { this.renderKeys() }
      </div>
    );
  }
}

export default Keyboard;
