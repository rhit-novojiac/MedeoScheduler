import { createMemoryHistory } from '@tanstack/react-router';

// Electron loadURL / file:// URLs do not play well with standard browser history.
// We strictly use MemoryHistory.
const memoryHistory = createMemoryHistory({
    initialEntries: ['/'],
});

export default memoryHistory;
