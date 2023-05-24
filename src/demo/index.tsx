import { createRoot } from 'react-dom/client';
import { App } from './app';
import './style.css';

const el = document.createElement('div');
document.body.append(el);
const root = createRoot(el);
root.render(<App />);
