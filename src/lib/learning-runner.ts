/** A deliberately small learning language. No JavaScript or Python is evaluated. */
export const PRACTICE_CODE_LIMITS = {
  sourceLength: 8000,
  lines: 200,
  nesting: 4,
  repeatCount: 40,
  operations: 4000,
  outputLines: 100,
  valueLength: 1000,
  expressionTokens: 150,
} as const;

export type PracticeCodeResult = {
  ok: boolean;
  output: string[];
  operations: number;
  error?: { line: number; message: string };
};

type Value = string | number;
type Expression =
  | { kind: "literal"; value: Value }
  | { kind: "name"; name: string }
  | { kind: "negative"; value: Expression }
  | { kind: "binary"; operator: string; left: Expression; right: Expression };
type Statement =
  | { kind: "print"; expression: Expression; line: number }
  | { kind: "assign"; name: string; expression: Expression; line: number }
  | { kind: "repeat"; expression: Expression; body: Statement[]; line: number };
type Token = { kind: "value"; value: Value } | { kind: "name" | "symbol"; value: string };

class PracticeError extends Error {
  constructor(public line: number, message: string) { super(message); }
}

function parseExpression(source: string, line: number): Expression {
  const tokens: Token[] = [];
  let index = 0;
  const fail = (message: string): never => { throw new PracticeError(line, message); };
  while (index < source.length) {
    const character = source[index];
    if (/\s/.test(character)) { index += 1; continue; }
    if (character === '"' || character === "'") {
      const quote = character;
      let value = "";
      let closed = false;
      index += 1;
      while (index < source.length) {
        const next = source[index++];
        if (next === quote) { closed = true; break; }
        if (next === "\\") {
          const escaped = source[index++];
          if (escaped === "n" || escaped === "r") fail("Print one line at a time: use another print() for a new line.");
          if (escaped !== "\\" && escaped !== '"' && escaped !== "'") fail("Use \\\\ to print a backslash, or put ordinary text inside quotes.");
          value += escaped;
        } else { value += next; }
      }
      if (!closed) fail("Close the text with a matching quote.");
      if (value.length > PRACTICE_CODE_LIMITS.valueLength) fail("This text is too long. Keep each value under 1,000 characters.");
      tokens.push({ kind: "value", value });
    } else if (/\d/.test(character)) {
      const match = source.slice(index).match(/^\d+(?:\.\d+)?/);
      if (!match) fail("Use an ordinary number, such as 3 or 2.5.");
      const value = Number(match![0]);
      if (!Number.isFinite(value) || Math.abs(value) > 1e12) fail("Use a number between −1 trillion and 1 trillion.");
      tokens.push({ kind: "value", value });
      index += match![0].length;
    } else if (/[A-Za-z_]/.test(character)) {
      const match = source.slice(index).match(/^[A-Za-z_][A-Za-z_0-9]*/)!;
      tokens.push({ kind: "name", value: match[0] });
      index += match[0].length;
    } else if ("+-*/()".includes(character)) {
      tokens.push({ kind: "symbol", value: character }); index += 1;
    } else { fail(`“${character}” is not part of practice code. Use text, numbers, names, +, −, × or ÷.`); }
    if (tokens.length > PRACTICE_CODE_LIMITS.expressionTokens) fail("This expression is too long. Split it into smaller steps.");
  }
  let cursor = 0;
  const symbol = (value: string) => tokens[cursor]?.kind === "symbol" && tokens[cursor]?.value === value;
  function primary(depth: number): Expression {
    if (depth > 16) fail("There are too many brackets. Split the expression into smaller steps.");
    const token = tokens[cursor++];
    if (!token) return fail("Add a value here, such as a number, a name or quoted text.");
    if (token.kind === "value") return { kind: "literal", value: token.value };
    if (token.kind === "name") return { kind: "name", name: token.value };
    if (token.value === "-") return { kind: "negative", value: primary(depth + 1) };
    if (token.value === "(") {
      const value = addition(depth + 1);
      if (!symbol(")")) fail("Close this expression with a matching ).");
      cursor += 1;
      return value;
    }
    return fail("Add a number, a name or quoted text here.");
  }
  function multiplication(depth: number): Expression {
    let left = primary(depth);
    while (symbol("*") || symbol("/")) {
      const operator = String(tokens[cursor++].value);
      left = { kind: "binary", operator, left, right: primary(depth) };
    }
    return left;
  }
  function addition(depth: number): Expression {
    let left = multiplication(depth);
    while (symbol("+") || symbol("-")) {
      const operator = String(tokens[cursor++].value);
      left = { kind: "binary", operator, left, right: multiplication(depth) };
    }
    return left;
  }
  const expression = addition(0);
  if (cursor !== tokens.length) fail("Separate values with an operator. Practice code does not support calls inside expressions.");
  return expression;
}

