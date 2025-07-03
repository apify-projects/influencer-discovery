## What does Influencer Discovery Agent do?

Influencer Discovery Agent **helps you find the best influencers for your brand.** It combines **intelligent keyword generation, TikTok scraping, and AI-based influencer evaluation** to identify potential partnerships. 

All you need to do is **describe the ideal influencer** and what metrics they should fulfill. The Influencer Discovery Agent will then provide you with a list of possible influencers and detailed assessments of how well each candidate aligns with your requirements.

## What information can I get with the Influencer Discovery Agent?

<table>
<tr>
<td>👤 Profile name</td>
<td>📰 Average number of posts per week</td>
</tr>
<tr>
<td>📈 Engagement</td>
<td>🤝 Fit description</td>
</tr>
<tr>
<td>🎯 How the profile fits your description on a scale from 0 to 1</td>
<td>🔗 Profile link</td>
</tr>
</table>

## How do you discover and analyze influencers step-by-step?

1. [Create](https://console.apify.com/actors/Nz1OxzPJPFlChlJW6?addFromActorId=Nz1OxzPJPFlChlJW6) a free Apify account.
2. Open [Influencer Discovery Agent](https://apify.com/apify/influencer-discovery-agent).
3. Provide a description of your ideal influencers.
4. Additionally, you can add profile names directly if you already have some in mind.
5. Click "Start".
6. Download your results as JSON, CSV, Excel, HTML, or use the API.


## ⬇️ Input
The Influencer Discovery Agent requires an influencer description as the primary input. You can also add specific usernames for evaluation and configure the search parameters.
See an example input:
![Influencer Discovery Agent Input](https://raw.githubusercontent.com/apify-projects/actor-readme-images/refs/heads/master/influencer_discovery_agent_input1.png)
This is the same input, shown in JSON:
```json
{
  "influencerDescription": "The influencer should be a micro-influencer in the gaming industry with more than 2,000 followers. The content should be fast-paced, humorous, and centered on gaming for young adults.",
  "generatedKeywords": 5,
  "profilesPerKeyword": 10
}
```

## ⬆️ Output
Here's an example of the output:
![Influencer Discovery Agent output](https://raw.githubusercontent.com/apify-projects/actor-readme-images/refs/heads/master/influencer_discovery_agent_output1.png)
And here is an example output in JSON:
```json
{
    "profile": "mrbeast",
    "profileUrl": "https://www.tiktok.com/@mrbeast",
    "engagement": 1.23,
    "averagePostPerWeek": 2,
    "country": "US",
    "fit": 0.2,
    "fitDescription": "Enormous creator (118 M followers) known for challenge content, not primarily gaming; far from the requested “micro-influencer gaming” niche."
  }
```
## Integrate Influencer Discovery Agent and automate your workflows

Influencer Discovery Agent can be connected with almost any cloud service or web app thanks to [integrations](https://apify.com/integrations) on the Apify platform.

These include:

- [Make](https://docs.apify.com/platform/integrations/make)
- [Zapier](https://docs.apify.com/platform/integrations/zapier)
- [Slack](https://docs.apify.com/platform/integrations/slack)
- [Airbyte](https://docs.apify.com/platform/integrations/airbyte)
- [GitHub](https://docs.apify.com/platform/integrations/github)
- [Google Drive](https://docs.apify.com/platform/integrations/drive)
- and [much more](https://docs.apify.com/platform/integrations).

Alternatively, you can use webhooks to carry out an action whenever an event occurs.

## ❓ FAQ

### Which platforms are supported?

For now, only TikTok is supported.

### Can I export influencer data using API?

Yes, you can access the extracted data through the [Influencer Discovery Agent API](https://apify.com/apify/influencer-discovery-agent/api/python). You’ll need an Apify account and your **API token** (available under Integrations settings in the Console). The API is based on RESTful HTTP endpoints that allow you to manage, schedule, and run actors. You can fetch datasets, monitor performance, and integrate with other apps.

For further details, check the [API documentation](https://apify.com/apify/influencer-discovery-agent/api/python).

### Can I use Influencerd Discovery Agent through an MCP Server?

Yes, you can [integrate](https://apify.com/apify/influencer-discovery-agent/api/mcp) Influencer Discovery **Agent** with AI workflows via the **Model Context Protocol (MCP)**. Follow these steps:

1. Start a Server-Sent Events (SSE) session to receive a `sessionId`.
2. Use the `sessionId` to trigger the scraper.
3. The response should be: `Accepted`.

### Is it legal to scrape data from social media?

Our [social media scrapers](https://apify.com/store/categories/social-media-scrapers?managedBy=APIFY) operate ethically and extract only publicly available data. For further guidance, you can consult legal advice or check our blog on [ethical web scraping](https://blog.apify.com/what-is-ethical-web-scraping-and-how-do-you-do-it/).

## Not your cup of tea? Build your own Agent

Influencer Discovery Agent doesn’t exactly do what you need?

You can always build your own AI Agent on Apify! Use one of our [templates](https://apify.com/templates) in Python, JavaScript, and TypeScript to get started.

Alternatively, you can write it from scratch using our [open-source library Crawlee](https://crawlee.dev/?__hstc=160404322.99301e3ccb2984c883bfae3081ccc457.1711825637267.1751456752332.1751463835850.912&__hssc=160404322.3.1751463835850&__hsfp=1144682350). You can keep the Actor to yourself or make it public by adding it to Apify Store and [start making money](https://blog.apify.com/how-to-scrape-tiktok-tutorial/) on it.

Or let us know if you need a [custom solution](https://apify.com/custom-solutions).

## Your feedback

We’re always working on improving our Actors' performance. If you have any technical feedback for Influencer Discovery Agent or simply found a bug, please create an issue on the [Actor’s Issues tab](https://apify.com/apify/influencer-discovery-agent/issues/open) in Apify Console.
