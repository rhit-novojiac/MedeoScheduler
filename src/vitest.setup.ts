import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Use vi.stubGlobal for window properties safely
vi.stubGlobal('api', {});
