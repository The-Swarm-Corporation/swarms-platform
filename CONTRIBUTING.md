# Contributing Guidelines 📜

We love your input! So please take a moment to review this document in order to make the contribution process easy and effective for everyone involved. Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project.

This document is NOT an arbitrary set of rules to be followed blindly, but rather a written down of the agreed upon standard. Of course this is a living document and subject to change, so feel free to submit pull requests to this document as well.

These rules only purpose is to improve code readability and quality and thus maintainability and overall project success. Whenever a rule is in conflict with this goal it should be challenged.

## What do I need to know to contribute? 🤝👩‍💻👨‍💻

Never made an open source contribution before? And wondering how to contribute to this project? 😕 No worries! Here's what you need.

### Installation

1. Fork the repo, clone your fork, and configure the remotes:

   ```sh
   # Clone your fork of the repo into the current directory
   git clone https://github.com/<your-username>/swarms-platform
   # Navigate to the newly cloned directory
   cd swarms-platform
   ```

2. If you cloned a while ago, get the latest changes from origin `main`:

   ```sh
   git checkout <main-branch>
   git pull origin <main-branch>
   ```

3. Create a new branch (off the main project branch) to contain your feature, change, or fix:

   ```sh
   git checkout -b <new-branch-name>
   ```

4. Install the dependencies 📦
   > As Swarms Platform uses an npm package manager, it is believed you've a node stable version installed, [install node][https://nodejs.org/en/download]
   
    ```sh
    npm install
    ```

5. Make .env.local file in root directory with these variables 📁
   > This step is NOT optional, Add this step if you want to run the complete web application in your terminal

    <!-- These environment variables are used for Supabase Local Dev -->
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    NEXT_PUBLIC_SUPABASE_URL=
    SUPABASE_SERVICE_ROLE_KEY=

