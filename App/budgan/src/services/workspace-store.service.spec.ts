import { TestBed } from '@angular/core/testing';
import { ID_GENERATOR_SERVICE } from './id-generator.service';
import {
  WORKSPACE_STORE_SERVICE,
  WorkspaceStoreServiceImpl,
} from './workspace-store.service';
import { Workspace } from '../engine/workspace';

const FIXED_ID = 'test-uuid-1234';

describe('WorkspaceStoreServiceImpl', () => {
  let service: WorkspaceStoreServiceImpl;
  let mockIdGenerator: { generateId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockIdGenerator = { generateId: vi.fn().mockReturnValue(FIXED_ID) };
    TestBed.configureTestingModule({
      providers: [
        { provide: ID_GENERATOR_SERVICE, useValue: mockIdGenerator },
      ],
    });
    service = TestBed.inject(WorkspaceStoreServiceImpl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no workspace', () => {
    expect(service.workspace()).toBeNull();
  });

  describe('createWorkspace', () => {
    it('should call IdGeneratorService.generateId once', () => {
      service.createWorkspace('My Budget');
      expect(mockIdGenerator.generateId).toHaveBeenCalledTimes(1);
    });

    it('should set a Workspace with the generated ID and given name', () => {
      service.createWorkspace('My Budget');
      const ws = service.workspace();
      expect(ws).toBeInstanceOf(Workspace);
      expect(ws?.id).toBe(FIXED_ID);
      expect(ws?.name).toBe('My Budget');
    });

    it('should replace any previously held workspace', () => {
      mockIdGenerator.generateId
        .mockReturnValueOnce('id-1')
        .mockReturnValueOnce('id-2');
      service.createWorkspace('First');
      service.createWorkspace('Second');
      expect(service.workspace()?.id).toBe('id-2');
    });
  });

  describe('renameWorkspace', () => {
    beforeEach(() => service.createWorkspace('Original'));

    it('should update the name when the ID matches', () => {
      service.renameWorkspace(FIXED_ID, 'Renamed');
      expect(service.workspace()?.name).toBe('Renamed');
    });

    it('should keep the same ID after rename', () => {
      service.renameWorkspace(FIXED_ID, 'Renamed');
      expect(service.workspace()?.id).toBe(FIXED_ID);
    });

    it('should emit a new Workspace reference (signal update)', () => {
      const before = service.workspace();
      service.renameWorkspace(FIXED_ID, 'Renamed');
      expect(service.workspace()).not.toBe(before);
    });

    it('should do nothing when the ID does not match', () => {
      const before = service.workspace();
      service.renameWorkspace('wrong-id', 'Renamed');
      expect(service.workspace()).toBe(before);
    });
  });

  describe('deleteWorkspace', () => {
    beforeEach(() => service.createWorkspace('To Delete'));

    it('should set workspace to null when the ID matches', () => {
      service.deleteWorkspace(FIXED_ID);
      expect(service.workspace()).toBeNull();
    });

    it('should do nothing when the ID does not match', () => {
      service.deleteWorkspace('wrong-id');
      expect(service.workspace()).not.toBeNull();
    });
  });
});

describe('WORKSPACE_STORE_SERVICE token', () => {
  it('should resolve to a WorkspaceStoreServiceImpl instance', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ID_GENERATOR_SERVICE, useValue: { generateId: vi.fn() } },
        { provide: WORKSPACE_STORE_SERVICE, useClass: WorkspaceStoreServiceImpl },
      ],
    });
    const store = TestBed.inject(WORKSPACE_STORE_SERVICE);
    expect(store).toBeInstanceOf(WorkspaceStoreServiceImpl);
  });
});
