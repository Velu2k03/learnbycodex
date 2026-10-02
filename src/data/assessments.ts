export const assessments: Record<
  string,
  {
    title: string;
    objective: string;
    skills: string[];
    starter: string;
    preparation?: { explanation: string; code: string };
    tests: { name: string; expression: string }[];
  }
> = {
  "python-focus-planner": {
    title: "The reading planner",
    objective:
      "Write plan_reading(pages, per_session). Return (full_sessions, pages_left). Reject negative pages and a session size of zero or less with ValueError.",
    skills: ["Functions", "Integer division", "Input validation"],
    preparation: {
      explanation:
        "A function gives reusable steps a name: def starts it, inputs go in parentheses, and its body is indented. return sends a result to the caller; print only displays it. Two comma-separated values form a tuple, such as (2, 1). raise ValueError rejects an invalid input so the caller can handle it. Trace this different example first: what does pack_items(7, 3) return? Then adapt the idea to reading sessions below.",
      code: "def pack_items(items, box_size):\n    if items < 0 or box_size <= 0:\n        raise ValueError('Use non-negative items and a positive box size')\n    return (items // box_size, items % box_size)\n\nprint(pack_items(7, 3))  # (2, 1): two boxes, one item left",
    },
    starter:
      "def plan_reading(pages, per_session):\n    # Validate the inputs, then return two numbers.\n    pass\n",
    tests: [
      {
        name: "60 pages in groups of 25 → (2, 10)",
        expression: "plan_reading(60, 25) == (2, 10)",
      },
      {
        name: "24 pages in groups of 25 → (0, 24)",
        expression: "plan_reading(24, 25) == (0, 24)",
      },
      {
        name: "Zero pages → (0, 0)",
        expression: "plan_reading(0, 25) == (0, 0)",
      },
      {
        name: "Reject zero-sized sessions",
        expression: "raises_value_error(lambda: plan_reading(60, 0))",
      },
      {
        name: "Reject negative pages",
        expression: "raises_value_error(lambda: plan_reading(-1, 25))",
      },
    ],
  },
  "python-task-tracker": {
    title: "Count the completed work",
    objective:
      "Write completed_count(tasks). Each task is a dictionary with a done boolean. Return the number of completed tasks without changing the list.",
    skills: ["Lists", "Functions", "Boundary tests"],
    starter:
      "def completed_count(tasks):\n    # Count tasks whose done value is True.\n    pass\n",
    tests: [
      {
        name: "An empty list has zero completed tasks",
        expression: "completed_count([]) == 0",
      },
      {
        name: "A mixed list has one completed task",
        expression: "completed_count([{'done': True}, {'done': False}]) == 1",
      },
      {
        name: "Two completed tasks",
        expression: "completed_count([{'done': True}, {'done': True}]) == 2",
      },
      {
        name: "Unfinished tasks do not count",
        expression: "completed_count([{'done': False}]) == 0",
      },
      {
        name: "The original task list is unchanged",
        expression: "input_is_unchanged(completed_count)",
      },
    ],
  },
  "first-api-client": {
    title: "Validate an API response",
    objective:
      "Write summarize_repo(status, data). Return data['full_name'] for 200, 'Not found' for 404, 'Try later' for 429 or 500+, and 'Unexpected response' otherwise. Missing full_name returns 'Unnamed repository'. No network call is needed for these tests.",
    skills: ["HTTP status codes", "Dictionary access", "Error handling"],
    starter:
      "def summarize_repo(status, data):\n    # Turn success and failure responses into clear messages.\n    pass\n",
    tests: [
      {
        name: "A successful response returns the repository name",
        expression:
          "summarize_repo(200, {'full_name': 'velu/lab'}) == 'velu/lab'",
      },
      {
        name: "Handle a missing name",
        expression: "summarize_repo(200, {}) == 'Unnamed repository'",
      },
      {
        name: "Handle 404",
        expression: "summarize_repo(404, {}) == 'Not found'",
      },
      {
        name: "Handle rate limiting",
        expression: "summarize_repo(429, {}) == 'Try later'",
      },
      {
        name: "Handle a server error",
        expression: "summarize_repo(503, {}) == 'Try later'",
      },
      {
        name: "Handle another status",
        expression: "summarize_repo(201, {}) == 'Unexpected response'",
      },
    ],
  },
};
export function assessmentProgram(id: string, code: string) {
  const assessment = assessments[id];
  if (!assessment) throw new Error("Unknown assessment");
  return `${code}\n\nimport json as __boss_json\ndef raises_value_error(fn):\n    try:\n        fn()\n    except ValueError:\n        return True\n    return False\ndef input_is_unchanged(fn):\n    values = [{'done': True}, {'done': False}]\n    original = [dict(v) for v in values]\n    fn(values)\n    return values == original\n__boss_checks = []\n${assessment.tests.map((test) => `try:\n    __boss_ok = bool(${test.expression})\n    __boss_checks.append({'name': ${JSON.stringify(test.name)}, 'passed': __boss_ok})\nexcept Exception:\n    __boss_checks.append({'name': ${JSON.stringify(test.name)}, 'passed': False})`).join("\n")}\nprint('__LAB_CHECKS__' + __boss_json.dumps(__boss_checks))\n`;
}
