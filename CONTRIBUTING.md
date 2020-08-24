# Contributing to Hyperledger Citizens Pulse

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github

We use github to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html), So All Code Changes Happen Through Pull Requests

Pull requests are the best way to propose changes to the codebase (we use [Github Flow](https://guides.github.com/introduction/flow/index.html)). We actively welcome your pull requests:

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure that all tests pass.
5. Make sure your code lints.
6. Issue that pull request!

## Running the tests

To check if the changes work fine, run a few tests to ensure working of the core functionalities.

1. `cd` into the `network/tests` directory from project root. Run
   ```
   bash runAllTests.sh
   ```

### Break down of test scripts

1. registerUser.sh: Enrolls an admin and registers a user to the CA of a particular Org
2. authenticateUser.sh: Once authenticated, the user on login is provided a JWT token. All the subsequent requests sent by the user from the platform makes use of this token in the payload header.
3. createPlan.sh: This allows the Council user to be able to create a simple `plan-test`.
4. updownvote.sh: This enables the City registered user to upvote and downvote the `plan-test` created above.
5. endPolling.sh: End Polling stops polling for `plan-test`, deletes private collection for this plan and makes the votes public.

## Report bugs using Github's [issues](https://github.com/maniankara/hyperledger-citizens-pulse/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/maniankara/hyperledger-citizens-pulse/issues/new); it's that easy!

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can. Anything that can be used to reproduce the issue.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Use a Consistent Coding Style

- You can try
  - running `npm run lint` for style unification in node scripts
  - running `go fmt` for changes in Golang files

## License

By contributing, you agree that your contributions will be licensed under the GNU GENERAL PUBLIC LICENSE.

## References

This document was adapted from the open-source contribution guidelines for [Facebook's Draft](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md)
