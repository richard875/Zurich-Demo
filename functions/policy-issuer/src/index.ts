// What the web app imports to issue policies in-process when EVENTS_MODE=inline.
export { applicationSubmittedSchema, type ApplicationSubmitted } from './event';
export { issuePolicy, type IssueOutcome, type PolicyTable } from './issue-policy';
