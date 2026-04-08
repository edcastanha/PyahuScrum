import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock(
  'react-router-dom',
  () => ({
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Routes: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Route: ({ element }: { element: React.ReactNode }) => <>{element}</>,
    NavLink: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useParams: () => ({})
  }),
  { virtual: true }
);

jest.mock('./layout/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('./pages/dashboard/DashboardPage', () => ({
  __esModule: true,
  default: () => <h1>Dashboard Mock</h1>
}));

jest.mock('./pages/projects/ProjectsPage', () => ({
  __esModule: true,
  default: () => <div>Projects Mock</div>
}));

jest.mock('./pages/user-stories/UserStoriesPage', () => ({
  __esModule: true,
  default: () => <div>User Stories Mock</div>
}));

jest.mock('./pages/documentation/DocumentationPage', () => ({
  __esModule: true,
  default: () => <div>Documentation Mock</div>
}));

import App from './App';

test('renders app main route content', () => {
  render(<App />);
  const title = screen.getByText(/dashboard mock/i);
  expect(title).toBeInTheDocument();
});
