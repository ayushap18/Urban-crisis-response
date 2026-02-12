import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock IntersectionObserver for virtualized lists or lazy loading
class IntersectionObserverMock {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
}

window.IntersectionObserver = IntersectionObserverMock;

// Mock window.scroll
window.scroll = jest.fn();
window.scrollTo = jest.fn();