6. Make and commit your changes following the [WARP](https://github.com/kyegomez/WARP?tab=readme-ov-file#warp) format. Please adhere to these guideline when it comes to [commit Structure](https://github.com/kyegomez/WARP?tab=readme-ov-file#types-of-changes) with [examples](https://github.com/kyegomez/WARP?tab=readme-ov-file#examples) and [best commit practices](https://github.com/kyegomez/WARP?tab=readme-ov-file#best-practices-for-using-warp).

7. Locally merge (or rebase) the main branch into your working branch:

   ```bash
   git pull origin main
   ```

8. Push your working branch up to your fork:

   ```bash
   git push -u origin <branch-name>
   ```

7. [Open a Pull Request](https://github.com/kyegomez/swarms-platform/pulls)
    with a clear title and description.

**IMPORTANT**: By submitting a patch, you agree to allow the project owner or maintainer to license your work under the same license as that used by the project.

8. Wait for the pull request to be reviewed by us and make appropriate changes if the maintainer recommends you to and submit it.


**IMPORTANT** to note that you cannot view the index UI on the browser or bypass the terminal error shown below without values for the env variables (NEXT_PUBLIC_SUPABASE_ANON_KEY & NEXT_PUBLIC_SUPABASE_URL).

```sh
⨯ Error: Your project's URL and Key are required to create a Supabase client!
Check your Supabase project's API settings to find these values
``` 

**Note:** _You can use random values if you intend to view the home page on the browser only._


## Setting up Supabase

**We encourage you setup your personal database on supabase if you're contributing on the dashboard**

Just like it's been mentioned earlier, [Supabase](https://supabase.com/) is the go to database for the project. If you are not familiar with supabase, do not worry, it is easy to setup.

These are some materials that hopefully you find helpful when setting up supabase.
1. [Supabase Docs](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
2. [FreeCodeCamp - Learn Supabase](https://www.freecodecamp.org/news/learn-supabase-open-source-firebase-alternative/)

### Authentication

To have access to Swarms platform's dashboard, a [supabase authentication](https://supabase.com/docs/guides/auth) is required. There are three authentication providers available, Email(Manual input), Github and Google.

To get Started:

1. We've provided a [schema](/schema.sql) which contains a user's data table, copy this and move to the `SQL editor` column on your dashboard, paste in the code editor. **Click on Run****
Go to the `Table` column to view your newly created table.

_Recommended to rename your query to users_

```sh
create table users (
  -- UUID from auth.users
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  -- The customer's billing address, stored in JSON format.
  billing_address jsonb,
  -- Stores your customer's payment instruments.
  payment_method jsonb
);
alter table users enable row level security;
create policy "Can view own user data." on users for select using (auth.uid() = id);
create policy "Can update own user data." on users for update using (auth.uid() = id);
```

2. Assign the right values to the supabase environment variables listed above


> Working with providers
   
### Setting up Github OAuth

To setup github client id and client secrets, we recommend going through the steps in the [Supabase Docs](https://supabase.com/docs/guides/auth/social-login/auth-github) or [Github Docs](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app).

**Note** that for the "Authorization callback URL" set as "https://<reference_id>.supabase.co/auth/v1/callback", the _https://<reference_id>.supabase.co_ is gotten from the API column in the project settings of the supabase dashboard, in this case.

The Github client id and secret also plays a role as they are included as values if Github is setup as a provider in Supabase Authentication column.

### Setting up Google OAuth

To setup google as a provider on supabase, we recommend going through the [Supabase Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)

if all these are setup correctly, then access to the dashboard is authorized for your contributions.


## Using the issue tracker

The repository [issue](https://github.com/kyegomez/swarms-platform/issues) page is the preferred channel for [bug reports](#bugs),
[features requests](#features) and [submitting pull
requests](#pull-requests), but please respect the following restrictions:

- Please **do not** use the issue tracker for personal support requests (use [Stack Overflow](http://stackoverflow.com) or AI models specifically for help including [ChatGPT](https://chat.openai.com/), [Blackbox](https://www.blackbox.ai/)).

- Please **do not** derail or troll issues. Keep the discussion on topic and respect the opinions of others.

<a name="bugs"></a>

### Bug reports

A bug is a _demonstrable problem_ that is caused by the code in the repository.
Good bug reports are extremely helpful—thank you!

Guidelines for bug reports:

1. **Use the GitHub issue search** — check if the issue has already been reported.

2. **Check if the issue has been fixed** — try to reproduce it using the latest `main` or `dev` branch in the repository.

3. **Isolate the problem** — create a [reduced test case](http://css-tricks.com/reduced-test-cases/) and a live example.

“Programs are meant to be read by humans and only incidentally for computers to execute.” — Harold Abelson

A good bug report shouldn’t leave others needing to chase you up for more information. Please try to be as detailed as possible in your report. 
> 1. What is your environment? 
> 2. What steps will reproduce the issue? 
> 3. What browser(s) and OS experience the problem? What would you expect to be the outcome? 
All these details will help people to fix any potential bugs.

Example:

> Short and descriptive example bug report title
>
> A summary of the issue and the browser/OS environment in which it occurs. If
> suitable, include the steps required to reproduce the bug.
>
> 1. This is the first step
> 2. This is the second step
> 3. Further steps, etc.
>
> Any other information you want to share that is relevant to the issue being reported. 
> This might include the lines of code that you have identified as causing the bug, 
> and potential solutions (and your opinions on their merits).

<a name="features"></a>

### Feature requests

Feature requests are welcome. But take a moment to find out whether your idea fits with the scope and aims of the project. It’s up to _you_ to make a strong case to convince the project’s developers of the merits of this feature. Please provide as much detail and context as possible.

<a name="pull-requests"></a>

### Pull requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests. They should remain focused in scope and avoid containing unrelated commits.

**Please ask first** before embarking on any significant pull request (e.g.
implementing features, refactoring code, e.t.c), it's important to discuss the changes with the repository owners through our channels on [discord](https://discord.com/channels/999382051935506503/999387347978301551).

Please adhere to the coding conventions used throughout a project (indentation, accurate comments, etc.) and any other requirements (such as file structure).