function parseProgram(source: string): Statement[] {
  const raw = source.replace(/\r\n?/g, "\n").split("\n");
  if (raw.length > PRACTICE_CODE_LIMITS.lines) throw new PracticeError(1, "Keep this activity under 200 lines.");
  const lines = raw.flatMap((text, index) => {
    if (!text.trim() || text.trimStart().startsWith("#")) return [];
    const whitespace = text.match(/^\s*/)?.[0] ?? "";
    if (/[^ ]/.test(whitespace)) throw new PracticeError(index + 1, "Indent with two spaces, without tabs.");
    if (whitespace.length % 2 !== 0) throw new PracticeError(index + 1, "Use two spaces for each level inside repeat.");
    return [{ text: text.trim(), indent: whitespace.length, line: index + 1 }];
  });
  let cursor = 0;
  function block(indent: number, depth: number): Statement[] {
    const result: Statement[] = [];
    while (cursor < lines.length && lines[cursor].indent >= indent) {
      const current = lines[cursor];
      if (current.indent !== indent) throw new PracticeError(current.line, "Only indent a line inside a repeat block, using two spaces.");
      cursor += 1;
      const repeated = current.text.match(/^repeat\s+(.+):$/);
      if (repeated) {
        if (depth >= PRACTICE_CODE_LIMITS.nesting) throw new PracticeError(current.line, "Use no more than four nested repeat blocks.");
        if (!lines[cursor] || lines[cursor].indent !== indent + 2) throw new PracticeError(current.line, "Add a line below repeat, indented with two spaces.");
        const expression = parseExpression(repeated[1], current.line);
        result.push({ kind: "repeat", expression, body: block(indent + 2, depth + 1), line: current.line });
        continue;
      }
      const printed = current.text.match(/^print\s*\((.*)\)$/);
      if (printed) { result.push({ kind: "print", expression: parseExpression(printed[1], current.line), line: current.line }); continue; }
      const assignment = current.text.match(/^([A-Za-z_][A-Za-z_0-9]*)\s*=\s*(.+)$/);
      if (assignment) {
        if (["print", "repeat"].includes(assignment[1])) throw new PracticeError(current.line, "Choose a variable name other than print or repeat.");
        result.push({ kind: "assign", name: assignment[1], expression: parseExpression(assignment[2], current.line), line: current.line });
        continue;
      }
      throw new PracticeError(current.line, "Use print(value), name = value, or repeat count: in this practice language.");
    }
    return result;
  }
  const statements = block(0, 0);
  if (statements.length === 0) throw new PracticeError(1, 'Start with a line such as print("Hello").');
  return statements;
}

/** Interprets only the grammar above, with fixed limits on every execution. */
export function runPracticeCode(source: string): PracticeCodeResult {
  const output: string[] = [];
  let operations = 0;
  let currentLine = 1;
  const variables = new Map<string, Value>();
  function spend() {
    operations += 1;
    if (operations > PRACTICE_CODE_LIMITS.operations) throw new PracticeError(currentLine, "This program has too many steps. Try fewer repeats.");
  }
  function bounded(value: Value): Value {
    if (typeof value === "string" && value.length > PRACTICE_CODE_LIMITS.valueLength) throw new PracticeError(currentLine, "This text grew too long. Keep each value under 1,000 characters.");
    if (typeof value === "number" && (!Number.isFinite(value) || Math.abs(value) > 1e12)) throw new PracticeError(currentLine, "This number is too large. Use a smaller calculation.");
    return value;
  }
  function evaluate(expression: Expression): Value {
    spend();
    if (expression.kind === "literal") return expression.value;
    if (expression.kind === "name") {
      const value = variables.get(expression.name);
      if (value === undefined) throw new PracticeError(currentLine, `Give ${expression.name} a value before using it.`);
      return value;
    }
    if (expression.kind === "negative") {
      const value = evaluate(expression.value);
      if (typeof value !== "number") throw new PracticeError(currentLine, "The minus sign needs a number.");
      return bounded(-value);
    }
    const left = evaluate(expression.left);
    const right = evaluate(expression.right);
    if (expression.operator === "+" && typeof left === "string" && typeof right === "string") return bounded(left + right);
    if (typeof left !== "number" || typeof right !== "number") throw new PracticeError(currentLine, "Use numbers for calculations, or join two pieces of text with +.");
    if (expression.operator === "+") return bounded(left + right);
    if (expression.operator === "-") return bounded(left - right);
    if (expression.operator === "*") return bounded(left * right);
    if (right === 0) throw new PracticeError(currentLine, "Division by zero has no defined result. Choose another divisor.");
    return bounded(left / right);
  }
  function execute(statements: Statement[]) {
    for (const statement of statements) {
      currentLine = statement.line;
      spend();
      const value = evaluate(statement.expression);
      if (statement.kind === "assign") { variables.set(statement.name, value); }
      else if (statement.kind === "print") {
        if (output.length >= PRACTICE_CODE_LIMITS.outputLines) throw new PracticeError(currentLine, "Output is limited to 100 lines. Try fewer repeats.");
        output.push(String(value));
      } else {
        if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > PRACTICE_CODE_LIMITS.repeatCount) throw new PracticeError(currentLine, "Repeat needs a whole number from 0 to 40.");
        for (let iteration = 0; iteration < value; iteration += 1) { execute(statement.body); }
      }
    }
  }
  try {
    if (typeof source !== "string" || source.length > PRACTICE_CODE_LIMITS.sourceLength) throw new PracticeError(1, "Keep this activity under 8,000 characters.");
    execute(parseProgram(source));
    return { ok: true, output, operations };
  } catch (error) {
    const failure = error instanceof PracticeError ? error : new PracticeError(currentLine, "This program could not run. Try a shorter expression.");
    return { ok: false, output, operations, error: { line: failure.line, message: failure.message } };
  }
}
