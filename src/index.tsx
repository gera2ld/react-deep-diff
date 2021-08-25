import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import './style.css';

const root = document.createElement('div');
document.body.append(root);
ReactDOM.render(<App />, root);