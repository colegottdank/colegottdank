# Project Instructions

## Communicating with Sketch (UI/Design Agent)

Sketch is a design-focused agent that handles UI/visual work in the `#sketch` Discord channel.

### When to use Sketch
- UI/UX changes, visual fixes, styling issues, layout problems
- Design reviews — ask Sketch to review your visual changes
- Don't give design direction — tell Sketch WHAT needs fixing, not HOW to style it

### Sending a message

You MUST mention `<@1465238762807099440>` or Sketch won't respond.
```bash
curl -s -X POST "https://discord.com/api/v10/channels/1468692375042785424/messages" \
  -H "Authorization: Bot $DISCORD_BOT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "<@1465238762807099440> Your message here"}'
```

### Reading replies

```bash
curl -s "https://discord.com/api/v10/channels/1468692375042785424/messages?limit=10" \
  -H "Authorization: Bot $DISCORD_BOT_TOKEN" | python3 -m json.tool
```

### Tips
- After asking Sketch to make changes, remind it to run the project's test suite
- Channel ID: `1468692375042785424` (#sketch)
- Sketch bot mention ID: `<@1465238762807099440>`
- Set `DISCORD_BOT_TOKEN` env var with the bot token

This hits the Discord API directly — no Mac Mini needed, works from anywhere.
