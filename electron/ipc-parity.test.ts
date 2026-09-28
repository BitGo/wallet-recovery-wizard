// @vitest-environment node
// Contract test for the WRW IPC bridge. The bridge has three surfaces that must
// stay in lock-step, or a renderer call will fail at runtime with no handler:
//   1. declared  — the `Commands`/`Queries` types (renderer + preload)
//   2. exposed   — the `commands`/`queries` objects in the preload bridge
//   3. handled   — the `ipcMain.handle(...)` registrations in the main process
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function sourceFile(relPath: string): ts.SourceFile {
  const text = readFileSync(resolve(repoRoot, relPath), 'utf8');
  return ts.createSourceFile(
    relPath,
    text,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TS
  );
}

function memberName(node: ts.Node): string | undefined {
  return ts.isIdentifier(node) ? node.text : undefined;
}

// Keys of a `type Name = { methodA(...): ...; methodB(...): ... }` alias.
function typeAliasKeys(sf: ts.SourceFile, aliasName: string): string[] {
  const keys: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isTypeAliasDeclaration(node) &&
      node.name.text === aliasName &&
      ts.isTypeLiteralNode(node.type)
    ) {
      for (const member of node.type.members) {
        if (ts.isMethodSignature(member) || ts.isPropertySignature(member)) {
          const name = member.name ? memberName(member.name) : undefined;
          if (name) keys.push(name);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return keys;
}

// Keys of a `const name: SomeType = { methodA(...) {...}, ... }` object.
function objectKeys(sf: ts.SourceFile, variableName: string): string[] {
  const keys: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const prop of node.initializer.properties) {
        if (ts.isMethodDeclaration(prop) || ts.isPropertyAssignment(prop)) {
          const name = prop.name ? memberName(prop.name) : undefined;
          if (name) keys.push(name);
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return keys;
}

// Channel names registered via `ipcMain.handle('channel', ...)`.
function handledChannels(sf: ts.SourceFile): string[] {
  const channels: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'handle' &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'ipcMain' &&
      node.arguments.length >= 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      channels.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return channels;
}

const sorted = (values: string[]): string[] => [...values].sort();

const preload = sourceFile('electron/preload/index.ts');
const renderer = sourceFile('src/preload.d.ts');
const main = sourceFile('electron/main/index.ts');

const declared = {
  commands: typeAliasKeys(preload, 'Commands'),
  queries: typeAliasKeys(preload, 'Queries'),
};
const rendererDeclared = {
  commands: typeAliasKeys(renderer, 'Commands'),
  queries: typeAliasKeys(renderer, 'Queries'),
};
const exposed = {
  commands: objectKeys(preload, 'commands'),
  queries: objectKeys(preload, 'queries'),
};
const handled = handledChannels(main);

describe('IPC channel parity (declared vs exposed vs handled)', () => {
  it('preload declares exactly the commands it exposes', () => {
    expect(sorted(declared.commands)).toEqual(sorted(exposed.commands));
  });

  it('preload declares exactly the queries it exposes', () => {
    expect(sorted(declared.queries)).toEqual(sorted(exposed.queries));
  });

  it('renderer .d.ts declares the same command set as the preload', () => {
    expect(sorted(rendererDeclared.commands)).toEqual(
      sorted(declared.commands)
    );
  });

  it('renderer .d.ts declares the same query set as the preload', () => {
    expect(sorted(rendererDeclared.queries)).toEqual(sorted(declared.queries));
  });

  it('every declared command has a main-process handler', () => {
    const commandHandlers = handled.filter(channel =>
      declared.commands.includes(channel)
    );
    expect(sorted(commandHandlers)).toEqual(sorted(declared.commands));
  });

  it('every declared query has a main-process handler', () => {
    const queryHandlers = handled.filter(channel =>
      declared.queries.includes(channel)
    );
    expect(sorted(queryHandlers)).toEqual(sorted(declared.queries));
  });

  it('no handler is registered for an undeclared channel', () => {
    const declaredChannels = new Set([
      ...declared.commands,
      ...declared.queries,
    ]);
    const orphans = handled.filter(channel => !declaredChannels.has(channel));
    expect(orphans).toEqual([]);
  });

  it('no channel is handled more than once', () => {
    expect(new Set(handled).size).toBe(handled.length);
  });
});
