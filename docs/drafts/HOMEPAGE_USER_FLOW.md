# Homepage User Flow

Formula Universe Task H02 defines the target homepage user flow as a draft-only planning artifact. This document contains no TSX and does not authorize production integration, route changes, commits, or deployment. It describes the intended visitor journey for GPT review and Victor approval.

## Visitor

The flow begins with a visitor arriving on the homepage from search, direct navigation, a shared link, or an internal route. The visitor may have a precise task, such as finding a BMI calculator, or a broad goal, such as understanding health planning, finance calculations, unit conversions, or formula-based problem solving. The homepage must make the site identity clear immediately: Formula Universe is a place to calculate, understand, and continue into related tools and knowledge.

At this stage, the visitor needs orientation. The Hero should answer what the site is, what it can do, and what action is available now. The visitor should see a primary path to search or explore, plus visible proof that tools are organized, explainable, and connected.

## Discover

After initial orientation, the visitor enters discovery. Discovery may happen through the Hero search action, Featured Tools, Featured Topics, or a visible Universe Explorer prompt. The goal is to reduce the visitor’s decision burden. Instead of asking the visitor to understand the entire category taxonomy first, the homepage should offer curated entry points.

A visitor with a known need can choose a Featured Tool. A visitor with a vague need can choose a Featured Topic. A visitor who wants to browse can open the Universe Explorer. Discovery succeeds when the visitor moves from uncertainty to a narrower path.

## Explore

Exploration is the phase where the visitor compares available paths. In this phase, the homepage should reveal categories, topics, tool clusters, guide groups, or formula families. The visitor may scan health, finance, math, conversion, developer, date/time, and lifestyle areas. They may also notice a cluster that fits their goal, such as BMI → BMR → TDEE → Calories.

The Explore phase should be structured but not overwhelming. On mobile, it should use progressive disclosure and short cards. On desktop, it can use richer grids or grouped panels. The main purpose is to show the breadth of the universe while keeping next actions clear.

## Tool

Once the visitor selects a tool, the flow moves from homepage discovery into a calculator experience. The homepage’s role is to set the expectation that a tool is not only an input form but a guided experience with formulas, examples, result interpretation, FAQ, related tools, and caution where needed.

The Tool step should be reachable from Featured Tools, topic cards, Universe Explorer entries, Tool Clusters, Latest Guides, and footer popular links. This creates multiple valid paths to calculator entry while preserving a coherent internal graph.

## Knowledge

After or before using a tool, the visitor may need explanation. The Knowledge step connects calculator behavior with guides, formulas, examples, limitations, source notes, and editorial standards. For health or finance contexts, this step is especially important because users need to understand that calculator outputs are informational and not professional advice.

The homepage should make Knowledge visible through Knowledge Hub and Latest Guides. Tool pages should later connect back to knowledge articles, but the homepage must already signal that Formula Universe values explanation and trust.

## Related

The Related step appears when the visitor has used a tool or read a guide and needs the next logical resource. Related content can include related calculators, related formulas, related articles, topic hubs, or cluster steps. For example, after BMI, the visitor may be guided to BMR, TDEE, Calories, or Weight Loss resources. After a mortgage calculator, the visitor may see affordability, payment, amortization, and interest tools.

Related pathways should be intentional and reviewed. They should avoid unsafe claims, especially in medical or financial contexts. The purpose is to help users continue productively, not to imply diagnosis, treatment, guaranteed outcomes, or personalized advice.

## Journey

The final stage is Journey. A Journey is a connected sequence across tools and knowledge that helps the visitor complete a larger task. A Journey turns isolated calculator usage into a Formula Universe experience. It may begin at the homepage, continue into a tool, branch into a guide, return to related tools, and eventually form a complete path.

A strong Journey should be understandable in one sentence. For example, a health planning journey might be: calculate BMI, estimate BMR, estimate TDEE, plan calories, and track progress. A finance journey might be: estimate affordability, calculate payment, review amortization, compare interest, and read a guide about loan decisions. These journeys should remain educational and cautious.

## Flow diagram

```text
Visitor
  ↓
Discover
  ↓
Explore
  ↓
Tool
  ↓
Knowledge
  ↓
Related
  ↓
Journey
```

## Draft-only guardrail

This flow is a planning artifact only. It does not approve implementation. No code, TSX, production route, registry, deployment, or commit action is authorized by this document. The flow should wait for GPT review and Victor approval before any build step.
