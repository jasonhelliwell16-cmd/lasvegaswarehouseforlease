// Sends a copy of every lead capture to the Helliwell CRE Platform (the
// central backend shared with multifamilylasvegas.com), in addition to the
// existing Web3Forms email notification, which stays the primary/only
// guaranteed path. Fire-and-forget: this must never block or break a form
// submission if the Platform is unreachable.
var PLATFORM_API_BASE = 'https://helliwell-cre-platform-production.up.railway.app';

// General contact-style leads (map lead modal, suite inquiry modal) — go
// through the same /v1/contact endpoint multifamilylasvegas.com uses,
// tagged division: 'industrial' so they land in the Industrial pipeline.
function notifyPlatform(data) {
  fetch(PLATFORM_API_BASE + '/v1/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      message: data.message,
      sourcePageUrl: window.location.href,
      division: 'industrial',
      propertyType: data.propertyType || undefined
    })
  }).catch(function () {
    // Silent on purpose — Web3Forms already handled the real notification.
  });
}

// The Space Requirements form captures the full tenant-fit criteria
// (size/budget/timeline/power/loading), so it goes through the dedicated
// tenant-rep assessment endpoint instead — runs the industrial AI matcher
// server-side and stores the result against the lead.
function notifyPlatformTenantRep(data) {
  fetch(PLATFORM_API_BASE + '/v1/assessments/tenant-rep', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      email: data.email || undefined,
      phone: data.phone,
      sizeNeeded: data.sizeNeeded,
      budget: data.budget,
      timeline: data.timeline,
      powerNeeds: data.powerNeeds || undefined,
      loadingRequirements: data.loadingRequirements || undefined,
      businessType: data.businessType || undefined
    })
  }).catch(function () {
    // Silent on purpose — Web3Forms already handled the real notification.
  });
}

// Newsletter/deal-alert signups aren't leads — they go into the real
// subscriber list rather than creating a contact/lead record. 409 (already
// subscribed) is expected and fine to ignore silently.
function notifyPlatformNewsletter(email) {
  fetch(PLATFORM_API_BASE + '/v1/newsletter/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email })
  }).catch(function () {});
}
