# Contributing to BTR

Thank you for considering contributing to this project!

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Install dependencies with `uv sync` inside `project-api/`
5. Make your changes
6. Run tests with `make test` inside `project-api/`
7. Commit your changes (pre-commit hooks will run automatically)
8. Push your branch and open a Pull Request

## Code Style

- Follow [PEP 8](https://pep8.org/) conventions
- Use [ruff](https://github.com/astral-sh/ruff) for linting and formatting
- Add type hints to all function signatures

## Testing

- Write tests for all new features and bug fixes
- Place tests in `project-api/src/tests/`
- Run test suite: `cd project-api && make test`
