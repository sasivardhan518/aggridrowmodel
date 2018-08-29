export enum Behaviour {
    Nested = 'nested',
    Tabular = 'tabular',
    Replacement = 'replacement',
    None = 'none'
}

export interface ReportFormat {
    pages: Section;
    rows: Section;
    filters: Hierarchy;
    columns: Section;
}

interface Section {
    hierarchies: Hierarchy[];
}

export interface Attribute {
    name: string;
    description: string;
    appliedLists?: number[];
    values?: object[];
    isQuickFilter?: boolean;
    outputFilters?: object[];
}

interface Group {
    name: string;
    groupitems: Groupitem[];
}

interface Groupitem {
    name: string;
    values: object[];
}

interface List {
    id: number;
    name: string;
    values: object[];
}


export interface Hierarchy {
    attributes: { [index: string]: Attribute };
    type: Behaviour;
    currentAttribute?: string;
    order?: string[];
}




