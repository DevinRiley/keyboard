import React, { Component } from 'react';
import Key from './Key.js';

const MIDDLE_C = 60
const KEYS = ['a','w','s','e','d','f','t','g','y','h','u','j','k']
class Keyboard extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    this.state = this.resetState(MIDDLE_C);
    console.log("state: ", this.state);
    // This binding is necessary to make `this` work in the callback
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  buildNotes() {
    let notes = [];
    for (let i = 0; i < 13; i++) {
      notes.push({
        value: MIDDLE_C + i,
        playing: false
      })
    }

    return notes;
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
      if (noteState.value === note) {
        playing = noteState.playing;
        return;
      }
    });

    return playing;
  }

  handleKeyDown(e) {
    const note = this.getNoteFromKeypress(e.key);

    // Check if note is already playing. This is required because 
    // the keydown event is fired repeatedly while holding down a key
    if (note && !this.isAlreadyPlaying(note)) { 
      const gain = this.play(this.frequencyOfNote(note));
      this.updateNotesState(note, gain);
    }
  }

  getOctaveFromKeypress(key) {
    switch(key) {
      case 'z': return (this.state.notes[0].value - 12);
      case 'x': return (this.state.notes[0].value + 12);
      default: return null
    }
  }

  handleKeyUp(e) {
    const note = this.getNoteFromKeypress(e.key);
    const noteState = this.state.notes.find(n => n.value == note );
    const playing = noteState ? noteState.playing : false;

    const octave = this.getOctaveFromKeypress(e.key);
    if (octave) {
      this.setState(this.resetState(octave));
    } else if (note && playing) {
      this.updateNotesState(note, null);
    }
  }

  updateNotesState(note, gain) {
    const notes = this.state.notes.slice(0);
    const values = notes.map(n => n.value);

    if (values.includes(note))  {
      const noteState = notes[values.indexOf(note)];

      if (gain === null && noteState.gain) {
        noteState.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.5); // fade out
      }

      noteState.gain = gain;
      noteState.playing = !noteState.playing;
    } else {
      notes.push({ value: note, playing: true, gain: gain });
    }

    this.setState({ notes: notes });
  }

  resetState(c) {
    let notes;
    if (this.state.notes) {
      notes = this.state.notes.slice(0);
    } else {
      notes = this.buildNotes();
    }

    notes.forEach(note => note.playing && note.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.5));

    const newNotes = notes.map((_, index) => {
      return {
        value: c + index,
        playing: false
      }
    })

    return { notes: newNotes }
  }

  frequencyOfNote(note) {
    // frequency calculation from https://github.com/danigb/note-parser/blob/7d790602e9d0bb103829125c48a67619acb74368/index.js#L9
    return Math.pow(2, (note - 69) / 12) * 440
  }

  getNoteFromKeypress(key) {
    if (!KEYS.includes(key)) return null;

    return this.state.notes.map(note => note.value)[KEYS.indexOf(key)];
  }

  play(frequency) {
    if (frequency == null) return;

    let oscillator = this.audioCtx.createOscillator();
    let gainNode = this.audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    oscillator.type = 'triangle'; // triangle wave — other values are 'square', 'sawtooth', 'sine' and 'custom'
    oscillator.frequency.value = frequency; // value in hertz
    
    oscillator.start();

    return gainNode.gain;
  }

  renderKeys() {
    return this.state.notes.slice(0,-1).map(note =>
      <Key
        key={note.value}
        color={[1,3,6,8,10].includes(note.value % 12) ? 'black' : 'white'}
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
