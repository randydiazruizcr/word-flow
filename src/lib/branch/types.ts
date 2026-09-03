export type TokenName = 'type' | 'project' | 'ticket' | 'slug';

export type TemplateNode = { kind: 'literal'; text: string } | { kind: 'token'; name: TokenName };

export type TemplateIssue =
    { kind: 'empty' } | { kind: 'unknown-token'; token: string } | { kind: 'unclosed-brace' };

export type ParsedTemplate = {
    nodes: TemplateNode[];
    issues: TemplateIssue[];
};

export type TokenValues = Record<TokenName, string>;

/** Un pedazo del nombre armado, con la marca de dónde salió. */
export type Segment = {
    text: string;
    source: 'literal' | TokenName;
};

export type RuleId =
    | 'empty'
    | 'leading-dash'
    | 'component-leading-dot'
    | 'trailing-dot'
    | 'lock-suffix'
    | 'double-dot'
    | 'at-brace'
    | 'single-at'
    | 'backslash'
    | 'space'
    | 'control-char'
    | 'special-char'
    | 'slash-edge'
    | 'double-slash'
    | 'too-long';

export type Issue = {
    rule: RuleId;
    severity: 'error' | 'warning';
    message: string;
};

export type ValidationResult = {
    status: 'ok' | 'warning' | 'error';
    issues: Issue[];
};
