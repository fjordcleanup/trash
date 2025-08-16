---
exampleContext:
  apiURL: "https://api.fjordcleanup.org"
  VERSION: "0.0.0-development"
---

# List reports

> As an unauthenticated user, I can query the reports using the public API.

## Initially there are no reports, yet

When I `GET` `${apiURL}/reports`

Then the status code of the last response should be `200`

And the `x-backend-version` header of the last response should be `${VERSION}`

And the last response should match

```json
{
  "@context": "https://trash.fjordcleanup.org/#context/page",
  "@item-context": "https://trash.fjordcleanup.org/#context/report"
}
```

And `{"len": $count($.items)}` of the last response should match

```json
{ "len": 0 }
```
