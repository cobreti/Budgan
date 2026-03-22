export type WorkspaceFolderTypeTable = {[key: string]: WorkspaceFolderType};

export type WorkspaceFolderType = {
    name: string
    folders: WorkspaceFolderTypeTable
}

export type WorkspaceFileTypeTable = {[key: string]: WorkspaceFileType};

export type WorkspaceFileType = {
    parentFolder: WorkspaceFolderType
    name: string
}

//
// structure of the workspace under root
//
export const WorkspaceFolders : WorkspaceFolderTypeTable = {
    rawFiles: {
        name: 'RawFiles',
        folders: {
            files: {
                name: 'Files',
                folders: {}
            },
            metadata: {
                name: 'Metadata',
                folders: {}
            }
        }
    },
    accounts: {
        name: 'Accounts',
        folders: {}
    }
}

//
// structure of the accounts under root/accounts/<accountid>
//
export const AccountFolders : WorkspaceFolderTypeTable = {
    transactions: {
        name: 'Transactions',
        folders: {}
    },
    metadata: {
        name: 'Metadata',
        folders: {}
    }
}

//
// files used internally
//
export const WorkspaceFiles : WorkspaceFileTypeTable = {

    // contains the table mapping each account to its folder
    accountsTable: {
        parentFolder: WorkspaceFolders.accounts,
        name: 'accountsTable.json'
    }
}
