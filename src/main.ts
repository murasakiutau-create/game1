import { createApp } from './ui/app';
import './style.css';

const root = document.getElementById('app');
if (!root) throw new Error('#app not found');
createApp(root);
