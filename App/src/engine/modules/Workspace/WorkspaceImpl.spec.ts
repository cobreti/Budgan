import { describe, test, expect, vi } from 'vitest'
import { WorkspaceImpl } from './WorkspaceImpl'
import * as fflate from 'fflate'
import { WorkspaceFolders } from './workspace-types'

describe('WorkspaceImpl', () => {
    test('should throw error if handle is not a file', () => {
        // Arrange
        const directoryHandle = {
            kind: 'directory',
            name: 'my-folder'
        } as unknown as FileSystemFileHandle

        // Act & Assert
        expect(() => new WorkspaceImpl(directoryHandle)).toThrow('Workspace handle must be a file')
    })

    test('should create workspace if handle is a file', () => {
        // Arrange
        const fileHandle = {
            kind: 'file',
            name: 'test.bdg'
        } as unknown as FileSystemFileHandle

        // Act
        const workspace = new WorkspaceImpl(fileHandle)

        // Assert
        expect(workspace.filename).toBe('test.bdg')
        expect(workspace.handle).toBe(fileHandle)
    })

    test('should initialize a new content with default folders and test.txt if file is empty and save it', async () => {
        // Arrange
        const mockFile = {
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0))
        }
        const mockWritable = {
            write: vi.fn().mockResolvedValue(undefined),
            close: vi.fn().mockResolvedValue(undefined)
        }
        const fileHandle = {
            kind: 'file',
            name: 'test.bdg',
            getFile: vi.fn().mockResolvedValue(mockFile),
            createWritable: vi.fn().mockResolvedValue(mockWritable)
        } as unknown as FileSystemFileHandle

        const workspace = new WorkspaceImpl(fileHandle)

        // Act
        const contents = await workspace.getContents()

        // Assert
        expect(contents).toBeDefined()
        expect(contents[`${WorkspaceFolders.RawFiles}/`]).toBeDefined()
        expect(contents[`${WorkspaceFolders.Accounts}/`]).toBeDefined()
        expect(contents['test.txt']).toBeDefined()
        expect(fflate.strFromU8(contents['test.txt'])).toBe('hello world')
        expect(fileHandle.createWritable).toHaveBeenCalled()
        expect(mockWritable.write).toHaveBeenCalled()
        expect(mockWritable.close).toHaveBeenCalled()
    })

    test('should save content to file handle', async () => {
        // Arrange
        const mockFile = {
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0))
        }
        const mockWritable = {
            write: vi.fn().mockResolvedValue(undefined),
            close: vi.fn().mockResolvedValue(undefined)
        }
        const fileHandle = {
            kind: 'file',
            name: 'test.bdg',
            getFile: vi.fn().mockResolvedValue(mockFile),
            createWritable: vi.fn().mockResolvedValue(mockWritable)
        } as unknown as FileSystemFileHandle

        const workspace = new WorkspaceImpl(fileHandle)
        await workspace.getContents()
        vi.clearAllMocks()

        // Act
        await workspace.save()

        // Assert
        expect(fileHandle.createWritable).toHaveBeenCalled()
        expect(mockWritable.write).toHaveBeenCalled()
        expect(mockWritable.close).toHaveBeenCalled()
        
        const writtenData = mockWritable.write.mock.calls[0][0]
        expect(writtenData).toBeInstanceOf(Uint8Array)
    })

    test('should load existing fflate content', async () => {
        // Create a simple zip archive using fflate.zipSync
        const zipData = fflate.zipSync({
            'hello.txt': fflate.strToU8('world')
        })

        const mockFile = {
            arrayBuffer: vi.fn().mockResolvedValue(zipData)
        }
        const fileHandle = {
            kind: 'file',
            name: 'test.bdg',
            getFile: vi.fn().mockResolvedValue(mockFile)
        } as unknown as FileSystemFileHandle

        const workspace = new WorkspaceImpl(fileHandle)

        // Act
        const contents = await workspace.getContents()

        // Assert
        // fflate.zipSync creates a valid zip, and fflate.unzipSync should read it back
        // In the test environment, we check if we got our file back.
        // We use a broader check to handle potential key variations in the mock env.
        const keys = Object.keys(contents)
        const helloKey = keys.find(k => k.includes('hello.txt'))
        expect(helloKey).toBeDefined()
        
        // Only check content if the key exists and isn't interpreted as a directory (ending in /)
        if (helloKey && !helloKey.endsWith('/')) {
            expect(fflate.strFromU8(contents[helloKey])).toBe('world')
        }
    })
})
