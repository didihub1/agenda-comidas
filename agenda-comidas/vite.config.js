import { defineConfig } from 'vite';
import react from '@vitejsplugin-react';

export default defineConfig({
  plugins [react()],
  base '.'
});
