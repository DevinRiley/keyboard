import React, { Component } from 'react';
import Key from './Key.js';

const MIDDLE_C = 60
const KEYBOARD_KEYS = ['a','w','s','e','d','f','t','g','y','h','u','j','k']
const OCTAVE_KEYS = ['z', 'x']
class Keyboard extends Component {

  constructor(props) {
    super(props);
    this.state = this.freshNotesState(MIDDLE_C);
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
    const { [e.key]: handler = ()=>{} } = this.keyDownMap();
    handler(e.key)
  }

  getOctaveFromKeypress(key) {
    switch(key) {
      case 'z': return (this.state.notes[0].value - 12);
      case 'x': return (this.state.notes[0].value + 12);
      default: return null
    }
  }

  handleKeyUp(e) {
    // this goofy line just destructures the function for the key press
    // from a map and defaults to a no-op function
    const { [e.key]: handler = ()=>{} } = this.keyUpMap();
    handler(e.key)
  }

  keyUpMap() {
    let map = {};

    KEYBOARD_KEYS.forEach(key => map[key] = this.stopNote.bind(this))
    OCTAVE_KEYS.forEach(key => map[key] = this.changeOctave.bind(this))

    return map
  }

  keyDownMap() {
    let map = {};

    KEYBOARD_KEYS.forEach(key => map[key] = this.startNote.bind(this))

    return map
  }

  startNote(key) {
    const note = this.getNoteFromKeypress(key)

    if (this.isAlreadyPlaying(note)) return

    const gain = this.play(this.frequencyOfNote(note));
    this.updateNotesState(note, gain);
  }
  
  stopNote(key) {
    this.updateNotesState(this.getNoteFromKeypress(key))
  }

  changeOctave(key) {
    this.setState(this.freshNotesState(this.getOctaveFromKeypress(key)))
  }

  updateNotesState(note, gain = null) {
    const notes = this.state.notes.slice(0);
    const values = notes.map(n => n.value);
    const noteState = notes[values.indexOf(note)];

    if (gain === null) this.fadeOut(noteState.gain);
    noteState.gain = gain;
    noteState.playing = !noteState.playing;

    this.setState({ notes: notes });
  }

  freshNotesState(c) {
    let notes;
    if (this.state && this.state.notes) {
      notes = this.state.notes.slice(0);
    } else {
      notes = this.buildNotes();
    }

    notes.forEach(note => note.playing && this.fadeOut(note.gain));

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

  fadeOut(gain) {
    gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 1.5);
  }

  getNoteFromKeypress(key) {
    if (!KEYBOARD_KEYS.includes(key)) return null;

    return this.state.notes.map(note => note.value)[KEYBOARD_KEYS.indexOf(key)];
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
    return this.state.notes.map(note =>
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
