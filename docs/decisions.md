# Decisions

Team decisions for Bargainu, newest first. Add an entry when the team agrees something that
changes how we work or what we build. Recorded on the date shown; the team is Yuta, Norty and Mizuki.

## 3. UI/UX: prototype 3, "Chirashi" (2026-10-05)

**Decision:** the app is built on prototype 3, the reference-driven design in a Japanese sale-flyer
style.

- Live: https://bargainu-prototypes.asakurayuta.workers.dev/3/
- Design system: [DESIGN.md](../DESIGN.md)
- Screenshots of every screen: [docs/design/reference/](design/reference/README.md)
- Code: [prototypes/3-reference/](../prototypes/3-reference/)

**Options considered:** three prototypes with the same screens and data, compared at
https://bargainu-prototypes.asakurayuta.workers.dev.

| # | Recipe | Outcome |
|---|---|---|
| 1 | frontend-design + web-design-guidelines + Emil Kowalski | not chosen |
| 2 | Impeccable + Taste Skill | not chosen |
| 3 | References from Awwwards and footer.design, motion from `fancy` | **chosen** |

How each was built is in [docs/design/recipes/](design/recipes/README.md).

**What follows:** UI work reads `DESIGN.md` first and uses its tokens. Prototypes 1 and 2 stay in
`prototypes/` as a record until the team decides to remove them.

## 2. Git branching: GitHub Flow (2026-10-05)

**Decision:** we use GitHub Flow.

![GitHub Flow: short branches off main, each merged back through a pull request and deployed](branching/1-github-flow.drawio.png)

How it works for us:

1. `main` is always deployable. Nobody commits to it directly.
2. Start each piece of work on a short branch off `main`, named for what it does:
   `feat/top-discounts`, `fix/login-redirect`.
3. Push the branch and open a pull request.
4. After review, merge the pull request into `main` and delete the branch.
5. Every merge to `main` is deployed.

**Options considered:** [GitHub Flow](branching/1-github-flow.drawio.png),
[Git Flow](branching/2-git-flow.drawio.png) and
[trunk-based development](branching/3-trunk-based.drawio.png). The editable diagrams are the
`.drawio` files next to each image.

**Not decided yet:** how many approvals a pull request needs, whether merges are squashed, and
whether `main` gets branch protection on GitHub.

## 1. Project management: Linear (2026-10-05)

**Decision:** work is tracked in Linear, in the Sidequest Club workspace, on the free plan.
Issue keys start with `SID-`.

**Not decided yet:** whether to connect Linear to GitHub so that branches and pull requests
update issues automatically.
