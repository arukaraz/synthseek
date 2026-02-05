# Contributing to Synthseek

Thank you for your interest in contributing to Synthseek.

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [Issues](https://github.com/arukaraz/synthseek/issues)
2. If not, create a new issue using the Bug Report template
3. Include as much detail as possible: steps to reproduce, expected behavior, actual behavior, logs

### Suggesting Features

1. Check existing issues and discussions for similar ideas
2. Create a new issue using the Feature Request template
3. Describe the problem you're trying to solve and your proposed solution

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run lint and type checks
5. Commit your changes with a descriptive message
6. Push to your fork
7. Open a Pull Request

## Development Setup

### Prerequisites

- Node.js 22+
- npm

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/synthseek.git
cd synthseek

# Install dependencies
npm install

# Run development server
npm run dev
```

### Commands

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Fix lint issues
npm run lint:fix

# Run type check
npm run typecheck

# Run tests
npm run test
```

## Code Style

- TypeScript for all code
- ESLint and Prettier for formatting
- Follow existing patterns in the codebase
- Keep functions small and focused
- Add types for all function parameters and return values

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no code change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:

```
feat: add playlist import functionality
fix: resolve download timeout issue
docs: update installation instructions
```

## Pull Request Process

1. Ensure your code follows the project style
2. Run `npm run lint` and `npm run typecheck` with no errors
3. Update documentation if needed
4. Fill out the PR template completely
5. Link any related issues
6. Wait for review

## Questions?

Feel free to open a [Discussion](https://github.com/arukaraz/synthseek/discussions) for questions or ideas.
